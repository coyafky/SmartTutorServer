# 能家教系统家长API概览总结

## 文档结构与核心功能

家长API文档全面描述了智能家教系统中家长用户可执行的所有核心操作，包含六大功能模块：

1. **基础信息与认证**
   - 用户注册与登录
   - JWT令牌认证机制
   - 统一的请求/响应格式
2. **家长档案管理**
   - 创建/更新个人资料
   - 设置位置信息和教学偏好
   - 查询个人档案
3. **子女信息管理**
   - 添加子女基本信息（昵称、年级）
   - 记录学科成绩和目标
   - 更新和查询子女信息
4. **教师筛选与推荐**
   - 多维度筛选：城市、科目、价格、学历、时间
   - 高级组合筛选
   - 智能推荐算法（匹配分数和匹配详情）
5. **求教帖子管理**
   - 为特定子女创建求教帖子
   - 设置教学需求和偏好
   - 更新、查询和删除帖子
6. **错误处理机制**
   - 统一的错误响应格式
   - 标准化的错误码系统

## 家长用户的主要行为

基于API文档，家长用户在系统中的主要行为包括：

1. **账户与档案管理**
   - 注册新账户并登录系统
   - 完善个人资料（姓名、联系方式、位置信息）
   - 设置教学偏好（价格区间、教师性别、可用时间）
2. **子女学习管理**
   - 添加多个子女信息
   - 记录各科目当前成绩和目标成绩
   - 标注学科难度和学习需求
3. **教师选择与匹配**
   - 按照多种条件筛选合适教师
   - 查看教师详细资料（教育背景、教学经验、评分）
   - 获取系统智能推荐的教师列表
4. **求教需求发布**
   - 创建详细的求教帖子
   - 指定教学地点、教师性别和教学风格偏好
   - 设置预算范围和具体需求描述
   - 管理已发布的求教帖子（更新、删除）
5. **系统交互特性**
   - 使用JWT令牌进行身份验证
   - 只能操作自己的资源
   - 处理特殊状态（如"open"状态自动转为"published"）

## 补充说明

1. 系统采用了协同过滤算法为家长提供个性化教师推荐
2. 教师筛选支持多种精细化条件组合，满足不同家长的需求
3. 求教帖子状态管理有特殊处理逻辑，确保状态一致性
4. 完整的错误处理机制确保用户获得清晰的错误反馈
5. API设计遵循RESTful风格，便于前端开发和集成

这份API文档为家长用户提供了全面的系统功能指南，支持从账户创建到教师匹配的完整用户旅程。



注册和登录

# 智能家教推荐系统 API 文档 - 认证与用户管理

本文档提供了智能家教推荐系统中与认证和用户管理相关的 API 接口详细信息，方便在 Postman 中进行测试。

## 基础信息

- **基础 URL**: `http://localhost:3000/api`
- **认证方式**: JWT Token (在需要认证的接口中，需要在请求头中添加 `Authorization: Bearer <token>`)

## 认证接口

### 1. 用户注册

- **URL**: `/auth/register`

- **方法**: `POST`

- **认证**: 不需要

- **描述**: 注册新用户

- 请求体

  :

  ```json
  {
    "username": "test_user",
    "password": "password123",
    "role": "admin" // 可选值: "parent", "teacher", "admin"
  }
  ```

  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "username": "test_user",
        "role": "parent",
        "customId": "PARENT_20250316123456"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

- 错误响应

  (400):

  ```json
  {
    "status": "error",
    "message": "用户名已存在"
  }
  ```

### 2. 用户登录

- **URL**: `/auth/login`

- **方法**: `POST`

- **认证**: 不需要

- **描述**: 用户登录并获取 JWT token

- 请求体

  :

  ```json
  {
    "username": "test_user",
    "password": "password123"
  }
  ```

- 成功响应

  (200):

  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "username": "test_user",
        "role": "parent",
        "customId": "PARENT_20250316123456"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

- 错误响应

  (401):

  ```json
  {
    "status": "error",
    "message": "用户名或密码错误"
  }
  ```

一下的内容都是需要 Token 的

## 3 管理员获取帖子(需要)

```
http://localhost:3000/api/admin/posts
```

```

    "status": "success",
    "data": {
        "posts": [
            {
                "_id": "67e3bfe513a3b0a292f18079",
                "requestId": "REQUEST_PARENT_20250326162505_174297904878",
                "status": "published",
                "reviewedAt": "2025-03-26T09:05:31.871Z",
                "parentId": "PARENT_20250326162505",
                "grade": "高中三年级",
                "location": {
                    "coordinates": {
                        "type": "Point",
                        "coordinates": [
                            -66.6118,
                            19.3592
                        ]
                    },
                    "address": "成都成华区买栋4897号",
                    "district": "成华区",
                    "city": "成都",
                    "_id": "67e3bfe513a3b0a292f1807a"
                },
                "subjects": [
                    {
                        "name": "数学",
                        "currentScore": "80",
                        "targetScore": "99",
                        "difficulty": "简单",
                        "_id": "67e3bfe513a3b0a292f1807b"
                    },
                    {
                        "name": "化学",
                        "currentScore": "85",
                        "targetScore": "86",
                        "difficulty": "简单",
                        "_id": "67e3bfe513a3b0a292f1807c"
                    }
                ],
                "preferences": {
                    "budget": {
                        "min": 100,
                        "max": 252,
                        "period": "per_hour"
                    },
                    "teachingLocation": "其他",
                    "teacherGender": "女",
                    "teachingStyle": [
                        "翻转课堂"
                    ],
                    "_id": "67e3bfe513a3b0a292f1807d"
                },
                "createdAt": "2025-03-26T08:44:23.828Z"
            },
}
```

