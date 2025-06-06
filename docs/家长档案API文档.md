# 智能家教推荐系统 API 文档 - 家长档案管理

本文档提供了智能家教推荐系统中与家长档案管理相关的 API 接口详细信息，方便在 Postman 中进行测试。

## 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: JWT Token (在需要认证的接口中，需要在请求头中添加 `Authorization: Bearer <token>`)

## 家长档案接口

### 1. 创建家长档案

- **URL**: `/parent-profiles`
- **方法**: `POST`
- **认证**: 需要 (家长角色)
- **描述**: 创建新的家长档案
- **请求头**:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "parentId": "PARENT_20250316123456", // 应与用户的 customId 一致
    "nickname": "家长昵称",
    "location": {
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "address": "科技园路1号"
    },
    "contactInfo": {
      "phone": "13800138000",
      "email": "parent@example.com",
      "wechat": "wechat_id"
    },
    "preferences": {
      "preferredGender": "不限", // 可选值: "男", "女", "不限"
      "preferredAgeRange": {
        "min": 25,
        "max": 45
      },
      "preferredTeachingStyle": ["耐心", "严格", "活泼"],
      "preferredQualifications": ["本科", "研究生"],
      "otherRequirements": "希望老师有丰富的教学经验"
    }
  }
  ```
- **成功响应** (201):
  ```json
  {
    "status": "success",
    "data": {
      "parentId": "PARENT_20250316123456",
      "nickname": "家长昵称",
      "location": {
        "province": "广东省",
        "city": "深圳市",
        "district": "南山区",
        "address": "科技园路1号"
      },
      "contactInfo": {
        "phone": "13800138000",
        "email": "parent@example.com",
        "wechat": "wechat_id"
      },
      "preferences": {
        "preferredGender": "不限",
        "preferredAgeRange": {
          "min": 25,
          "max": 45
        },
        "preferredTeachingStyle": ["耐心", "严格", "活泼"],
        "preferredQualifications": ["本科", "研究生"],
        "otherRequirements": "希望老师有丰富的教学经验"
      },
      "children": [],
      "statistics": {
        "requestsPosted": 0,
        "tutorsHired": 0,
        "totalSpent": 0
      },
      "status": "active",
      "createdAt": "2025-03-16T08:16:23.000Z",
      "updatedAt": "2025-03-16T08:16:23.000Z"
    }
  }
  ```
- **错误响应** (400):
  ```json
  {
    "status": "error",
    "message": "家长档案创建失败: 缺少必要字段"
  }
  ```

### 2. 获取家长档案

- **URL**: `/parent-profiles/:parentId`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取指定家长的档案信息
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "profile": {
        "parentId": "PARENT_20250316123456",
        "nickname": "家长昵称",
        "location": {
          "province": "广东省",
          "city": "深圳市",
          "district": "南山区",
          "address": "科技园路1号"
        },
        "contactInfo": {
          "phone": "13800138000",
          "email": "parent@example.com",
          "wechat": "wechat_id"
        },
        "preferences": {
          "preferredGender": "不限",
          "preferredAgeRange": {
            "min": 25,
            "max": 45
          },
          "preferredTeachingStyle": ["耐心", "严格", "活泼"],
          "preferredQualifications": ["本科", "研究生"],
          "otherRequirements": "希望老师有丰富的教学经验"
        },
        "children": [],
        "statistics": {
          "requestsPosted": 0,
          "tutorsHired": 0,
          "totalSpent": 0
        },
        "status": "active",
        "createdAt": "2025-03-16T08:16:23.000Z",
        "updatedAt": "2025-03-16T08:16:23.000Z"
      }
    }
  }
  ```
- **错误响应** (404):
  ```json
  {
    "status": "error",
    "message": "未找到家长档案"
  }
  ```

### 3. 更新家长档案

