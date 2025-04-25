const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker/locale/zh_CN');
const TutorProfile = require('../models/TutorProfile');
const User = require('../models/User');

// 数据库连接配置
const MONGO_URI = 
  process.env.MONGODB_URI || 'mongodb://localhost:27017/smarttutor';

// 配置参数
const BATCH_SIZE = 50; // 每批处理50个教师数据

// 中国城市和区域数据
const CHINESE_CITIES = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '成都',
  '武汉',
  '南京',
  '西安',
];
const DISTRICTS = {
  北京: ['朝阳区', '海淀区', '西城区', '东城区', '丰台区'],
  上海: ['浦东新区', '徐汇区', '静安区', '黄浦区', '长宁区'],
  广州: ['天河区', '越秀区', '海珠区', '荔湾区', '白云区'],
  深圳: ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区'],
  杭州: ['西湖区', '上城区', '下城区', '拱墅区', '余杭区'],
  成都: ['锦江区', '青羊区', '金牛区', '武侯区', '成华区'],
  武汉: ['江岸区', '江汉区', '硚口区', '汉阳区', '武昌区'],
  南京: ['玄武区', '秦淮区', '建邺区', '鼓楼区', '栖霞区'],
  西安: ['新城区', '碑林区', '莲湖区', '雁塔区', '未央区'],
};

// 城市与省份对应关系
const CITY_PROVINCE_MAP = {
  '北京': '北京',  
  '上海': '上海',
  '广州': '广东',
  '深圳': '广东',
  '杭州': '浙江',
  '成都': '四川',
  '武汉': '湖北', 
  '南京': '江苏',
  '西安': '陕西'
};

// 各省份大学数据
const PROVINCE_UNIVERSITIES = {
  // 北京大学
  '北京': [
    '清华大学', '北京大学', '中国人民大学', '北京航空航天大学', 
    '北京师范大学', '中国农业大学', '北京理工大学', '北京交通大学', 
    '北京科技大学', '北京邮电大学', '中央民族大学', '中国政法大学',
    '对外经贸大学', '中央财经大学', '北京外国语大学', '首都师范大学'
  ],
  
  // 上海大学
  '上海': [
    '复旦大学', '上海交通大学', '同济大学', '华东师范大学', 
    '华东理工大学', '上海财经大学', '上海大学', '东华大学',
    '上海外国语大学', '上海海洋大学', '上海中医药大学', '上海师范大学'
  ],
  
  // 广东大学
  '广东': [
    '中山大学', '华南理工大学', '暨南大学', '华南师范大学',
    '广州大学', '深圳大学', '南方科技大学', '汕头大学' ,'佛山大学' ,'岭南师范学院'
  ],
  
  // 浙江大学
  '浙江': [
    '浙江大学', '宁波大学', '杭州电子科技大学', '浙江工业大学',
    '浙江师范大学', '浙江理工大学', '杭州师范大学', '温州大学'
  ],
  
  // 江苏大学
  '江苏': [
    '南京大学', '东南大学', '南京航空航天大学', '苏州大学',
    '南京师范大学', '南京理工大学', '河海大学', '南京农业大学'
  ],
  
  // 湖北大学
  '湖北': [
    '武汉大学', '华中科技大学', '中国地质大学(武汉)', '华中农业大学',
    '华中师范大学', '武汉理工大学', '中南财经政法大学', '湖北大学'
  ],
  
  // 陕西大学
  '陕西': [
    '西安交通大学', '西北工业大学', '西安电子科技大学', '长安大学',
    '西北大学', '陕西师范大学', '西安建筑科技大学', '西安理工大学'
  ],
  
  // 四川大学
  '四川': [
    '四川大学', '电子科技大学', '西南交通大学', '四川农业大学',
    '西南财经大学', '成都理工大学', '西华大学', '成都大学'
  ]
};