## 管理员从固定的 id 中获取帖子

```
http://localhost:3000/api/admin/posts/REQUEST_PARENT_20250326162505_174297904878
```

```
{
    "status": "success",
    "data": {
        "post": {
            "_id": "67e3bfe513a3b0a292f18079",
            "requestId": "REQUEST_PARENT_20250326162505_174297904878",
            "status": "published",
            "reviewedAt": "2025-03-26T09:05:31.871Z",
            "reviewedBy": "ADMIN_20250326090113",
            "reviewNote": null,
            "reports": [],
            "parentId": "PARENT_20250326162505",
            "childId": "CHILD_20250326162505_01",
            "grade": "高中三年级",
            "location": {
                "coordinates": {
                    "type": "Point",
                    "coordinates": [
                        -66.6118,
                        19.3592
                    ]
                },
                "address": "成都成华区买栋4897号",
                "district": "成华区",
                "city": "成都",
                "_id": "67e3bfe513a3b0a292f1807a"
            },
            "subjects": [
                {
                    "name": "数学",
                    "currentScore": "80",
                    "targetScore": "99",
                    "difficulty": "简单",
                    "_id": "67e3bfe513a3b0a292f1807b"
                },
                {
                    "name": "化学",
                    "currentScore": "85",
                    "targetScore": "86",
                    "difficulty": "简单",
                    "_id": "67e3bfe513a3b0a292f1807c"
                }
            ],
            "preferences": {
                "budget": {
                    "min": 100,
                    "max": 252,
                    "period": "per_hour"
                },
                "teachingLocation": "其他",
                "teacherGender": "女",
                "teachingStyle": [
                    "翻转课堂"
                ],
                "_id": "67e3bfe513a3b0a292f1807d"
            },
            "createdAt": "2025-03-26T08:44:23.828Z",
            "updatedAt": "2025-03-26T09:05:31.871Z",
            "__v": 0
        }
    }
}
```

### 管理员 审核帖子状态（PATCH）

```
http://localhost:3000/api/admin/posts/REQUEST_PARENT_20250326162505_174297904878/status
```

```
{
    "status":"published"
}
```

```
{
    "status": "success",
    "data": {
        "post": {
            "_id": "67e3bfe513a3b0a292f18079",
            "requestId": "REQUEST_PARENT_20250326162505_174297904878",
            "status": "published",
            "reviewedAt": "2025-03-26T10:15:45.749Z",
            "reviewedBy": "ADMIN_20250326090113",
            "reviewNote": null,
            "reports": [],
            "parentId": "PARENT_20250326162505",
            "childId": "CHILD_20250326162505_01",
            "grade": "高中三年级",
            "location": {
                "coordinates": {
                    "type": "Point",
                    "coordinates": [
                        -66.6118,
                        19.3592
                    ]
                },
                "address": "成都成华区买栋4897号",
                "district": "成华区",
                "city": "成都",
                "_id": "67e3bfe513a3b0a292f1807a"
            },
            "subjects": [
                {
                    "name": "数学",
                    "currentScore": "80",
                    "targetScore": "99",
                    "difficulty": "简单",
                    "_id": "67e3bfe513a3b0a292f1807b"
                },
                {
                    "name": "化学",
                    "currentScore": "85",
                    "targetScore": "86",
                    "difficulty": "简单",
                    "_id": "67e3bfe513a3b0a292f1807c"
                }
            ],
            "preferences": {
                "budget": {
                    "min": 100,
                    "max": 252,
                    "period": "per_hour"
                },
                "teachingLocation": "其他",
                "teacherGender": "女",
                "teachingStyle": [
                    "翻转课堂"
                ],
                "_id": "67e3bfe513a3b0a292f1807d"
            },
            "createdAt": "2025-03-26T08:44:23.828Z",
            "updatedAt": "2025-03-26T10:15:45.750Z",
            "__v": 0
        }
    }
}
```

### 管理员删除特点的帖子（delete）

```
http://localhost:3000/api/admin/posts/REQUEST_PARENT_20250320025248_174297904651
```

### 管理员获取教师 (get)

```
http://localhost:3000/api/admin/tutors
```