- **URL**: `/parent-profiles/:parentId`
- **方法**: `PUT`
- **认证**: 需要 (家长角色)
- **描述**: 更新家长档案信息
- **请求头**:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "nickname": "新昵称",
    "location": {
      "province": "广东省",
      "city": "广州市",
      "district": "天河区",
      "address": "天河路1号"
    },
    "preferences": {
      "preferredGender": "女",
      "preferredTeachingStyle": ["耐心", "活泼"]
    }
  }
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "profile": {
        "parentId": "PARENT_20250316123456",
        "nickname": "新昵称",
        "location": {
          "province": "广东省",
          "city": "广州市",
          "district": "天河区",
          "address": "天河路1号"
        },
        "contactInfo": {
          "phone": "13800138000",
          "email": "parent@example.com",
          "wechat": "wechat_id"
        },
        "preferences": {
          "preferredGender": "女",
          "preferredAgeRange": {
            "min": 25,
            "max": 45
          },
          "preferredTeachingStyle": ["耐心", "活泼"],
          "preferredQualifications": ["本科", "研究生"],
          "otherRequirements": "希望老师有丰富的教学经验"
        },
        "children": [],
        "statistics": {
          "requestsPosted": 0,
          "tutorsHired": 0,
          "totalSpent": 0
        },
        "status": "active",
        "updatedAt": "2025-03-16T08:30:23.000Z"
      }
    }
  }
  ```
- **错误响应** (404):
  ```json
  {
    "status": "error",
    "message": "未找到家长档案"
  }
  ```

### 4. 删除家长档案

- **URL**: `/parent-profiles/:parentId`
- **方法**: `DELETE`
- **认证**: 需要 (家长角色)
- **描述**: 删除家长档案 (实际上是将状态设置为 inactive)
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **成功响应** (204): 无内容
- **错误响应** (404):
  ```json
  {
    "status": "error",
    "message": "未找到家长档案"
  }
  ```

## 子女信息管理接口

### 1. 添加子女信息

- **URL**: `/parent-profiles/:parentId/children`
- **方法**: `POST`
- **认证**: 需要 (家长角色)
- **描述**: 为家长添加子女信息
- **请求头**:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "name": "张小明",
    "gender": "男", // 可选值: "男", "女"
    "age": 10,
    "grade": "小学四年级",
    "school": "深圳市实验小学",
    "subjects": [
      {
        "name": "数学",
        "level": "中等", // 可选值: "优秀", "良好", "中等", "较差"
        "targetScore": 90,
        "learningNeeds": "提高解题速度和准确率"
      },
      {
        "name": "英语",
        "level": "较差",
        "targetScore": 85,
        "learningNeeds": "提高听力和口语能力"
      }
    ],
    "learningStyle": "视觉学习型",
    "personality": "内向",
    "hobbies": ["阅读", "绘画"],
    "specialNeeds": "注意力不集中"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "status": "success",
    "data": {
      "child": {
        "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
        "name": "张小明",
        "gender": "男",
        "age": 10,
        "grade": "小学四年级",
        "school": "深圳市实验小学",
        "subjects": [
          {
            "name": "数学",
            "level": "中等",
            "targetScore": 90,
            "learningNeeds": "提高解题速度和准确率"
          },
          {
            "name": "英语",
            "level": "较差",
            "targetScore": 85,
            "learningNeeds": "提高听力和口语能力"
          }
        ],
        "learningStyle": "视觉学习型",
        "personality": "内向",
        "hobbies": ["阅读", "绘画"],
        "specialNeeds": "注意力不集中"
      }
    }
  }
  ```
- **错误响应** (404):
  ```json
  {
    "status": "error",
    "message": "未找到家长档案"
  }
  ```

### 2. 获取子女信息列表