// 985和211大学列表
const UNIVERSITY_TIERS = {
  '985': [
    '清华大学', '北京大学', '中国人民大学', '北京航空航天大学', 
    '北京师范大学', '中国农业大学', '北京理工大学', '中央民族大学',
    '复旦大学', '上海交通大学', '同济大学', '华东师范大学', 
    '南京大学', '东南大学', 
    '武汉大学', '华中科技大学', 
    '中山大学', '华南理工大学',
    '四川大学', '电子科技大学',
    '西安交通大学', '浙江大学'
  ],
  '211': [
    // 985大学都是211大学
    '清华大学', '北京大学', '中国人民大学', '北京航空航天大学', 
    '北京师范大学', '中国农业大学', '北京理工大学', '中央民族大学',
    '复旦大学', '上海交通大学', '同济大学', '华东师范大学', 
    '南京大学', '东南大学', 
    '武汉大学', '华中科技大学', 
    '中山大学', '华南理工大学',
    '四川大学', '电子科技大学',
    '西安交通大学', '浙江大学',
    // 其他211大学
    '北京交通大学', '北京科技大学', '北京化工大学', '北京邮电大学',
    '北京林业大学', '北京中医药大学', '北京外国语大学', '中国政法大学',
    '上海财经大学', '华东理工大学', '东华大学', '上海外国语大学',
    '南京师范大学', '南京理工大学', '苏州大学', '华中师范大学',
    '华南师范大学', '西北工业大学', '陕西师范大学', '西南交通大学'
  ]
};

// 师范类院校列表
const NORMAL_UNIVERSITIES = [
  '北京师范大学', '华东师范大学', '华中师范大学', '华南师范大学',
  '南京师范大学', '陕西师范大学', '浙江师范大学', '北京师范大学',
  '首都师范大学', '上海师范大学', '杭州师范大学'
];

// 专业列表
const MAJORS = {
  '理工': [
    '数学与应用数学', '物理学', '化学', '生物科学', '统计学',
    '计算机科学与技术', '软件工程', '数据科学', '人工智能', 
    '电子信息工程', '通信工程', '自动化', '材料科学与工程'
  ],
  '文史': [
    '中国语言文学', '汉语言文学', '英语', '历史学', '哲学',
    '新闻学', '传播学', '编辑出版学'
  ],
  '经管': [
    '经济学', '金融学', '国际经济与贸易', '会计学', '财务管理',
    '工商管理', '市场营销', '人力资源管理'
  ],
  '教育': [
    '教育学', '学前教育', '小学教育', '心理学', '体育教育',
    '音乐教育', '美术教育'
  ]
};

// 生成成功案例
function generateSuccessCases(count = 2) {
  return Array.from({ length: count }, () => ({
    description: faker.helpers.arrayElement([
      '帮助学生从60分提升到90分',
      '指导学生获得学科竞赛奖项',
      '帮助学生考入重点学校',
      '培养学生良好的学习习惯',
      '显著提升学生学习兴趣',
    ]),
    improvement: faker.number.int({ min: 20, max: 80 }),
    duration: faker.number.int({ min: 8, max: 24 }),
  }));
}

