# 智能家教推荐系统 API 文档 - 教师档案管理

本文档提供了智能家教推荐系统中与教师档案管理相关的 API 接口详细信息，方便在 Postman 中进行测试。

## 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: JWT Token (在需要认证的接口中，需要在请求头中添加 `Authorization: Bearer <token>`)

## 公共路由

### 1. 查询教师列表

- **URL**: `/tutors`
- **方法**: `GET`
- **认证**: 不需要
- **描述**: 获取教师列表，支持分页和筛选
- **查询参数**:
  - `page`: 页码，默认为 1
  - `limit`: 每页数量，默认为 10
  - `sort`: 排序字段，例如 `rating,-createdAt`
  - `fields`: 返回字段，例如 `name,subjects,rating`
  - `filter`: 筛选条件，例如 `{"rating":{"$gte":4.5}}`
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "results": 10,
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "subjects": ["数学", "物理"],
          "rating": 4.8,
          "location": {
            "city": "深圳市",
            "district": "南山区"
          }
        },
        // ... 更多教师
      ]
    }
  }
  ```

### 2. 按科目查找教师

- **URL**: `/tutors/subject/:subject`
- **方法**: `GET`
- **认证**: 不需要
- **描述**: 根据科目查找教师
- **路径参数**:
  - `subject`: 科目名称，例如 `数学`
- **查询参数**:
  - `page`: 页码，默认为 1
  - `limit`: 每页数量，默认为 10
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "results": 5,
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "subjects": ["数学", "物理"],
          "rating": 4.8,
          "location": {
            "city": "深圳市",
            "district": "南山区"
          }
        },
        // ... 更多教师
      ]
    }
  }
  ```

### 3. 按地区查找教师

- **URL**: `/tutors/location/:city/:district?`
- **方法**: `GET`
- **认证**: 不需要
- **描述**: 根据地区查找教师
- **路径参数**:
  - `city`: 城市名称，例如 `深圳市`
  - `district`: 区域名称（可选），例如 `南山区`
- **查询参数**:
  - `page`: 页码，默认为 1
  - `limit`: 每页数量，默认为 10
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "results": 8,
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "subjects": ["数学", "物理"],
          "rating": 4.8,
          "location": {
            "city": "深圳市",
            "district": "南山区"
          }
        },
        // ... 更多教师
      ]
    }
  }
  ```

### 4. 查找附近的教师

- **URL**: `/tutors/nearby`
- **方法**: `GET`
- **认证**: 不需要
- **描述**: 根据地理位置查找附近的教师
- **查询参数**:
  - `lat`: 纬度，例如 `22.5431`
  - `lng`: 经度，例如 `114.0579`
  - `distance`: 距离（公里），默认为 5
  - `page`: 页码，默认为 1
  - `limit`: 每页数量，默认为 10
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "results": 3,
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "subjects": ["数学", "物理"],
          "rating": 4.8,
          "location": {
            "city": "深圳市",
            "district": "南山区",
            "coordinates": [114.0579, 22.5431],
            "distance": 1.2 // 单位：公里
          }
        },
        // ... 更多教师
      ]
    }
  }
  ```

### 5. 获取单个教师详情