- **URL**: `/parent-profiles/:parentId/children`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取指定家长的所有子女信息
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "children": [
        {
          "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
          "name": "张小明",
          "gender": "男",
          "age": 10,
          "grade": "小学四年级",
          "school": "深圳市实验小学",
          "subjects": [
            {
              "name": "数学",
              "level": "中等",
              "targetScore": 90,
              "learningNeeds": "提高解题速度和准确率"
            },
            {
              "name": "英语",
              "level": "较差",
              "targetScore": 85,
              "learningNeeds": "提高听力和口语能力"
            }
          ],
          "learningStyle": "视觉学习型",
          "personality": "内向",
          "hobbies": ["阅读", "绘画"],
          "specialNeeds": "注意力不集中"
        }
      ]
    }
  }
  ```
- **错误响应** (404):
  ```json
  {
    "status": "error",
    "message": "未找到家长档案"
  }
  ```

### 3. 获取单个子女信息

- **URL**: `/parent-profiles/:parentId/children/:childId`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取指定子女的详细信息
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "child": {
        "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
        "name": "张小明",
        "gender": "男",
        "age": 10,
        "grade": "小学四年级",
        "school": "深圳市实验小学",
        "subjects": [
          {
            "name": "数学",
            "level": "中等",
            "targetScore": 90,
            "learningNeeds": "提高解题速度和准确率"
          },
          {
            "name": "英语",
            "level": "较差",
            "targetScore": 85,
            "learningNeeds": "提高听力和口语能力"
          }
        ],
        "learningStyle": "视觉学习型",
        "personality": "内向",
        "hobbies": ["阅读", "绘画"],
        "specialNeeds": "注意力不集中"
      }
    }
  }
  ```
- **错误响应** (404):
  ```json
  {
    "status": "error",
    "message": "未找到子女信息"
  }
  ```

### 4. 更新子女信息

- **URL**: `/parent-profiles/:parentId/children/:childId`
- **方法**: `PUT`
- **认证**: 需要 (家长角色)
- **描述**: 更新子女信息
- **请求头**:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "age": 11,
    "grade": "小学五年级",
    "subjects": [
      {
        "name": "数学",
        "level": "良好",
        "targetScore": 95,
        "learningNeeds": "提高解题速度和准确率"
      }
    ]
  }
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "child": {
        "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
        "name": "张小明",
        "gender": "男",
        "age": 11,
        "grade": "小学五年级",
        "school": "深圳市实验小学",
        "subjects": [
          {
            "name": "数学",
            "level": "良好",
            "targetScore": 95,
            "learningNeeds": "提高解题速度和准确率"
          },
          {
            "name": "英语",
            "level": "较差",
            "targetScore": 85,
            "learningNeeds": "提高听力和口语能力"
          }
        ],
        "learningStyle": "视觉学习型",
        "personality": "内向",
        "hobbies": ["阅读", "绘画"],
        "specialNeeds": "注意力不集中"
      }
    }
  }
  ```
- **错误响应** (404):
  ```json
  {
    "status": "error",
    "message": "未找到子女信息"
  }
  ```

### 5. 删除子女信息

- **URL**: `/parent-profiles/:parentId/children/:childId`
- **方法**: `DELETE`
- **认证**: 需要 (家长角色)
- **描述**: 删除子女信息
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **成功响应** (204): 无内容
- **错误响应** (404):
  ```json
  {
    "status": "error",
    "message": "未找到子女信息"
  }
  ```

## 教师筛选接口

### 1. 获取同城市的教师列表

- **URL**: `/parent-profiles/:parentId/tutors/city`
- **方法**: `GET`
- **认证**: 需要 (家长角色)
- **描述**: 获取与家长在同一城市的教师列表
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **请求参数**: 无
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "avatar": "https://example.com/avatar.jpg",
          "location": {
            "province": "广东省",
            "city": "深圳市",
            "district": "南山区"
          },
          "subjects": ["数学", "物理"],
          "education": "硕士",
          "rating": 4.8,
          "hourlyRate": 200,
          "availableSessions": ["周一晚上", "周三下午", "周六全天"]
        },
        // 更多教师数据...
      ],
      "count": 15
    }
  }
  ```
- **错误响应** (404):
  ```json
  {
    "status": "error",
    "message": "未找到家长档案或无法获取教师列表"
  }
  ```

### 2. 按科目筛选教师

- **URL**: `/parent-profiles/:parentId/tutors/subject`
- **方法**: `GET`
- **认证**: 需要 (家长角色)
- **描述**: 按科目筛选教师列表
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **请求参数**:
  ```
  subject=数学 // 查询参数，指定要筛选的科目
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "avatar": "https://example.com/avatar.jpg",
          "subjects": ["数学", "物理"],
          "education": "硕士",
          "rating": 4.8,
          "hourlyRate": 200,
          "availableSessions": ["周一晚上", "周三下午", "周六全天"]
        },
        // 更多教师数据...
      ],
      "count": 25
    }
  }
  ```