// 生成科目信息
function generateSubjects(majorCategory, major) {
  // 根据专业类别和具体专业决定可能教授的科目
  let subjectPool = [];
  let minSubjects = 1;
  let maxSubjects = 3;
  
  // 各个专业最适合教授的科目映射
  const majorToSubjectsMap = {
    '数学与应用数学': ['数学'],
    '物理学': ['物理', '数学'],
    '化学': ['化学', '物理'],
    '生物科学': ['生物', '化学'],
    '统计学': ['数学'],
    '计算机科学与技术': ['数学', '信息技术'],
    '软件工程': ['数学', '信息技术'],
    '数据科学': ['数学', '信息技术'],
    '人工智能': ['数学', '信息技术'],
    '电子信息工程': ['物理', '信息技术'],
    '通信工程': ['物理', '数学'],
    '自动化': ['物理', '数学'],
    '中国语言文学': ['语文', '作文'],
    '汉语言文学': ['语文', '作文'],
    '英语': ['英语'],
    '历史学': ['历史', '政治'],
    '哲学': ['思想政治', '政治'],
    '经济学': ['政治', '历史', '数学'],
    '金融学': ['数学', '经济'],
    '国际经济与贸易': ['英语', '经济'],
    '工商管理': ['数学', '经济'],
    '教育学': ['语文', '数学', '英语', '物理', '化学', '生物'],
    '小学教育': ['语文', '数学', '英语'],
    '学前教育': ['思维训练', '综合素质'],
    '心理学': ['心理课程', '思想政治'],
    '体育教育': ['体育'],
    '音乐教育': ['音乐'],
    '美术教育': ['美术']
  };
  
  // 根据专业类别和具体专业获取可能教授的科目
  if (majorToSubjectsMap[major]) {
    // 如果有直接映射，优先使用
    subjectPool = [...majorToSubjectsMap[major]];
    // 专业对口的科目教学经验更丰富
    minSubjects = Math.min(1, subjectPool.length);
    maxSubjects = Math.min(subjectPool.length, 3);
  } else {
    // 根据专业类别选择科目
    switch (majorCategory) {
      case '理工':
        subjectPool = ['数学', '物理', '化学', '生物', '信息技术'];
        break;
      case '文史':
        subjectPool = ['语文', '历史', '地理', '政治', '作文'];
        break;
      case '经管':
        subjectPool = ['数学', '英语', '政治', '经济'];
        break;
      case '教育':
        subjectPool = ['语文', '数学', '英语', '思想政治', '心理课程'];
        break;
      default:
        subjectPool = ['数学', '语文', '英语', '物理', '化学', '生物'];
    }
  }
  
  // 如果没有可用科目，使用默认科目池
  if (subjectPool.length === 0) {
    subjectPool = ['数学', '语文', '英语', '物理', '化学', '生物'];
  }
  
  // 选择要教授的科目
  const selectedSubjects = faker.helpers.arrayElements(subjectPool, {
    min: minSubjects,
    max: maxSubjects,
  });
  
  // 生成年级分布
  // 根据专业决定适合教授的年级段
  let gradePool;
  if (majorCategory === '教育' && major.includes('小学')) {
    // 小学教育专业更加专注小学年级
    gradePool = [
      '小学一年级', '小学二年级', '小学三年级',
      '小学四年级', '小学五年级', '小学六年级'
    ];
  } else if (majorCategory === '教育' && major.includes('学前')) {
    // 学前教育专业仅教小学低年级
    gradePool = ['小学一年级', '小学二年级', '小学三年级'];
  } else if (major.includes('英语') || major === '外语') {
    // 英语专业可以教各个年级段
    gradePool = [
      '小学一年级', '小学二年级', '小学三年级',
      '小学四年级', '小学五年级', '小学六年级',
      '初中一年级', '初中二年级', '初中三年级',
      '高中一年级', '高中二年级', '高中三年级'
    ];
  } else if (majorCategory === '理工') {
    // 理工类更适合教高年级的学生
    gradePool = [
      '小学五年级', '小学六年级',
      '初中一年级', '初中二年级', '初中三年级',
      '高中一年级', '高中二年级', '高中三年级'
    ];
  } else {
    // 默认年级池
    gradePool = [
      '小学一年级', '小学二年级', '小学三年级',
      '小学四年级', '小学五年级', '小学六年级',
      '初中一年级', '初中二年级', '初中三年级',
      '高中一年级', '高中二年级', '高中三年级'
    ];
  }
  
  // 生成完整的科目信息
  return selectedSubjects.map((subject) => {
    // 根据科目调整年级选择
    let subjectGradePool = [...gradePool];
    
    // 特殊科目的年级调整
    if (['物理', '化学', '生物', '政治', '经济'].includes(subject)) {
      // 这些科目一般在高年级才有
      subjectGradePool = subjectGradePool.filter(grade => 
        !grade.includes('小学一年级') && 
        !grade.includes('小学二年级') && 
        !grade.includes('小学三年级')
      );
    }
    
    // 根据毕业时间决定教学经验
    const currentYear = new Date().getFullYear();
    const yearsAfterGraduation = currentYear - (major === '小学教育' ? 2018 : 2015);
    const maxExperience = Math.max(1, Math.min(10, yearsAfterGraduation));
    
    return {
      name: subject,
      grades: faker.helpers.arrayElements(subjectGradePool, { min: 2, max: 5 }),
      experience: faker.number.int({ min: 1, max: maxExperience }),
      successCases: generateSuccessCases(faker.number.int({ min: 1, max: 3 })),
    };
  });
}