- **URL**: `/tutors/:tutorId`
- **方法**: `GET`
- **认证**: 不需要
- **描述**: 获取单个教师的详细信息
- **路径参数**:
  - `tutorId`: 教师ID，例如 `TUTOR_20250316123456`
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "tutor": {
        "tutorId": "TUTOR_20250316123456",
        "name": "王老师",
        "gender": "男",
        "age": 35,
        "avatar": "https://example.com/avatar.jpg",
        "introduction": "有10年教学经验的数学老师",
        "education": {
          "degree": "硕士",
          "major": "应用数学",
          "school": "北京大学",
          "graduationYear": 2015
        },
        "subjects": [
          {
            "name": "数学",
            "grade": ["初中", "高中"],
            "description": "擅长奥数和高考数学",
            "yearsOfExperience": 10,
            "successCases": [
              {
                "studentGrade": "高三",
                "initialScore": 85,
                "finalScore": 145,
                "duration": "3个月",
                "description": "通过系统训练，学生数学成绩从85分提升到145分"
              }
            ]
          },
          {
            "name": "物理",
            "grade": ["高中"],
            "description": "擅长物理竞赛",
            "yearsOfExperience": 8
          }
        ],
        "teachingStyle": ["耐心", "严谨", "启发式"],
        "availabilityStatus": "available",
        "timeSessions": [
          {
            "dayOfWeek": 1, // 周一
            "startTime": "18:00",
            "endTime": "21:00"
          },
          {
            "dayOfWeek": 3, // 周三
            "startTime": "18:00",
            "endTime": "21:00"
          },
          {
            "dayOfWeek": 6, // 周六
            "startTime": "09:00",
            "endTime": "18:00"
          }
        ],
        "defaultTimes": {
          "lessonDuration": 120, // 单位：分钟
          "breakTime": 15 // 单位：分钟
        },
        "location": {
          "province": "广东省",
          "city": "深圳市",
          "district": "南山区",
          "address": "科技园路1号",
          "coordinates": [114.0579, 22.5431]
        },
        "pricing": {
          "hourlyRate": 300,
          "packageOptions": [
            {
              "hours": 10,
              "price": 2800,
              "description": "10小时课程包"
            },
            {
              "hours": 20,
              "price": 5400,
              "description": "20小时课程包"
            }
          ],
          "currency": "CNY"
        },
        "rating": 4.8,
        "reviewCount": 25,
        "statistics": {
          "studentsCount": 30,
          "lessonsCount": 120,
          "totalHours": 240
        },
        "contactInfo": {
          "phone": "13800138000",
          "email": "teacher@example.com",
          "wechat": "wechat_id"
        },
        "certifications": [
          {
            "name": "高级教师资格证",
            "issuer": "教育部",
            "issueDate": "2018-06-01",
            "expiryDate": "2028-06-01"
          }
        ],
        "status": "active",
        "createdAt": "2025-01-16T08:16:23.000Z",
        "updatedAt": "2025-03-16T08:16:23.000Z"
      }
    }
  }
  ```

### 6. 获取推荐教师

- **URL**: `/tutors/recommend`
- **方法**: `POST`
- **认证**: 不需要
- **描述**: 根据学生需求获取推荐教师
- **请求体**:
  ```json
  {
    "subjects": ["数学", "英语"],
    "grade": "高中",
    "location": {
      "city": "深圳市",
      "district": "南山区"
    },
    "preferredTeachingStyle": ["耐心", "启发式"],
    "budget": {
      "min": 200,
      "max": 400
    },
    "availableTimes": [
      {
        "dayOfWeek": 6, // 周六
        "startTime": "14:00",
        "endTime": "18:00"
      },
      {
        "dayOfWeek": 0, // 周日
        "startTime": "09:00",
        "endTime": "12:00"
      }
    ]
  }
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "results": 3,
    "data": {
      "tutors": [
        {
          "tutorId": "TUTOR_20250316123456",
          "name": "王老师",
          "subjects": ["数学", "物理"],
          "rating": 4.8,
          "matchScore": 0.92, // 匹配度
          "matchReasons": [
            "教授数学科目",
            "价格在预算范围内",
            "时间可匹配",
            "教学风格符合"
          ]
        },
        // ... 更多教师
      ]
    }
  }
  ```

## 需要认证的路由

### 1. 创建教师档案

- **URL**: `/profile`
- **方法**: `POST`
- **认证**: 需要 (教师角色)
- **描述**: 创建新的教师档案
- **请求头**:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "tutorId": "TUTOR_20250316123456", // 应与用户的 customId 一致
    "name": "王老师",
    "gender": "男",
    "age": 35,
    "avatar": "https://example.com/avatar.jpg",
    "introduction": "有10年教学经验的数学老师",
    "education": {
      "degree": "硕士",
      "major": "应用数学",
      "school": "北京大学",
      "graduationYear": 2015
    },
    "teachingStyle": ["耐心", "严谨", "启发式"],
    "location": {
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "address": "科技园路1号",
      "coordinates": [114.0579, 22.5431]
    },
    "contactInfo": {
      "phone": "13800138000",
      "email": "teacher@example.com",
      "wechat": "wechat_id"
    },
    "certifications": [
      {
        "name": "高级教师资格证",
        "issuer": "教育部",
        "issueDate": "2018-06-01",
        "expiryDate": "2028-06-01"
      }
    ]
  }
  ```
