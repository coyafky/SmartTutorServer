const { faker } = require('@faker-js/faker/locale/zh_CN');
const mongoose = require('mongoose');
const User = require('../models/User');

// 配置参数
const TOTAL_USERS = 5000; // 总共5000个用户
const BATCH_SIZE = 500; // 每批插入500个用户
const ADMIN_COUNT = 5; // 管理员数量
const TEACHER_RATIO = 0.3; // 教师比例30%

// 连接到MongoDB
mongoose.connect('mongodb://localhost:27017/smarttutor', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 中国城市数据
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
  '重庆',
  '天津',
  '苏州',
  '厦门',
  '青岛',
  '大连',
];

// 生成符合模型要求的时间戳ID
function generateCustomId(role) {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:TZ]/g, '')
    .slice(0, 14); // 14位时间戳

  const prefix = {
    teacher: 'TUTOR',
    parent: 'PARENT',
    admin: 'ADMIN',
  }[role];

  return `${prefix}_${timestamp}`;
}

// 生成随机坐标（中国范围内）
function generateCoordinates(city) {
  // 大城市坐标范围
  const cityRanges = {
    北京: { lon: [116.2, 116.5], lat: [39.8, 40.0] },
    上海: { lon: [121.4, 121.5], lat: [31.2, 31.3] },
    广州: { lon: [113.2, 113.3], lat: [23.1, 23.2] },
    深圳: { lon: [114.0, 114.1], lat: [22.5, 22.6] },
  };

  const range = cityRanges[city] || { lon: [73, 135], lat: [3, 53] };

  return [
    faker.number.float({
      min: range.lon[0],
      max: range.lon[1],
      precision: 0.0001,
    }),
    faker.number.float({
      min: range.lat[0],
      max: range.lat[1],
      precision: 0.0001,
    }),
  ];
}

// 生成用户位置信息
function generateLocation(city) {
  const coordinates = generateCoordinates(city);

  return {
    address: `${city}${faker.location.county()}${faker.location.streetAddress()}`,
    district: faker.location.county(),
    city: city,
    province: faker.location.state(),
    postalCode: faker.location.zipCode('######'),
    coordinates: {
      type: 'Point',
      coordinates: coordinates,
    },
  };
}

// 生成单个用户
function generateUser(role) {
  const city = faker.helpers.arrayElement(CHINESE_CITIES);
  const isVerified = faker.datatype.boolean(0.8); // 80%用户已验证

  return {
    customId: generateCustomId(role),
    username: `${role}_${faker.string.alphanumeric(8).toLowerCase()}`,
    password: faker.internet.password({ length: 12 }), // 12位密码
    role: role,
    avatar: faker.image.avatar(),
    status: faker.helpers.arrayElement(['active', 'inactive']),
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: faker.date.recent(),
    lastLoginAt: faker.date.recent(),
    verifiedAt: isVerified ? faker.date.past({ years: 1 }) : null,
    location: generateLocation(city),
    children: role === 'parent' ? generateChildren() : [],
  };
}

// 批量生成用户
async function generateUsers() {
  const teacherCount = Math.floor(TOTAL_USERS * TEACHER_RATIO);
  const parentCount = TOTAL_USERS - teacherCount;

  console.log(`开始生成 ${teacherCount} 位教师和 ${parentCount} 位家长...`);

  // 生成教师
  for (let i = 0; i < teacherCount; i += BATCH_SIZE) {
    const batch = Array.from(
      {
        length: Math.min(BATCH_SIZE, teacherCount - i),
      },
      () => generateUser('teacher')
    );

    await User.insertMany(batch);
    console.log(
      `已生成教师: ${Math.min(i + BATCH_SIZE, teacherCount)}/${teacherCount}`
    );
  }

  // 生成家长
  for (let i = 0; i < parentCount; i += BATCH_SIZE) {
    const batch = Array.from(
      {
        length: Math.min(BATCH_SIZE, parentCount - i),
      },
      () => generateUser('parent')
    );

    await User.insertMany(batch);
    console.log(
      `已生成家长: ${Math.min(i + BATCH_SIZE, parentCount)}/${parentCount}`
    );
  }
}

// 生成管理员
async function generateAdmins() {
  const admins = Array.from({ length: ADMIN_COUNT }, (_, i) => {
    const city = CHINESE_CITIES[i % CHINESE_CITIES.length];
    return {
      customId: `ADMIN_${(i + 1).toString().padStart(3, '0')}`,
      username: `admin_${i + 1}@smarttutor`,
      password: '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDqSh2QfB1g1w5p.lD6Ycc7Z7VNpyG', // 加密后的"admin123"
      role: 'admin',
      avatar: faker.image.avatar(),
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: new Date(),
      verifiedAt: new Date(),
      location: generateLocation(city),
    };
  });

  await User.insertMany(admins);
  console.log(`已生成 ${ADMIN_COUNT} 位管理员`);
}

// 主函数
async function main() {
  try {
    // 清空现有用户集合
    await User.deleteMany({});
    console.log('已清空用户集合');

    // 生成管理员
    await generateAdmins();

    // 生成普通用户
    await generateUsers();

    console.log('用户数据生成完成');
  } catch (error) {
    console.error('生成用户时出错:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// 执行
main();