// 生成教学时段
function generateSessions() {
  const days = ['周六', '周日'];
  const periods = ['早上', '下午', '晚上'];

  return faker.helpers.arrayElements(days, { min: 1, max: 2 }).flatMap((day) =>
    faker.helpers.arrayElements(periods, { min: 1, max: 3 }).map((period) => {
      let startTime, endTime;

      switch (period) {
        case '早上':
          startTime = '09:00';
          endTime = '12:00';
          break;
        case '下午':
          startTime = '14:00';
          endTime = '17:00';
          break;
        case '晚上':
          startTime = '19:00';
          endTime = '21:00';
          break;
      }

      return {
        day,
        period,
        available: faker.datatype.boolean(0.8), // 80%概率可用
        timeSlot: {
          startTime,
          endTime,
        },
        duration: 120,
        status: faker.helpers.arrayElement(['available', 'booked', 'blocked']),
      };
    })
  );
}

// 生成教师教学特长及优势
function generateTeachingStrengths(education, teachingExperience) {
  // 根据教育背景和教学经验生成教学特长
  const strengths = [];
  const keywords = [];
  
  // 大学层次对应的特长
  if (education.level === '985') {
    strengths.push('名校毕业，学科基础扎实');
    strengths.push('熟悉高难度考题解法');
    keywords.push('高质量');
    keywords.push('系统化');
  } else if (education.level === '211') {
    strengths.push('重点院校背景，教学经验丰富');
    keywords.push('专业精准');
  }
  
  // 师范类院校特长
  if (education.isNormalUniversity) {
    strengths.push('师范院校毕业，教学方法专业');
    keywords.push('因材施教');
  }
  
  // 专业类别对应的特长
  switch (education.majorCategory) {
    case '理工':
      strengths.push('逻辑思维强，操作步骤清晰');
      keywords.push('逻辑性强');
      break;
    case '文史':
      strengths.push('知识面广，表达能力强');
      keywords.push('含金量高');
      break;
    case '经管':
      strengths.push('思路清晰，方法高效');
      keywords.push('高效率');
      break;
    case '教育':
      strengths.push('教学方法专业，对学生心理把握准确');
      keywords.push('激发兴趣');
      break;
  }
  
  // 根据教学经验年限添加特长
  const years = teachingExperience.years;
  if (years >= 8) {
    strengths.push('资深教师，' + years + '年教学经验');
    keywords.push('经验丰富');
  } else if (years >= 5) {
    strengths.push('教学经验' + years + '年，案例丰富');
    keywords.push('案例丰富');
  } else if (years >= 3) {
    strengths.push('教学方法新颗，充满激情');
    keywords.push('激情活力');
  } else {
    strengths.push('新生代教师，教学理念新顷');
    keywords.push('期待成长');
  }
  
  // 根据主要科目添加特长
  const subjects = teachingExperience.subjects;
  if (subjects && subjects.length > 0) {
    const mainSubject = subjects[0].name;
    switch (mainSubject) {
      case '数学':
        strengths.push('数学知识点讲解透彻，技巧性强');
        keywords.push('思维训练');
        break;
      case '语文':
        strengths.push('对文字理解深刻，作文指导有方法');
        keywords.push('情景引导');
        break;
      case '英语':
        strengths.push('英语发音标准，语法讲解清晰');
        keywords.push('语言环境');
        break;
      case '物理':
        strengths.push('物理概念解析清晰，实验演示直观');
        keywords.push('实验演示');
        break;
      case '化学':
        strengths.push('化学反应原理讲解高效，公式记忆法独特');
        keywords.push('实验演示');
        break;
    }
  }
  
  // 保证返回数组不为空
  if (strengths.length === 0) {
    strengths.push('知识点讲解透彻');
    strengths.push('善于激发学生兴趣');
  }
  if (keywords.length === 0) {
    keywords.push('互动教学');
    keywords.push('因材施教');
  }
  
  // 去除重复项并限制数量
  const uniqueStrengths = [...new Set(strengths)].slice(0, 4);
  const uniqueKeywords = [...new Set(keywords)].slice(0, 5);
  
  return {
    strengths: uniqueStrengths,
    keywords: uniqueKeywords
  };
}