- **错误响应** (400):
  ```json
  {
    "status": "error",
    "message": "缺少必要的科目参数"
  }
  ```

### 3. 按地理位置筛选教师

- **URL**: `/parent-profiles/:parentId/tutors/location`
- **方法**: `GET`
- **认证**: 需要 (家长角色)
- **描述**: 按地理位置筛选教师列表
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **请求参数**:
  ```
  province=广东省&city=深圳市&district=南山区 // 可选参数，不提供则默认使用家长档案中的位置信息
  distance=5 // 可选参数，搜索半径（公里）
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "avatar": "https://example.com/avatar.jpg",
          "location": {
            "province": "广东省",
            "city": "深圳市",
            "district": "南山区",
            "address": "科技园路2号"
          },
          "distance": 1.2, // 距离（公里）
          "subjects": ["数学", "物理"],
          "education": "硕士",
          "rating": 4.8
        },
        // 更多教师数据...
      ],
      "count": 8
    }
  }
  ```
- **错误响应** (404):
  ```json
  {
    "status": "error",
    "message": "未找到家长档案或位置信息不完整"
  }
  ```

### 4. 按价格区间筛选教师

- **URL**: `/parent-profiles/:parentId/tutors/price`
- **方法**: `GET`
- **认证**: 需要 (家长角色)
- **描述**: 按价格区间筛选教师列表
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **请求参数**:
  ```
  minPrice=100&maxPrice=300 // 价格区间（元/小时）
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "avatar": "https://example.com/avatar.jpg",
          "subjects": ["数学", "物理"],
          "education": "硕士",
          "rating": 4.8,
          "hourlyRate": 200
        },
        // 更多教师数据...
      ],
      "count": 18
    }
  }
  ```
- **错误响应** (400):
  ```json
  {
    "status": "error",
    "message": "价格区间参数无效"
  }
  ```

### 5. 按学历筛选教师

- **URL**: `/parent-profiles/:parentId/tutors/education`
- **方法**: `GET`
- **认证**: 需要 (家长角色)
- **描述**: 按学历筛选教师列表
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **请求参数**:
  ```
  education=硕士 // 学历要求，可选值：本科、硕士、博士等
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "avatar": "https://example.com/avatar.jpg",
          "subjects": ["数学", "物理"],
          "education": "硕士",
          "graduatedFrom": "北京大学",
          "rating": 4.8,
          "hourlyRate": 200
        },
        // 更多教师数据...
      ],
      "count": 12
    }
  }
  ```
- **错误响应** (400):
  ```json
  {
    "status": "error",
    "message": "学历参数无效"
  }
  ```

### 6. 按开课时间筛选教师

- **URL**: `/parent-profiles/:parentId/tutors/session`
- **方法**: `GET`
- **认证**: 需要 (家长角色)
- **描述**: 按开课时间筛选教师列表
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **请求参数**:
  ```
  day=周六&timeSlot=上午 // 可选值：周一至周日，上午、下午、晚上、全天
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "avatar": "https://example.com/avatar.jpg",
          "subjects": ["数学", "物理"],
          "education": "硕士",
          "rating": 4.8,
          "hourlyRate": 200,
          "availableSessions": ["周六上午", "周六下午", "周日全天"]
        },
        // 更多教师数据...
      ],
      "count": 10
    }
  }
  ```
- **错误响应** (400):
  ```json
  {
    "status": "error",
    "message": "时间参数无效"
  }
  ```

### 7. 多条件筛选教师

- **URL**: `/parent-profiles/:parentId/tutors/filter`
- **方法**: `GET`
- **认证**: 需要 (家长角色)
- **描述**: 根据多个条件筛选教师列表
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **请求参数**:
  ```
  subject=数学&minPrice=150&maxPrice=300&education=硕士&minRating=4.5&city=深圳市&district=南山区&day=周六
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "avatar": "https://example.com/avatar.jpg",
          "location": {
            "province": "广东省",
            "city": "深圳市",
            "district": "南山区"
          },
          "subjects": ["数学", "物理"],
          "education": "硕士",
          "rating": 4.8,
          "hourlyRate": 200,
          "availableSessions": ["周六上午", "周六下午"]
        },
        // 更多教师数据...
      ],
      "count": 5
    }
  }
  ```