```
"status": "success",
    "data": {
        "tutors": [
            {
                "teachingExperience": {
                    "subjects": []
                },
                "schedule": {
                    "weekend": {
                        "defaultTimes": {
                            "早上": {
                                "startTime": "09:00",
                                "endTime": "12:00"
                            },
                            "下午": {
                                "startTime": "14:00",
                                "endTime": "17:00"
                            },
                            "晚上": {
                                "startTime": "19:00",
                                "endTime": "21:00"
                            }
                        },
                        "sessions": []
                    }
                },
                "location": {
                    "geo": {
                        "type": "Point",
                        "coordinates": [
                            116.3,
                            39.9
                        ]
                    },
                    "address": "中关村大街1号",
                    "district": "海淀区",
                    "city": "北京"
                },
                "teachingStyle": {
                    "keywords": [],
                    "strengths": []
                },
                "ratings": {
                    "overall": 0,
                    "teachingQuality": 0,
                    "attitude": 0,
                    "punctuality": 0,
                    "communication": 0,
                    "effectiveness": 0
                },
                "statistics": {
                    "totalStudents": 0,
                    "totalClasses": 0,
                    "completionRate": 0,
                    "repeatRate": 0
                },
                "_id": "67e3cd1c37d22504e0f14067",
                "isVerified": false,
                "status": "active",
                "tutorId": "TUTOR_20250326094707",
                "userId": "67e3cd1b37d22504e0f14060",
                "gender": "男",
                "availabilityStatus": "available",
                "createdAt": "2025-03-26T09:47:08.177Z",
                "updatedAt": "2025-03-26T09:47:08.178Z",
                "__v": 0
            },
            {
```

````
# 智能家教推荐系统 API 文档 - 管理员接口

本文档提供了智能家教推荐系统中管理员相关的 API 接口详细信息，方便在 Postman 中进行测试。

## 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: JWT Token (在需要认证的接口中，需要在请求头中添加 `Authorization: Bearer <token>`)
- **权限要求**: 所有管理员接口都需要管理员权限，请确保使用管理员账号登录获取的 token

## 认证接口

### 1. 用户注册

- **URL**: `/auth/register`

- **方法**: `POST`

- **认证**: 不需要

- **描述**: 注册新用户

- **请求体**:

  ```json
  {
    "username": "test_user",
    "password": "password123",
    "role": "admin" // 可选值: "parent", "teacher", "admin"
  }
````

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "username": "test_user",
        "role": "parent",
        "customId": "PARENT_20250316123456"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

- **错误响应** (400):

  ```json
  {
    "status": "error",
    "message": "用户名已存在"
  }
  ```

### 2. 用户登录

- **URL**: `/auth/login`

- **方法**: `POST`

- **认证**: 不需要

- **描述**: 用户登录并获取 JWT token

- **请求体**:

  ```json
  {
    "username": "test_user",
    "password": "password123"
  }
  ```

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "username": "test_user",
        "role": "parent",
        "customId": "PARENT_20250316123456"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

- **错误响应** (401):

  ```json
  {
    "status": "error",
    "message": "用户名或密码错误"
  }
  ```

## 管理员接口

> 注意：以下所有接口都需要管理员权限，请在请求头中添加有效的管理员 token：
> `Authorization: Bearer <admin_token>`

### 用户管理

#### 1. 获取所有用户

- **URL**: `/admin/users`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取系统中所有用户的列表

- **查询参数**:

  - `page` (可选): 页码，默认为 1
  - `limit` (可选): 每页数量，默认为 10
  - `role` (可选): 按角色筛选，可选值: "parent", "teacher", "admin"
  - `status` (可选): 按状态筛选，可选值: "active", "inactive", "suspended"

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "users": [
        {
          "_id": "60d21b4667d0d8992e610c85",
          "username": "test_user",
          "role": "parent",
          "customId": "PARENT_20250316123456",
          "status": "active",
          "createdAt": "2025-03-16T12:34:56.789Z"
        }
        // 更多用户...
      ],
      "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10,
        "pages": 10
      }
    }
  }
  ```

#### 2. 获取指定用户

- **URL**: `/admin/users/:userId`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取指定用户的详细信息

- **路径参数**:

  - `userId`: 用户 ID

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "username": "test_user",
        "role": "parent",
        "customId": "PARENT_20250316123456",
        "status": "active",
        "email": "test@example.com",
        "createdAt": "2025-03-16T12:34:56.789Z",
        "updatedAt": "2025-03-16T12:34:56.789Z"
      }
    }
  }
  ```

- **错误响应** (404):

  ```json
  {
    "status": "error",
    "message": "用户不存在"
  }
  ```

#### 3. 更新用户信息

- **URL**: `/admin/users/:userId`
- **方法**: `PATCH`
- **认证**: 需要 (管理员)
- **描述**: 更新指定用户的信息

- **路径参数**:

  - `userId`: 用户 ID

- **请求体**:

  ```json
  {
    "username": "updated_username",
    "email": "updated@example.com"
  }
  ```

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "username": "updated_username",
        "role": "parent",
        "customId": "PARENT_20250316123456",
        "status": "active",
        "email": "updated@example.com",
        "createdAt": "2025-03-16T12:34:56.789Z",
        "updatedAt": "2025-03-26T18:20:00.000Z"
      }
    }
  }
  ```

#### 4. 删除用户

- **URL**: `/admin/users/:userId`
- **方法**: `DELETE`
- **认证**: 需要 (管理员)
- **描述**: 删除指定用户