// 生成定价策略
function generatePricingStrategy(education, teachingExperience) {
  // 基础定价范围
  let basePriceRange = { min: 100, max: 300 };
  
  // 根据大学层次调整定价
  if (education.level === '985') {
    basePriceRange.min += 50;
    basePriceRange.max += 100;
  } else if (education.level === '211') {
    basePriceRange.min += 30;
    basePriceRange.max += 70;
  }
  
  // 根据是否师范类院校调整
  if (education.isNormalUniversity) {
    basePriceRange.min += 20;
    basePriceRange.max += 50;
  }
  
  // 根据教学经验调整
  const years = teachingExperience.years;
  basePriceRange.min += years * 5;
  basePriceRange.max += years * 10;
  
  // 根据主要科目调整
  const subjects = teachingExperience.subjects || [];
  if (subjects.length > 0) {
    const mainSubject = subjects[0].name;
    if (['数学', '物理', '化学'].includes(mainSubject)) {
      // 理科类定价略高
      basePriceRange.min += 20;
      basePriceRange.max += 40;
    } else if (['英语'].includes(mainSubject)) {
      // 英语也相对高一些
      basePriceRange.min += 10;
      basePriceRange.max += 30;
    }
    
    // 主要教授高中的教师定价更高
    const grades = subjects[0].grades || [];
    if (grades.some(g => g.includes('高中'))) {
      basePriceRange.min += 30;
      basePriceRange.max += 50;
    }
  }
  
  // 生成实际价格
  return {
    basePrice: faker.number.int({ min: basePriceRange.min, max: basePriceRange.max }),
    hourlyRate: faker.number.int({ min: Math.floor(basePriceRange.min * 1.2), max: Math.floor(basePriceRange.max * 1.2) }),
    packageDiscount: faker.number.float({ min: 0.85, max: 0.95, precision: 0.01 }),
  };
}

// 生成符合中国地理范围的坐标
function generateChinaCoordinates(city) {
  const cityRanges = {
    北京: { lon: [116.2, 116.5], lat: [39.8, 40.0] },
    上海: { lon: [121.4, 121.5], lat: [31.2, 31.3] },
    广州: { lon: [113.2, 113.3], lat: [23.1, 23.2] },
    深圳: { lon: [114.0, 114.1], lat: [22.5, 22.6] },
    杭州: { lon: [120.1, 120.2], lat: [30.2, 30.3] },
    成都: { lon: [104.0, 104.1], lat: [30.6, 30.7] },
    武汉: { lon: [114.2, 114.3], lat: [30.5, 30.6] },
    南京: { lon: [118.7, 118.8], lat: [32.0, 32.1] },
    西安: { lon: [108.9, 109.0], lat: [34.2, 34.3] },
  };

  const range = cityRanges[city] || { lon: [112, 123], lat: [20, 40] };
  return [
    faker.location.longitude(range.lon[0], range.lon[1]),
    faker.location.latitude(range.lat[0], range.lat[1]),
  ];
}