- **错误响应** (400):
  ```json
  {
    "status": "error",
    "message": "筛选参数无效"
  }
  ```

### 8. 按科目和价格区间筛选教师

- **URL**: `/parent-profiles/:parentId/tutors/subject-price`
- **方法**: `GET`
- **认证**: 需要 (家长角色)
- **描述**: 按科目和价格区间筛选教师列表
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **请求参数**:
  ```
  subject=数学&minPrice=150&maxPrice=300
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "avatar": "https://example.com/avatar.jpg",
          "subjects": ["数学", "物理"],
          "education": "硕士",
          "rating": 4.8,
          "hourlyRate": 200
        },
        // 更多教师数据...
      ],
      "count": 15
    }
  }
  ```
- **错误响应** (400):
  ```json
  {
    "status": "error",
    "message": "缺少必要参数或参数无效"
  }
  ```

### 9. 按科目、学历和评分筛选教师

- **URL**: `/parent-profiles/:parentId/tutors/subject-education-rating`
- **方法**: `GET`
- **认证**: 需要 (家长角色)
- **描述**: 按科目、学历和评分筛选教师列表
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **请求参数**:
  ```
  subject=数学&education=硕士&minRating=4.5
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "avatar": "https://example.com/avatar.jpg",
          "subjects": ["数学", "物理"],
          "education": "硕士",
          "graduatedFrom": "北京大学",
          "rating": 4.8,
          "hourlyRate": 200
        },
        // 更多教师数据...
      ],
      "count": 8
    }
  }
  ```
- **错误响应** (400):
  ```json
  {
    "status": "error",
    "message": "缺少必要参数或参数无效"
  }
  ```

### 10. 按开课时间、科目和教学经验筛选教师

- **URL**: `/parent-profiles/:parentId/tutors/session-subject-experience`
- **方法**: `GET`
- **认证**: 需要 (家长角色)
- **描述**: 按开课时间、科目和教学经验筛选教师列表
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **请求参数**:
  ```
  day=周六&timeSlot=下午&subject=数学&minExperience=3
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "avatar": "https://example.com/avatar.jpg",
          "subjects": ["数学", "物理"],
          "education": "硕士",
          "rating": 4.8,
          "hourlyRate": 200,
          "experience": 5, // 教学经验（年）
          "availableSessions": ["周六下午", "周日全天"]
        },
        // 更多教师数据...
      ],
      "count": 6
    }
  }
  ```
- **错误响应** (400):
  ```json
  {
    "status": "error",
    "message": "缺少必要参数或参数无效"
  }
  ```

## Postman 测试指南

1. **环境设置**:
   - 使用与认证和用户 API 相同的环境
   - 确保已经设置了 `baseUrl` 和 `token` 变量

2. **测试流程**:
   - 首先调用认证接口获取 token
   - 创建家长档案
   - 添加子女信息
   - 获取、更新和删除子女信息
   - 更新和删除家长档案

3. **测试集合**:
   - 创建一个测试集合，包含所有家长档案和子女信息相关的接口
   - 设置集合级别的请求头:
     ```
     Content-Type: application/json
     Authorization: Bearer {{token}}
     ```

4. **测试脚本**:
   - 为每个请求添加测试脚本，验证响应状态码和数据结构
   - 保存重要的 ID 到环境变量中:
     ```javascript
     if (pm.response.code === 201) {
       var jsonData = pm.response.json();
       pm.environment.set("childId", jsonData.data.child._id);
     }
     ```

5. **自动化测试**:
   - 创建一个运行顺序，按照以下顺序执行请求:
     1. 登录获取 token
     2. 创建家长档案
     3. 获取家长档案
     4. 添加子女信息
     5. 获取子女信息列表
     6. 获取单个子女信息
     7. 更新子女信息
     8. 更新家长档案
     9. 删除子女信息
     10. 删除家长档案