- **路径参数**:

  - `userId`: 用户 ID指定是这个   customId

  -  */

    const UserSchema = new Schema({

      /**

       \* 自定义用户ID

       \* 格式为：角色前缀_14位时间戳，如 TUTOR_20230101120000

       \* @type {String}

       */

      customId: {

    ​    type: String,

    ​    required: true,

    ​    unique: true,

    ​    match: /^(TUTOR|PARENT|ADMIN)_\d{14}$/, // 验证格式

    ​    index: true, // 创建索引提高查询效率

      },

      /**

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "message": "用户已成功删除"
  }
  ```

#### 5. 更新用户状态

- **URL**: `/admin/users/:userId/status`
- **方法**: `PATCH`
- **认证**: 需要 (管理员)
- **描述**: 更新用户状态（激活/停用/封禁）

- **路径参数**:

  - `userId`: 用户 ID

- **请求体**:

  ```json
  {
    "status": "suspended" // 可选值: "active", "inactive", "suspended"
  }
  ```

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "username": "test_user",
        "status": "suspended",
        "updatedAt": "2025-03-26T18:20:00.000Z"
      }
    }
  }
  ```

#### 6. 更新用户角色

- **URL**: `/admin/users/:userId/role`
- **方法**: `PATCH`
- **认证**: 需要 (管理员)
- **描述**: 更新用户角色

- **路径参数**:

  - `userId`: 用户 ID

- **请求体**:

  ```json
  {
    "role": "teacher" // 可选值: "parent", "teacher", "admin"
  }
  ```

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "_id": "60d21b4667d0d8992e610c85",
        "username": "test_user",
        "role": "teacher",
        "customId": "TEACHER_20250326182000",
        "updatedAt": "2025-03-26T18:20:00.000Z"
      }
    }
  }
  ```

### 教师管理

#### 1. 获取所有教师

- **URL**: `/admin/tutors`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取系统中所有教师的列表

- **查询参数**:

  - `page` (可选): 页码，默认为 1
  - `limit` (可选): 每页数量，默认为 10
  - `status` (可选): 按状态筛选，可选值: "active", "inactive", "suspended"
  - `verified` (可选): 按认证状态筛选，可选值: "true", "false"

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "tutors": [
        {
          "_id": "60d21b4667d0d8992e610c85",
          "tutorId": "TEACHER_20250316123456",
          "userId": "60d21b4667d0d8992e610c86",
          "name": "张老师",
          "verified": true,
          "status": "active",
          "subjects": ["数学", "物理"],
          "city": "北京",
          "createdAt": "2025-03-16T12:34:56.789Z"
        }
        // 更多教师...
      ],
      "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10,
        "pages": 10
      }
    }
  }
  ```

#### 2. 获取指定教师

- **URL**: `/admin/tutors/:tutorId`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取指定教师的详细信息

- **路径参数**:

  - `tutorId`: 教师 ID

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "tutor": {
        "_id": "60d21b4667d0d8992e610c85",
        "tutorId": "TEACHER_20250316123456",
        "userId": "60d21b4667d0d8992e610c86",
        "name": "张老师",
        "verified": true,
        "status": "active",
        "subjects": ["数学", "物理"],
        "education": {
          "degree": "硕士",
          "major": "应用数学",
          "school": "北京大学",
          "graduationYear": 2023
        },
        "teachingExperience": {
          "years": 5,
          "subjects": [
            {
              "name": "数学",
              "grade": ["初中", "高中"],
              "description": "擅长高考数学辅导"
            },
            {
              "name": "物理",
              "grade": ["高中"],
              "description": "注重物理概念理解和解题思路"
            }
          ]
        },
        "location": {
          "city": "北京",
          "district": "海淀区",
          "address": "中关村大街1号"
        },
        "createdAt": "2025-03-16T12:34:56.789Z",
        "updatedAt": "2025-03-16T12:34:56.789Z"
      }
    }
  }
  ```

- **错误响应** (404):

  ```json
  {
    "status": "error",
    "message": "教师不存在"
  }
  ```

#### 3. 认证教师

- **URL**: `/admin/tutors/:tutorId/verify`
- **方法**: `PATCH`
- **认证**: 需要 (管理员)
- **描述**: 认证或取消认证教师资格

- **路径参数**:

  - `tutorId`: 教师 ID

- **请求体**:

  ```json
  {
    "verified": true,
    "verificationNote": "已审核教师资格证书，信息属实"
  }
  ```

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "tutor": {
        "_id": "60d21b4667d0d8992e610c85",
        "tutorId": "TEACHER_20250316123456",
        "verified": true,
        "verificationNote": "已审核教师资格证书，信息属实",
        "verifiedAt": "2025-03-26T18:20:00.000Z",
        "verifiedBy": "ADMIN_20250316123456"
      }
    }
  }
  ```

#### 4. 更新教师状态

- **URL**: `/admin/tutors/:tutorId/status`
- **方法**: `PATCH`
- **认证**: 需要 (管理员)
- **描述**: 更新教师状态（激活/停用/封禁）

- **路径参数**:

  - `tutorId`: 教师 ID

- **请求体**:

  ```json
  {
    "status": "suspended", // 可选值: "active", "inactive", "suspended"
    "statusNote": "因多次投诉暂时停用账号"
  }
  ```

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "tutor": {
        "_id": "60d21b4667d0d8992e610c85",
        "tutorId": "TEACHER_20250316123456",
        "status": "suspended",
        "statusNote": "因多次投诉暂时停用账号",
        "updatedAt": "2025-03-26T18:20:00.000Z"
      }
    }
  }
  ```

#### 5. 按城市筛选教师

- **URL**: `/admin/tutors/city/:cityName`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取指定城市的所有教师

- **路径参数**:

  - `cityName`: 城市名称

- **查询参数**:

  - `page` (可选): 页码，默认为 1
  - `limit` (可选): 每页数量，默认为 10
  - `status` (可选): 按状态筛选，可选值: "active", "inactive", "suspended"
  - `verified` (可选): 按认证状态筛选，可选值: "true", "false"

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "tutors": [
        {
          "_id": "60d21b4667d0d8992e610c85",
          "tutorId": "TEACHER_20250316123456",
          "name": "张老师",
          "verified": true,
          "status": "active",
          "subjects": ["数学", "物理"],
          "city": "北京",
          "district": "海淀区",
          "createdAt": "2025-03-16T12:34:56.789Z"
        }
        // 更多教师...
      ],
      "pagination": {
        "total": 50,
        "page": 1,
        "limit": 10,
        "pages": 5
      }
    }
  }
  ```

### 内容审核

#### 1. 获取所有帖子

- **URL**: `/admin/posts`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取系统中所有帖子的列表

- **查询参数**:

  - `page` (可选): 页码，默认为 1
  - `limit` (可选): 每页数量，默认为 10
  - `status` (可选): 按状态筛选，可选值: "pending", "published", "rejected"
  - `sort` (可选): 排序方式，可选值: "newest", "oldest"

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "posts": [
        {
          "_id": "67e3bfe513a3b0a292f18079",
          "requestId": "REQUEST_PARENT_20250326162505_174297904878",
          "status": "published",
          "reviewedAt": "2025-03-26T09:05:31.871Z",
          "parentId": "PARENT_20250326162505",
          "grade": "高中三年级",
          "location": {
            "coordinates": {
              "type": "Point",
              "coordinates": [-66.6118, 19.3592]
            },
            "address": "成都成华区买栋4897号",
            "district": "成华区",
            "city": "成都"
          },
          "subjects": [
            {
              "name": "数学",
              "currentScore": "80",
              "targetScore": "99",
              "difficulty": "简单"
            },
            {
              "name": "化学",
              "currentScore": "85",
              "targetScore": "86",
              "difficulty": "简单"
            }
          ],
          "createdAt": "2025-03-26T08:44:23.828Z"
        }
        // 更多帖子...
      ],
      "pagination": {
        "total": 100,
        "page": 1,
        "limit": 10,
        "pages": 10
      }
    }
  }
  ```

#### 2. 获取指定帖子

- **URL**: `/admin/posts/:postId`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取指定帖子的详细信息

- **路径参数**:

  - `postId`: 帖子 ID

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "post": {
        "_id": "67e3bfe513a3b0a292f18079",
        "requestId": "REQUEST_PARENT_20250326162505_174297904878",
        "status": "published",
        "reviewedAt": "2025-03-26T09:05:31.871Z",
        "reviewedBy": "ADMIN_20250326090113",
        "reviewNote": null,
        "reports": [],
        "parentId": "PARENT_20250326162505",
        "childId": "CHILD_20250326162505_01",
        "grade": "高中三年级",
        "location": {
          "coordinates": {
            "type": "Point",
            "coordinates": [-66.6118, 19.3592]
          },
          "address": "成都成华区买栋4897号",
          "district": "成华区",
          "city": "成都"
        },
        "subjects": [
          {
            "name": "数学",
            "currentScore": "80",
            "targetScore": "99",
            "difficulty": "简单"
          },
          {
            "name": "化学",
            "currentScore": "85",
            "targetScore": "86",
            "difficulty": "简单"
          }
        ],
        "preferences": {
          "budget": {
            "min": 100,
            "max": 252,
            "period": "per_hour"
          },
          "teachingLocation": "其他",
          "teacherGender": "女",
          "teachingStyle": ["翻转课堂"]
        },
        "createdAt": "2025-03-26T08:44:23.828Z",
        "updatedAt": "2025-03-26T09:05:31.871Z"
      }
    }
  }
  ```

- **错误响应** (404):

  ```json
  {
    "status": "error",
    "message": "帖子不存在"
  }
  ```

#### 3. 更新帖子状态

- **URL**: `/admin/posts/:postId/status`
- **方法**: `PATCH`
- **认证**: 需要 (管理员)
- **描述**: 更新帖子状态（待审核/已发布/已拒绝）

- **路径参数**:

  - `postId`: 帖子 ID

- **请求体**:

  ```json
  {
    "status": "published", // 可选值: "pending", "published", "rejected"
    "reviewNote": "内容符合规范，已通过审核"
  }
  ```

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "post": {
        "_id": "67e3bfe513a3b0a292f18079",
        "requestId": "REQUEST_PARENT_20250326162505_174297904878",
        "status": "published",
        "reviewedAt": "2025-03-26T18:20:00.000Z",
        "reviewedBy": "ADMIN_20250326090113",
        "reviewNote": "内容符合规范，已通过审核"
      }
    }
  }
  ```

#### 4. 删除帖子

- **URL**: `/admin/posts/:postId`
- **方法**: `DELETE`
- **认证**: 需要 (管理员)
- **描述**: 删除指定帖子

- **路径参数**:

  - `postId`: 帖子 ID

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "message": "帖子已成功删除"
  }
  ```

#### 5. 获取被举报的帖子

- **URL**: `/admin/posts/reported`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取所有被举报的帖子列表

- **查询参数**:

  - `page` (可选): 页码，默认为 1
  - `limit` (可选): 每页数量，默认为 10
  - `status` (可选): 按状态筛选，可选值: "pending", "reviewed"

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "posts": [
        {
          "_id": "67e3bfe513a3b0a292f18079",
          "requestId": "REQUEST_PARENT_20250326162505_174297904878",
          "status": "published",
          "reports": [
            {
              "reporterId": "USER_20250326090113",
              "reason": "内容不适当",
              "description": "帖子包含不适当的描述",
              "reportedAt": "2025-03-26T10:15:45.749Z",
              "status": "pending"
            }
          ],
          "parentId": "PARENT_20250326162505",
          "grade": "高中三年级",
          "city": "成都",
          "createdAt": "2025-03-26T08:44:23.828Z"
        }
        // 更多帖子...
      ],
      "pagination": {
        "total": 20,
        "page": 1,
        "limit": 10,
        "pages": 2
      }
    }
  }
  ```

#### 6. 审核举报的帖子

- **URL**: `/admin/posts/:postId/review`
- **方法**: `POST`
- **认证**: 需要 (管理员)
- **描述**: 对被举报的帖子进行审核处理

- **路径参数**:

  - `postId`: 帖子 ID

- **请求体**:

  ```json
  {
    "action": "reject", // 可选值: "approve", "reject", "ignore"
    "reviewNote": "帖子内容违反社区规范，已删除",
    "reportIds": ["60d21b4667d0d8992e610c85"] // 要处理的举报ID列表，可选
  }
  ```

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "post": {
        "_id": "67e3bfe513a3b0a292f18079",
        "requestId": "REQUEST_PARENT_20250326162505_174297904878",
        "status": "rejected",
        "reviewedAt": "2025-03-26T18:20:00.000Z",
        "reviewedBy": "ADMIN_20250326090113",
        "reviewNote": "帖子内容违反社区规范，已删除",
        "reports": [
          {
            "reporterId": "USER_20250326090113",
            "reason": "内容不适当",
            "description": "帖子包含不适当的描述",
            "reportedAt": "2025-03-26T10:15:45.749Z",
            "status": "reviewed",
            "reviewedAt": "2025-03-26T18:20:00.000Z"
          }
        ]
      }
    }
  }
  ```

#### 7. 按城市筛选帖子

- **URL**: `/admin/posts/city/:cityName`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取指定城市的所有帖子

- **路径参数**:

  - `cityName`: 城市名称

- **查询参数**:

  - `page` (可选): 页码，默认为 1
  - `limit` (可选): 每页数量，默认为 10
  - `status` (可选): 按状态筛选，可选值: "pending", "published", "rejected"

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "posts": [
        {
          "_id": "67e3bfe513a3b0a292f18079",
          "requestId": "REQUEST_PARENT_20250326162505_174297904878",
          "status": "published",
          "parentId": "PARENT_20250326162505",
          "grade": "高中三年级",
          "location": {
            "city": "成都",
            "district": "成华区"
          },
          "subjects": ["数学", "化学"],
          "createdAt": "2025-03-26T08:44:23.828Z"
        }
        // 更多帖子...
      ],
      "pagination": {
        "total": 30,
        "page": 1,
        "limit": 10,
        "pages": 3
      }
    }
  }
  ```

### 系统设置

#### 1. 获取系统设置

- **URL**: `/admin/settings`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取系统的全局设置

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "settings": {
        "system": {
          "name": "智能家教推荐系统",
          "version": "1.0.0",
          "maintenance": false,
          "maintenanceMessage": "系统维护中，请稍后再试"
        },
        "registration": {
          "allowNewUsers": true,
          "requireEmailVerification": true,
          "allowedRoles": ["parent", "teacher"]
        },
        "content": {
          "requireApproval": true,
          "autoApproveVerifiedTeachers": true,
          "maxPostsPerUser": 10
        },
        "matching": {
          "algorithm": "comprehensive",
          "weightFactors": {
            "distance": 0.3,
            "price": 0.2,
            "rating": 0.3,
            "experience": 0.2
          }
        },
        "updatedAt": "2025-03-16T12:34:56.789Z",
        "updatedBy": "ADMIN_20250316123456"
      }
    }
  }
  ```

#### 2. 更新系统设置

- **URL**: `/admin/settings`
- **方法**: `PATCH`
- **认证**: 需要 (管理员)
- **描述**: 更新系统的全局设置

- **请求体**:

  ```json
  {
    "system": {
      "maintenance": true,
      "maintenanceMessage": "系统升级中，预计1小时后恢复"
    },
    "registration": {
      "allowNewUsers": false
    },
    "matching": {
      "weightFactors": {
        "distance": 0.25,
        "price": 0.25,
        "rating": 0.3,
        "experience": 0.2
      }
    }
  }
  ```

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "settings": {
        "system": {
          "name": "智能家教推荐系统",
          "version": "1.0.0",
          "maintenance": true,
          "maintenanceMessage": "系统升级中，预计1小时后恢复"
        },
        "registration": {
          "allowNewUsers": false,
          "requireEmailVerification": true,
          "allowedRoles": ["parent", "teacher"]
        },
        "content": {
          "requireApproval": true,
          "autoApproveVerifiedTeachers": true,
          "maxPostsPerUser": 10
        },
        "matching": {
          "algorithm": "comprehensive",
          "weightFactors": {
            "distance": 0.25,
            "price": 0.25,
            "rating": 0.3,
            "experience": 0.2
          }
        },
        "updatedAt": "2025-03-26T18:20:00.000Z",
        "updatedBy": "ADMIN_20250326090113"
      }
    }
  }
  ```

### 数据统计

#### 1. 获取用户统计数据

- **URL**: `/admin/statistics/users`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取系统用户相关的统计数据

- **查询参数**:

  - `period` (可选): 统计周期，可选值: "day", "week", "month", "year"，默认为"month"
  - `startDate` (可选): 开始日期，格式为 YYYY-MM-DD
  - `endDate` (可选): 结束日期，格式为 YYYY-MM-DD

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "statistics": {
        "total": {
          "users": 1500,
          "parents": 1000,
          "teachers": 500,
          "admins": 5
        },
        "active": {
          "users": 1200,
          "parents": 800,
          "teachers": 400
        },
        "growth": {
          "daily": 15,
          "weekly": 100,
          "monthly": 350
        },
        "registration": {
          "trend": [
            { "date": "2025-02-26", "count": 12 },
            { "date": "2025-02-27", "count": 15 },
            // 更多数据...
            { "date": "2025-03-26", "count": 20 }
          ]
        },
        "retention": {
          "day1": 90,
          "day7": 70,
          "day30": 50
        },
        "period": "month",
        "startDate": "2025-02-26",
        "endDate": "2025-03-26"
      }
    }
  }
  ```

#### 2. 获取教师统计数据

- **URL**: `/admin/statistics/tutors`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取系统教师相关的统计数据

- **查询参数**:

  - `period` (可选): 统计周期，可选值: "day", "week", "month", "year"，默认为"month"
  - `startDate` (可选): 开始日期，格式为 YYYY-MM-DD
  - `endDate` (可选): 结束日期，格式为 YYYY-MM-DD

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "statistics": {
        "total": {
          "tutors": 500,
          "verified": 350,
          "unverified": 150
        },
        "active": {
          "tutors": 400,
          "verified": 300,
          "unverified": 100
        },
        "bySubject": [
          { "subject": "数学", "count": 200 },
          { "subject": "英语", "count": 150 },
          { "subject": "物理", "count": 100 },
          { "subject": "化学", "count": 80 },
          { "subject": "生物", "count": 50 }
        ],
        "byCity": [
          { "city": "北京", "count": 120 },
          { "city": "上海", "count": 100 },
          { "city": "广州", "count": 80 },
          { "city": "深圳", "count": 70 },
          { "city": "成都", "count": 50 }
        ],
        "byGrade": [
          { "grade": "小学", "count": 150 },
          { "grade": "初中", "count": 200 },
          { "grade": "高中", "count": 250 }
        ],
        "verificationRate": {
          "trend": [
            { "date": "2025-02-26", "rate": 65 },
            { "date": "2025-03-05", "rate": 68 },
            { "date": "2025-03-12", "rate": 70 },
            { "date": "2025-03-19", "rate": 72 },
            { "date": "2025-03-26", "rate": 75 }
          ]
        },
        "period": "month",
        "startDate": "2025-02-26",
        "endDate": "2025-03-26"
      }
    }
  }
  ```

#### 3. 获取帖子统计数据

- **URL**: `/admin/statistics/posts`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取系统帖子相关的统计数据

- **查询参数**:

  - `period` (可选): 统计周期，可选值: "day", "week", "month", "year"，默认为"month"
  - `startDate` (可选): 开始日期，格式为 YYYY-MM-DD
  - `endDate` (可选): 结束日期，格式为 YYYY-MM-DD

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "statistics": {
        "total": {
          "posts": 800,
          "published": 600,
          "pending": 150,
          "rejected": 50
        },
        "creation": {
          "trend": [
            { "date": "2025-02-26", "count": 20 },
            { "date": "2025-03-05", "count": 25 },
            { "date": "2025-03-12", "count": 30 },
            { "date": "2025-03-19", "count": 28 },
            { "date": "2025-03-26", "count": 35 }
          ]
        },
        "byCity": [
          { "city": "北京", "count": 150 },
          { "city": "上海", "count": 120 },
          { "city": "广州", "count": 100 },
          { "city": "深圳", "count": 90 },
          { "city": "成都", "count": 80 }
        ],
        "byGrade": [
          { "grade": "小学", "count": 200 },
          { "grade": "初中", "count": 250 },
          { "grade": "高中", "count": 350 }
        ],
        "bySubject": [
          { "subject": "数学", "count": 300 },
          { "subject": "英语", "count": 250 },
          { "subject": "物理", "count": 150 },
          { "subject": "化学", "count": 120 },
          { "subject": "生物", "count": 80 }
        ],
        "approvalRate": {
          "overall": 80,
          "trend": [
            { "date": "2025-02-26", "rate": 75 },
            { "date": "2025-03-05", "rate": 78 },
            { "date": "2025-03-12", "rate": 80 },
            { "date": "2025-03-19", "rate": 82 },
            { "date": "2025-03-26", "rate": 85 }
          ]
        },
        "period": "month",
        "startDate": "2025-02-26",
        "endDate": "2025-03-26"
      }
    }
  }
  ```

#### 4. 获取匹配统计数据

- **URL**: `/admin/statistics/matches`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取系统匹配相关的统计数据

- **查询参数**:

  - `period` (可选): 统计周期，可选值: "day", "week", "month", "year"，默认为"month"
  - `startDate` (可选): 开始日期，格式为 YYYY-MM-DD
  - `endDate` (可选): 结束日期，格式为 YYYY-MM-DD

- **成功响应** (200):

  ```json
  {
    "status": "success",
    "data": {
      "statistics": {
        "total": {
          "matches": 500,
          "successful": 400,
          "pending": 80,
          "rejected": 20
        },
        "matching": {
          "trend": [
            { "date": "2025-02-26", "count": 15 },
            { "date": "2025-03-05", "count": 18 },
            { "date": "2025-03-12", "count": 20 },
            { "date": "2025-03-19", "count": 22 },
            { "date": "2025-03-26", "count": 25 }
          ]
        },
        "byCity": [
          { "city": "北京", "count": 120 },
          { "city": "上海", "count": 100 },
          { "city": "广州", "count": 80 },
          { "city": "深圳", "count": 70 },
          { "city": "成都", "count": 50 }
        ],
        "bySubject": [
          { "subject": "数学", "count": 200 },
          { "subject": "英语", "count": 150 },
          { "subject": "物理", "count": 80 },
          { "subject": "化学", "count": 50 },
          { "subject": "生物", "count": 30 }
        ],
        "successRate": {
          "overall": 80,
          "trend": [
            { "date": "2025-02-26", "rate": 75 },
            { "date": "2025-03-05", "rate": 78 },
            { "date": "2025-03-12", "rate": 80 },
            { "date": "2025-03-19", "rate": 82 },
            { "date": "2025-03-26", "rate": 85 }
          ]
        },
        "averageMatchTime": {
          "overall": 48, // 小时
          "trend": [
            { "date": "2025-02-26", "hours": 72 },
            { "date": "2025-03-05", "hours": 60 },
            { "date": "2025-03-12", "hours": 54 },
            { "date": "2025-03-19", "hours": 50 },
            { "date": "2025-03-26", "hours": 48 }
          ]
        },
        "period": "month",
        "startDate": "2025-02-26",
        "endDate": "2025-03-26"
      }
    }
  }
  ```

## API 文档总结

本文档详细描述了智能家教推荐系统的管理员 API 接口，包括以下主要模块：

1. **用户管理**：

   - 用户注册与登录
   - 获取用户列表与详情
   - 更新用户信息
   - 管理用户状态与角色

2. **教师管理**：

   - 获取教师列表与详情
   - 教师资质审核
   - 管理教师状态
   - 按城市筛选教师

3. **内容审核**：

   - 帖子管理与审核
   - 举报处理
   - 内容筛选

4. **系统设置**：

   - 获取与更新系统配置
   - 管理注册与匹配算法参数

5. **数据统计**：
   - 用户统计
   - 教师统计
   - 帖子统计
   - 匹配统计

### 通用响应格式

所有 API 响应均遵循以下格式：

- **成功响应**：

  ```json
  {
    "status": "success",
    "data": {
      // 响应数据
    }
  }
  ```

- **错误响应**：
  ```json
  {
    "status": "error",
    "message": "错误信息描述"
  }
  ```

### 认证说明

除了注册和登录接口外，所有管理员 API 都需要进行认证。认证方式如下：

1. 在请求头中添加 `Authorization` 字段
2. 值格式为 `Bearer {token}`，其中 `{token}` 是登录后获取的 JWT 令牌

### 状态码说明

- **200**: 请求成功
- **201**: 资源创建成功
- **400**: 请求参数错误
- **401**: 未认证或认证失败
- **403**: 权限不足
- **404**: 资源不存在
- **500**: 服务器内部错误

### 分页说明

支持分页的接口都接受以下查询参数：

- `page`: 页码，默认为 1
- `limit`: 每页数量，默认为 10

分页响应格式：

```json
{
  "pagination": {
    "total": 100, // 总记录数
    "page": 1, // 当前页码
    "limit": 10, // 每页数量
    "pages": 10 // 总页数
  }
}
```

### 使用建议

1. 使用 Postman 或类似工具测试 API
2. 开发前端时注意处理错误响应
3. 所有涉及敏感操作的 API 都需要二次确认
4. 数据统计 API 支持时间范围筛选，便于生成报表

### 版本信息

- 文档版本：1.0.0
- 最后更新：2025-03-26
- API 版本：v1