// 生成教师信息
function generateTutorProfile(user) {
  const city = faker.helpers.arrayElement(CHINESE_CITIES);
  const district = faker.helpers.arrayElement(DISTRICTS[city]);
  const coordinates = generateChinaCoordinates(city);

  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const gender = faker.person.sex();

  // 直接使用用户的customId作为tutorId，确保一致性
  const tutorId = user.customId;
  
  // 获取城市对应的省份
  const province = CITY_PROVINCE_MAP[city] || '北京';
  
  // 从该省的大学列表中选择一所大学
  const school = faker.helpers.arrayElement(PROVINCE_UNIVERSITIES[province] || PROVINCE_UNIVERSITIES['北京']);
  
  // 确定学校级别
  let level;
  if (UNIVERSITY_TIERS['985'].includes(school)) {
    level = '985';
  } else if (UNIVERSITY_TIERS['211'].includes(school)) {
    level = '211';
  } else {
    level = faker.helpers.arrayElement(['一本', '二本', '其他']);
  }
  
  // 确定是否为师范类院校
  const isNormalUniversity = NORMAL_UNIVERSITIES.includes(school);
  
  // 根据是否为师范类院校，选择专业类别和具体专业
  // 自定义加权随机选择函数（替代faker.helpers.weighted）
  function weightedRandom(options) {
    const weights = Object.values(options);
    const keys = Object.keys(options);
    
    // 计算权重和
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    // 生成一个0到1之间的随机数
    const random = Math.random() * totalWeight;
    
    // 根据权重选择
    let weightSum = 0;
    for (let i = 0; i < weights.length; i++) {
      weightSum += weights[i];
      if (random < weightSum) {
        return keys[i];
      }
    }
    
    // 默认返回最后一个选项
    return keys[keys.length - 1];
  }
  
  let majorCategory;
  if (isNormalUniversity) {
    // 师范类院校更可能选择教育类专业
    majorCategory = weightedRandom({
      '教育': 0.5,
      '文史': 0.2,
      '理工': 0.2,
      '经管': 0.1
    });
  } else {
    majorCategory = weightedRandom({
      '理工': 0.4,
      '文史': 0.2,
      '经管': 0.3,
      '教育': 0.1
    });
  }
  
  // 从专业类别中选择具体专业
  const major = faker.helpers.arrayElement(MAJORS[majorCategory]);
  
  // 获取毕业年份，越高级别的大学，毕业时间分布越广
  let minGradYear, maxGradYear;
  const currentYear = new Date().getFullYear();
  
  if (level === '985' || level === '211') {
    minGradYear = 2005;
    maxGradYear = currentYear - 1;
  } else {
    minGradYear = 2010;
    maxGradYear = currentYear - 1;
  }
  
  const graduationYear = faker.number.int({ min: minGradYear, max: maxGradYear });
  
  // 教学经验年限 - 同样的值在多处使用以保持一致性
  const yearsExperience = faker.number.int({ min: 1, max: 10 });
  
  // 生成科目列表 - 复用而不是重复生成
  const subjects = generateSubjects(majorCategory, major);
  
  // 教育背景对象
  const education = {
    level,
    school,
    province,
    majorCategory,
    major,
    isNormalUniversity,
    graduationYear,
  };
  
  // 教学经验对象
  const teachingExperience = {
    years: yearsExperience,
    subjects: subjects,
  };
  
  // 生成教学特长信息
  const { strengths, keywords } = generateTeachingStrengths(education, teachingExperience);
  const teachingStyle = {
    description: `${school}毕业，专业${major}，拥有${yearsExperience}年教学经验。对学生成长负责，能够针对学生个人特点设计个性化教学方案。教学风格生动活泼，善于启发学生思考。`,
    keywords,
    strengths
  };
  
  // 生成定价策略
  const pricing = generatePricingStrategy(education, teachingExperience);
  
  return {
    isVerified: faker.datatype.boolean(0.7), // 70%概率已验证
    verifiedAt: faker.datatype.boolean(0.7) ? faker.date.recent() : null,
    status: faker.helpers.arrayElement(['active', 'inactive', 'suspended']),
    tutorId,
    userId: user._id,
    firstName,
    lastName,
    gender,
    education,
    teachingExperience,
    teachingStyle,
    pricing,
    availabilityStatus: faker.helpers.arrayElement([
      'available',
      'busy',
      'offline',
    ]),
    schedule: {
      weekend: {
        sessions: generateSessions(),
        defaultTimes: {
          早上: { startTime: '09:00', endTime: '12:00' },
          下午: { startTime: '14:00', endTime: '17:00' },
          晚上: { startTime: '19:00', endTime: '21:00' },
        },
      },
    },
    location: {
      address: `${city}${district}${faker.location.streetAddress()}`,
      district,
      city,
      geo: {
        type: 'Point',
        coordinates,
      },
    },
    ratings: {
      overall: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
      teachingQuality: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
      attitude: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
      punctuality: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
      communication: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
      effectiveness: faker.number.float({ min: 3, max: 5, precision: 0.1 }),
    },
    statistics: {
      totalStudents: faker.number.int({ min: 5, max: 50 }),
      totalClasses: faker.number.int({ min: 20, max: 200 }),
      completionRate: faker.number.float({ min: 0.8, max: 1, precision: 0.01 }),
      repeatRate: faker.number.float({ min: 0.3, max: 0.9, precision: 0.01 }),
    },
  };
}