- **成功响应** (201):
  ```json
  {
    "status": "success",
    "data": {
      "profile": {
        "tutorId": "TUTOR_20250316123456",
        "name": "王老师",
        "gender": "男",
        "age": 35,
        "avatar": "https://example.com/avatar.jpg",
        "introduction": "有10年教学经验的数学老师",
        "education": {
          "degree": "硕士",
          "major": "应用数学",
          "school": "北京大学",
          "graduationYear": 2015
        },
        "subjects": [],
        "teachingStyle": ["耐心", "严谨", "启发式"],
        "availabilityStatus": "available",
        "timeSessions": [],
        "defaultTimes": {
          "lessonDuration": 120,
          "breakTime": 15
        },
        "location": {
          "province": "广东省",
          "city": "深圳市",
          "district": "南山区",
          "address": "科技园路1号",
          "coordinates": [114.0579, 22.5431]
        },
        "pricing": {
          "hourlyRate": 0,
          "packageOptions": [],
          "currency": "CNY"
        },
        "rating": 0,
        "reviewCount": 0,
        "statistics": {
          "studentsCount": 0,
          "lessonsCount": 0,
          "totalHours": 0
        },
        "contactInfo": {
          "phone": "13800138000",
          "email": "teacher@example.com",
          "wechat": "wechat_id"
        },
        "certifications": [
          {
            "name": "高级教师资格证",
            "issuer": "教育部",
            "issueDate": "2018-06-01",
            "expiryDate": "2028-06-01"
          }
        ],
        "status": "active",
        "createdAt": "2025-03-16T08:16:23.000Z",
        "updatedAt": "2025-03-16T08:16:23.000Z"
      }
    }
  }
  ```

### 2. 获取自己的教师档案

- **URL**: `/profile`
- **方法**: `GET`
- **认证**: 需要 (教师角色)
- **描述**: 获取当前登录教师的档案信息
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
        // 教师档案信息，格式同上
      }
    }
  }
  ```

### 3. 更新教师档案

- **URL**: `/profile`
- **方法**: `PATCH`
- **认证**: 需要 (教师角色)
- **描述**: 更新教师档案信息
- **请求头**:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "name": "新名字",
    "age": 36,
    "introduction": "更新后的自我介绍",
    "education": {
      "degree": "博士",
      "graduationYear": 2020
    }
  }
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "profile": {
        // 更新后的教师档案信息
      }
    }
  }
  ```

### 4. 删除教师档案

- **URL**: `/profile`
- **方法**: `DELETE`
- **认证**: 需要 (教师角色)
- **描述**: 删除教师档案 (实际上是将状态设置为 inactive)
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **成功响应** (204): 无内容

### 5. 更新可用状态

- **URL**: `/profile/status`
- **方法**: `PATCH`
- **认证**: 需要 (教师角色)
- **描述**: 更新教师可用状态
- **请求头**:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "availabilityStatus": "unavailable" // 可选值: "available", "unavailable", "busy"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "availabilityStatus": "unavailable"
    }
  }
  ```

### 6. 添加教授科目

- **URL**: `/profile/subjects`
- **方法**: `POST`
- **认证**: 需要 (教师角色)
- **描述**: 添加教师教授的科目
- **请求头**:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "name": "数学",
    "grade": ["初中", "高中"],
    "description": "擅长奥数和高考数学",
    "yearsOfExperience": 10
  }
  ```
- **成功响应** (201):
  ```json
  {
    "status": "success",
    "data": {
      "subject": {
        "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
        "name": "数学",
        "grade": ["初中", "高中"],
        "description": "擅长奥数和高考数学",
        "yearsOfExperience": 10,
        "successCases": []
      }
    }
  }
  ```

### 7. 更新科目信息

- **URL**: `/profile/subjects/:subjectId`
- **方法**: `PATCH`
- **认证**: 需要 (教师角色)
- **描述**: 更新科目信息
- **路径参数**:
  - `subjectId`: 科目ID
- **请求头**:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "grade": ["初中", "高中", "大学"],
    "yearsOfExperience": 12
  }
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "subject": {
        "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
        "name": "数学",
        "grade": ["初中", "高中", "大学"],
        "description": "擅长奥数和高考数学",
        "yearsOfExperience": 12,
        "successCases": []
      }
    }
  }
  ```

### 8. 删除科目

- **URL**: `/profile/subjects/:subjectId`
- **方法**: `DELETE`
- **认证**: 需要 (教师角色)
- **描述**: 删除科目
- **路径参数**:
  - `subjectId`: 科目ID
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **成功响应** (204): 无内容

## Postman 测试指南

1. **环境设置**:
   - 使用与认证和用户 API 相同的环境
   - 确保已经设置了 `baseUrl` 和 `token` 变量

2. **测试流程**:
   - 首先调用认证接口获取 token
   - 创建教师档案
   - 添加科目信息
   - 添加成功案例
   - 添加课程时间
   - 更新位置、价格和教学风格
   - 查询教师列表和单个教师详情

3. **测试集合**:
   - 创建一个测试集合，包含所有教师档案相关的接口
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
       pm.environment.set("subjectId", jsonData.data.subject._id);
     }
     ```