// 批量生成教师数据
async function generateTutorsBatch(tutorUsers, startIndex, batchSize) {
  const endIndex = Math.min(startIndex + batchSize, tutorUsers.length);
  const currentBatch = tutorUsers.slice(startIndex, endIndex);

  console.log(
    `处理批次 ${
      Math.floor(startIndex / batchSize) + 1
    }，用户索引 ${startIndex} 到 ${endIndex - 1}`
  );

  const tutorProfiles = [];
  const skippedIds = [];

  // 查找已存在的教师信息
  const existingTutorIds = new Set();
  const customIds = currentBatch.map((user) => user.customId);
  const existingTutors = await TutorProfile.find({
    tutorId: { $in: customIds },
  }).lean();

  existingTutors.forEach((tutor) => {
    existingTutorIds.add(tutor.tutorId);
  });

  // 为每个用户生成教师信息
  for (let i = 0; i < currentBatch.length; i++) {
    const user = currentBatch[i];
    const globalIndex = startIndex + i;

    // 检查是否已存在教师信息
    if (existingTutorIds.has(user.customId)) {
      skippedIds.push(user.customId);
      continue;
    }

    // 生成教师信息 - 直接使用user对象，确保tutorId与user.customId一致
    const tutorInfo = generateTutorProfile(user);
    tutorProfiles.push(tutorInfo);
  }

  // 批量插入教师信息
  let insertedCount = 0;
  if (tutorProfiles.length > 0) {
    try {
      const result = await TutorProfile.insertMany(tutorProfiles, {
        ordered: false,
      });
      insertedCount = result.length;
      console.log(`成功插入 ${insertedCount} 个教师信息`);
    } catch (error) {
      if (error.insertedDocs) {
        insertedCount = error.insertedDocs.length;
        console.log(
          `部分成功: 插入了 ${insertedCount}/${tutorProfiles.length} 个教师信息`
        );

        // 输出错误详情
        if (error.writeErrors && error.writeErrors.length > 0) {
          console.error(`错误数量: ${error.writeErrors.length}`);
          console.error('错误详情示例:');
          for (let e = 0; e < Math.min(5, error.writeErrors.length); e++) {
            try {
              const errorDetail = error.writeErrors[e];
              console.error(
                `- 错误 ${e + 1}: ${
                  errorDetail.err
                    ? errorDetail.err.errmsg || errorDetail.err.code
                    : JSON.stringify(errorDetail)
                }`
              );
              if (errorDetail.op) {
                console.error(`  教师ID: ${errorDetail.op.tutorId}`);
                console.error(`  用户ID: ${errorDetail.op.userId}`);
              }
            } catch (logError) {
              console.error(`- 无法解析错误 ${e + 1}: ${logError.message}`);
            }
          }
        }
      } else {
        console.error(`批量插入失败:`, error.message);
        throw error;
      }
    }
  }

  return {
    processed: currentBatch.length,
    inserted: insertedCount,
    skipped: skippedIds.length,
    skippedIds,
  };
}

// 主函数：为所有教师用户生成教师信息
async function generateTutors() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB 连接成功');

    // 查找所有角色为'tutor'的用户
    const tutorUsers = await User.find({ role: 'teacher' }).lean();
    console.log(`找到 ${tutorUsers.length} 个教师用户`);

    let createdCount = 0;
    let skippedCount = 0;

    // 批量生成教师信息
    for (let i = 0; i < tutorUsers.length; i += BATCH_SIZE) {
      const batchResult = await generateTutorsBatch(tutorUsers, i, BATCH_SIZE);
      createdCount += batchResult.inserted;
      skippedCount += batchResult.skipped;
    }

    console.log('=== 生成完成 ===');
    console.log(`总计: ${tutorUsers.length} 个教师用户`);
    console.log(`创建: ${createdCount} 个教师信息`);
    console.log(`跳过: ${skippedCount} 个已有教师信息的用户`);
  } catch (error) {
    console.error('生成教师信息时出错:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('数据库连接已关闭');
  }
}

// 执行脚本
generateTutors();
