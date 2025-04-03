# 智能家教系统 - 家长端 API 文档

## 目录

1. [基础信息](#基础信息)
2. [认证模块](#认证模块)
   - [注册](#注册)
   - [登录](#登录)
3. [家长档案管理](#家长档案管理)
   - [创建/更新家长档案](#创建更新家长档案)
   - [获取家长档案](#获取家长档案)
4. [子女信息管理](#子女信息管理)
   - [添加子女信息](#添加子女信息)
   - [更新子女信息](#更新子女信息)
   - [获取子女信息](#获取子女信息)
5. [教师筛选与推荐](#教师筛选与推荐)
   - [按条件筛选教师](#按条件筛选教师)
   - [获取推荐教师](#获取推荐教师)
6. [求教列表管理](#求教列表管理)
   - [创建求教列表](#创建求教列表)
   - [更新求教列表](#更新求教列表)
   - [获取求教列表](#获取求教列表)
   - [删除求教列表](#删除求教列表)

## 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: JWT Token
- **请求格式**: JSON
- **响应格式**: JSON
- **状态码**:
  - `200`: 成功
  - `201`: 创建成功
  - `400`: 请求错误
  - `401`: 未授权
  - `403`: 禁止访问
  - `404`: 资源不存在
  - `500`: 服务器错误

所有需要认证的接口都需要在请求头中添加：
```
Authorization: Bearer <token>
```

## 认证模块

### 注册

- **URL**: `/auth/register`
- **方法**: `POST`
- **认证**: 不需要
- **描述**: 注册新用户

#### 请求参数

```json
{
  "username": "test_user",
  "password": "password123",
  "role": "parent",
  "email": "parent@example.com",
  "phone": "13800138000"
}
```

#### 响应示例

```json
{
  "status": "success",
  "data": {
    "user": {
      "username": "test_user",
      "role": "parent",
      "customId": "PARENT_20250326145519",
      "email": "parent@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 登录

- **URL**: `/auth/login`
- **方法**: `POST`
- **认证**: 不需要
- **描述**: 用户登录

#### 请求参数

```json
{
  "username": "test_user",
  "password": "password123"
}
```

#### 响应示例

```json
{
  "status": "success",
  "data": {
    "user": {
      "username": "test_user",
      "role": "parent",
      "customId": "PARENT_20250326145519"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

## 家长档案管理

### 创建/更新家长档案

- **URL**: `/parentProfiles`
- **方法**: `POST`
- **认证**: 需要 (家长角色)
- **描述**: 创建或更新家长档案信息

#### 请求参数

```json
{
  "name": "张三",
  "gender": "男",
  "age": 35,
  "phone": "13800138000",
  "email": "zhangsan@example.com",
  "location": {
    "address": "北京市朝阳区建国路88号",
    "city": "北京市",
    "district": "朝阳区",
    "coordinates": {
      "type": "Point",
      "coordinates": [116.4716, 39.9088]
    }
  },
  "preferences": {
    "preferredGender": "女",
    "priceRange": {
      "min": 200,
      "max": 350
    },
    "availableTimes": [
      {
        "day": "周六",
        "period": "上午"
      },
      {
        "day": "周日",
        "period": "下午"
      }
    ]
  }
}
```

#### 响应示例

```json
{
  "status": "success",
  "data": {
    "profile": {
      "parentId": "PARENT_20250326145519",
      "name": "张三",
      "gender": "男",
      "age": 35,
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "location": {
        "address": "北京市朝阳区建国路88号",
        "city": "北京市",
        "district": "朝阳区",
        "coordinates": {
          "type": "Point",
          "coordinates": [116.4716, 39.9088]
        }
      },
      "preferences": {
        "preferredGender": "女",
        "priceRange": {
          "min": 200,
          "max": 350
        },
        "availableTimes": [
          {
            "day": "周六",
            "period": "上午"
          },
          {
            "day": "周日",
            "period": "下午"
          }
        ]
      },
      "createdAt": "2025-03-26T06:55:19.000Z",
      "updatedAt": "2025-03-26T06:55:19.000Z"
    }
  }
}
```

### 获取家长档案

- **URL**: `/parentProfiles/:parentId`
- **方法**: `GET`
- **认证**: 需要 (家长角色)
- **描述**: 获取家长档案信息

#### 路径参数

- `parentId`: 家长ID

#### 响应示例

```json
{
  "status": "success",
  "data": {
    "profile": {
      "parentId": "PARENT_20250326145519",
      "name": "张三",
      "gender": "男",
      "age": 35,
      "phone": "13800138000",
      "email": "zhangsan@example.com",
      "location": {
        "address": "北京市朝阳区建国路88号",
        "city": "北京市",
        "district": "朝阳区"
      },
      "preferences": {
        "preferredGender": "女",
        "priceRange": {
          "min": 200,
          "max": 350
        },
        "availableTimes": [
          {
            "day": "周六",
            "period": "上午"
          },
          {
            "day": "周日",
            "period": "下午"
          }
        ]
      },
      "children": [
        {
          "childId": "CHILD_20250326145519_01",
          "name": "小明",
          "gender": "男",
          "age": 10,
          "grade": "小学四年级",
          "subjects": ["数学", "英语"]
        }
      ]
    }
  }
}
```



## 子女信息管理

### 添加子女信息

- **URL**: `/parentProfiles/:parentId/children`
- **方法**: `POST`
- **认证**: 需要 (家长角色)
- **描述**: 为家长添加子女信息

#### 请求参数

```json
{
  "nickname": "小明",
  "grade": "初中二年级",
  "subjects": [
    {
      "name": "数学",
      "currentScore": "85",
      "targetScore": "95",
      "difficulty": "中等"
    },
    {
      "name": "英语",
      "currentScore": "75",
      "targetScore": "90",
      "difficulty": "困难"
    }
  ]
}
```

#### 响应示例

```json
{
    "status": "success",
    "data": {
        "child": {
            "childId": "CHILD_20250326145519_01",
            "nickname": "小明",
            "grade": "初中二年级",
            "subjects": [
                {
                    "name": "数学",
                    "currentScore": "85",
                    "targetScore": "95",
                    "difficulty": "中等",
                    "_id": "67e42b2f3c717239bff91dd8"
                },
                {
                    "name": "英语",
                    "currentScore": "75",
                    "targetScore": "90",
                    "difficulty": "困难",
                    "_id": "67e42b2f3c717239bff91dd9"
                }
            ],
            "_id": "67e42b2f3c717239bff91dd7"
        }
    }
}
```

### 更新子女信息

- **URL**: `/parentProfiles/:parentId/children/:childId`
- **方法**: `PUT`
- **认证**: 需要 (家长角色)
- **描述**: 更新子女信息

#### 路径参数

- `parentId`: 家长ID
- `childId`: 子女ID

#### 请求参数

```json
{
  "nickname": "cc",
  "grade": "初中二年级",
  "subjects": [
    {
      "name": "数学",
      "currentScore": "88",
      "targetScore": "95",
      "difficulty": "中等"
    }
  ]
}
```

#### 响应示例

```json
{
    "status": "success",
    "data": {
        "child": {
            "childId": "CHILD_20250326145519_01",
            "nickname": "cc",
            "grade": "初中二年级",
            "subjects": [
                {
                    "name": "数学",
                    "currentScore": "88",
                    "targetScore": "95",
                    "difficulty": "中等",
                    "_id": "67e41b08b36476773a988a5d"
                }
            ],
            "_id": "67e41b08b36476773a988a5c"
        }
    }
}
```

### 获取子女信息

- **URL**: `/parentProfiles/:parentId/children/:childId`
- **方法**: `GET`
- **认证**: 需要 (家长角色)
- **描述**: 获取子女详细信息

#### 路径参数

- `parentId`: 家长ID
- `childId`: 子女ID

#### 响应示例

```json
{
    "status": "success",
    "data": {
        "child": {
            "childId": "CHILD_20250326145519_01",
            "nickname": "小明",
            "grade": "初中二年级",
            "subjects": [
                {
                    "name": "数学",
                    "currentScore": "85",
                    "targetScore": "95",
                    "difficulty": "中等",
                    "_id": "67e41a73b36476773a988a4c"
                },
                {
                    "name": "英语",
                    "currentScore": "75",
                    "targetScore": "90",
                    "difficulty": "困难",
                    "_id": "67e41a73b36476773a988a4d"
                }
            ],
            "_id": "67e41a73b36476773a988a4b"
        }
    }
}
```



### 获取子女信息列表

```
{{base_url}}parentProfiles/PARENT_20250326145519/children
```

```
 {
    "status": "success",
    "data": {
        "children": [
            {
                "childId": "CHILD_20250326145519_01",
                "nickname": "小明",
                "grade": "初中二年级",
                "subjects": [
                    {
                        "name": "数学",
                        "currentScore": "85",
                        "targetScore": "95",
                        "difficulty": "中等",
                        "_id": "67e42b2f3c717239bff91dd8"
                    },
                    {
                        "name": "英语",
                        "currentScore": "75",
                        "targetScore": "90",
                        "difficulty": "困难",
                        "_id": "67e42b2f3c717239bff91dd9"
                    }
                ],
                "_id": "67e42b2f3c717239bff91dd7"
            }
        ]
    }
}
```





## 教师筛选与推荐



### 获取相同城市的教师 get

```
{{base_url}}parentProfiles/PARENT_20250326145519/tutors/city
```

一下的内容是



### 按照科目来筛选教师 get

```
 {{base_url}}parentProfiles/PARENT_20250326145519/tutors/subject?subject=物理
```

### 按照价格区间来筛选教师

```
{{base_url}}parentProfiles/PARENT_20250326145519/tutors/price?minPrice=100&maxPrice=150
```



### 按照学历来筛选教师 

```
{{base_url}}parentProfiles/PARENT_20250326145519/tutors/education?level=一本
```



### 按照开课时间来筛选教师

```
{{base_url}}parentProfiles/PARENT_20250326145519/tutors/session?day=周六&period=下午
```

```
"status": "success",
    "data": {
        "tutors": [
            {
                "education": {
                    "level": "普通本科",
                    "school": "武汉大学",
                    "major": "心理学",
                    "graduationYear": 2011
                },
                "teachingExperience": {
                    "years": 7,
                    "subjects": [
                        {
                            "name": "物理",
                            "grades": [
                                "小学五年级",
                                "高二",
                                "初三",
                                "小学六年级",
                                "小学一年级"
                            ],
                            "experience": 8,
                            "successCases": [
                                {
                                    "description": "进步11分，从班级中游提升到前十",
                                    "improvement": 46,
                                    "duration": 5,
                                    "_id": "67cad10cd8e28a4c8b8c8aca"
                                },
                                {
                                    "description": "提高17分，从班级中游提升到前十",
                                    "improvement": 23,
                                    "duration": 6,
                                    "_id": "67cad10cd8e28a4c8b8c8acb"
                                }
                            ],
                            "_id": "67cad10cd8e28a4c8b8c8ac9"
                        }
                    ]
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
                                "endTime": "16:00"
                            },
                            "晚上": {
                                "startTime": "19:00",
                                "endTime": "21:00"
                            }
                        },
                        "sessions": [
                            {
                                "timeSlot": {
                                    "startTime": "20:00",
                                    "endTime": "21:00"
                                },
                                "day": "周日",
                                "period": "晚上",
                                "available": true,
                                "duration": 120,
                                "status": "booked",
                                "_id": "67cad10cd8e28a4c8b8c8acc"
                            },
                            {
                                "timeSlot": {
                                    "startTime": "09:00",
                                    "endTime": "11:00"
                                },
                                "day": "周日",
                                "period": "早上",
                                "available": true,
                                "duration": 120,
                                "status": "available",
                                "_id": "67cad10cd8e28a4c8b8c8acd"
                            },
                            {
                                "timeSlot": {
                                    "startTime": "15:00",
                                    "endTime": "17:00"
                                },
                                "day": "周日",
                                "period": "下午",
                                "available": true,
                                "duration": 120,
                                "status": "available",
                                "_id": "67cad10cd8e28a4c8b8c8ace"
                            },
                            {
                                "timeSlot": {
                                    "startTime": "14:00",
                                    "endTime": "17:00"
                                },
                                "day": "周六",
                                "period": "下午",
                                "available": true,
                                "duration": 120,
                                "status": "booked",
                                "_id": "67cad10cd8e28a4c8b8c8acf"
                            }
                        ]
                    }
                },
                "location": {
                    "geo": {
                        "type": "Point",
                        "coordinates": [
                            121.53370476795918,
                            31.30378343933782
                        ]
                    },
                    "address": "集栋64号",
                    "district": "东城区",
                    "city": "北京"
                },
                "pricing": {
                    "basePrice": 432
                },
                "teachingStyle": {
                    "description": "专注于考点突破，善于沟通",
                    "keywords": [
                        "趣味教学",
                        "启发式教学"
                    ],
                    "strengths": [
                        "考点分析",
                        "错题分析",
                        "应试策略"
                    ]
                },
                "ratings": {
                    "overall": 4.8,
                    "attitude": 4.6,
                    "teachingQuality": 0,
                    "punctuality": 0,
                    "communication": 0,
                    "effectiveness": 0
                },
                "statistics": {
                    "totalStudents": 29,
                    "totalClasses": 55,
                    "completionRate": 91,
                    "repeatRate": 89
                },
                "isVerified": false,
                "status": "active",
                "_id": "67cad10cd8e28a4c8b8c8ac8",
                "tutorId": "TUTOR_20250307185716",
                "userId": "67cad10cd8e28a4c8b8c8abf",
                "availabilityStatus": "offline",
                "createdAt": "2024-06-25T06:08:51.730Z",
                "updatedAt": "2025-03-06T23:48:45.625Z",
                "__v": 0
            },
```



### 完全适合自己条件的教师 get

```
{{base_url}}parentProfiles/PARENT_20250326145519/tutors/filter
```





### 按条件筛选教师

- **URL**: `/parentProfiles/:parentId/tutors/advanced-filter`
- **方法**: `POST`
- **认证**: 需要 (家长角色)
- **描述**: 按多个条件筛选教师

#### 路径参数

- `parentId`: 家长ID

#### 请求参数

```json
{
  "subject": "数学",
  "minPrice": 200,
  "maxPrice": 500,
  "educationLevel": "一本",
  "minRating": 4.5,
  "minExperience": 3,
  "availabilityStatus": true,
  "session": {
    "day": "周六",
    "period": "下午"
  }
}
```

#### 响应示例

```json
{
  "status": "success",
  "data": {
    "tutors": [
      {
        "tutorId": "TUTOR_20250307185716",
        "name": "王老师",
        "gender": "男",
        "age": 32,
        "educationLevel": "一本",
        "university": "北京师范大学",
        "major": "数学教育",
        "teachingExperience": {
          "years": 5,
          "subjects": [
            {
              "name": "数学",
              "level": ["小学", "初中", "高中"],
              "description": "擅长奥数教学"
            }
          ]
        },
        "location": {
          "city": "北京市",
          "district": "海淀区"
        },
        "pricing": {
          "basePrice": 300,
          "priceRange": {
            "min": 250,
            "max": 350
          }
        },
        "rating": 4.8,
        "availabilityStatus": true,
        "schedule": {
          "weekend": {
            "sessions": [
              {
                "day": "周六",
                "period": "下午",
                "available": true
              }
            ]
          }
        }
      }
    ],
    "count": 1,
    "conditions": {
      "subject": "数学",
      "minPrice": 200,
      "maxPrice": 500,
      "educationLevel": "一本",
      "minRating": 4.5,
      "minExperience": 3,
      "availabilityStatus": true,
      "session": {
        "day": "周六",
        "period": "下午"
      }
    }
  }
}
```

### 获取推荐教师

- **URL**: `/parentProfiles/:parentId/tutors/recommended`
- **方法**: `GET`
- **认证**: 需要 (家长角色)
- **描述**: 获取系统推荐的教师列表

#### 路径参数

- `parentId`: 家长ID

#### 查询参数

- `limit`: 推荐教师数量，默认为3

#### 响应示例

```json
{
  "status": "success",
  "data": {
    "tutors": [
      {
        "tutorId": "TUTOR_20250307185716",
        "name": "王老师",
        "gender": "男",
        "location": {
          "city": "北京市",
          "district": "海淀区"
        },
        "teachingExperience": {
          "subjects": [
            {
              "name": "数学",
              "level": ["小学", "初中", "高中"]
            }
          ]
        },
        "pricing": {
          "basePrice": 300
        },
        "matchScore": 0.9,
        "matchDetails": {
          "priceMatch": true,
          "subjectMatch": true,
          "genderMatch": true,
          "sessionMatch": true
        }
      },
      {
        "tutorId": "TUTOR_20250308123456",
        "name": "李老师",
        "gender": "女",
        "location": {
          "city": "北京市",
          "district": "朝阳区"
        },
        "teachingExperience": {
          "subjects": [
            {
              "name": "英语",
              "level": ["小学", "初中"]
            }
          ]
        },
        "pricing": {
          "basePrice": 280
        },
        "matchScore": 0.7,
        "matchDetails": {
          "priceMatch": true,
          "subjectMatch": true,
          "genderMatch": true,
          "sessionMatch": false
        }
      }
    ],
    "count": 2
  }
}
```

## 求教帖子管理

### 为某一个子女创建求教列表

- 方法**: `POST`
- **认证**: 需要 (家长角色)
- **描述**: 创建新的求教列表

```
{{base_url}}parentProfiles/PARENT_20250326145519/children/CHILD_20250326145519_01/tutoringRequests
```



#### 请求参数

```json
{
  "grade": "小学五年级",
  "childId": "CHILD_20250326145519_01",
  "subjects": [
    {
      "name": "语文",
      "currentScore": "75",
      "targetScore": "90",
      "difficulty": "中等"
    }
  ],
  "location": {
    "address": "北京市朝阳区建国路88号",
    "city": "北京市",
    "district": "朝阳区",
    "coordinates": {
      "type": "Point",
      "coordinates": [116.4716, 39.9088]
    }
  },
  "preferences": {
    "teachingLocation": "家里",
    "teacherGender": "女",
    "teachingStyle": ["有耐心", "善于沟通", "生动有趣"],
    "budget": {
      "min": 200,
      "max": 350,
      "period": "per_hour"
    }
  },
  "status": "published",
  "description": "需要一位有经验的语文老师，能够提高孩子的写作和阅读能力。"
}
```

#### 响应示例

```json
{
  "status": "success",
  "data": {
    "request": {
      "requestId": "REQUEST_20250326145519_1711500000-01",
      "parentId": "PARENT_20250326145519",
      "childId": "CHILD_20250326145519_01",
      "grade": "小学五年级",
      "subjects": [
        {
          "name": "语文",
          "currentScore": "75",
          "targetScore": "90",
          "difficulty": "中等"
        }
      ],
      "location": {
        "address": "北京市朝阳区建国路88号",
        "city": "北京市",
        "district": "朝阳区",
        "coordinates": {
          "type": "Point",
          "coordinates": [116.4716, 39.9088]
        }
      },
      "preferences": {
        "teachingLocation": "家里",
        "teacherGender": "女",
        "teachingStyle": ["有耐心", "善于沟通", "生动有趣"],
        "budget": {
          "min": 200,
          "max": 350,
          "period": "per_hour"
        }
      },
      "status": "published",
      "description": "需要一位有经验的语文老师，能够提高孩子的写作和阅读能力。",
      "createdAt": "2025-03-27T00:00:00.000Z",
      "updatedAt": "2025-03-27T00:00:00.000Z"
    }
  }
}
```

### 更新求教帖子

- ```
  {{base_url}}parentProfiles/PARENT_20250326145519/tutoringRequests/REQUEST_20250326145519_1743007547750-02
  ```
- 
- **方法**: `PUT`
- **认证**: 需要 (家长角色)
- **描述**: 更新求教列表

#### 路径参数

- `requestId`: 求教列表ID

#### 请求参数

```json
{
  "subjects": [
    {
      "name": "语文",
      "currentScore": "78",
      "targetScore": "95",
      "difficulty": "中等"
    },
    {
      "name": "数学",
      "currentScore": "80",
      "targetScore": "90",
      "difficulty": "中等"
    }
  ],
  "preferences": {
    "budget": {
      "min": 250,
      "max": 400,
      "period": "per_hour"
    }
  },
  "description": "需要一位有经验的语文和数学老师，能够提高孩子的综合学习能力。"
}
```

#### 响应示例

```json
{
  "status": "success",
  "data": {
    "request": {
      "requestId": "REQUEST_20250326145519_1711500000-01",
      "subjects": [
        {
          "name": "语文",
          "currentScore": "78",
          "targetScore": "95",
          "difficulty": "中等"
        },
        {
          "name": "数学",
          "currentScore": "80",
          "targetScore": "90",
          "difficulty": "中等"
        }
      ],
      "preferences": {
        "teachingLocation": "家里",
        "teacherGender": "女",
        "teachingStyle": ["有耐心", "善于沟通", "生动有趣"],
        "budget": {
          "min": 250,
          "max": 400,
          "period": "per_hour"
        }
      },
      "description": "需要一位有经验的语文和数学老师，能够提高孩子的综合学习能力。",
      "updatedAt": "2025-03-27T01:00:00.000Z"
    }
  }
}
```

### 获取求教列表

- 
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取求教列表详情

#### 路径参数

- `requestId`: 求教列表ID

#### 响应示例

```json
{
  "status": "success",
  "data": {
    "request": {
      "requestId": "REQUEST_20250326145519_1711500000-01",
      "parentId": "PARENT_20250326145519",
      "childId": "CHILD_20250326145519_01",
      "grade": "小学五年级",
      "subjects": [
        {
          "name": "语文",
          "currentScore": "78",
          "targetScore": "95",
          "difficulty": "中等"
        },
        {
          "name": "数学",
          "currentScore": "80",
          "targetScore": "90",
          "difficulty": "中等"
        }
      ],
      "location": {
        "address": "北京市朝阳区建国路88号",
        "city": "北京市",
        "district": "朝阳区"
      },
      "preferences": {
        "teachingLocation": "家里",
        "teacherGender": "女",
        "teachingStyle": ["有耐心", "善于沟通", "生动有趣"],
        "budget": {
          "min": 250,
          "max": 400,
          "period": "per_hour"
        }
      },
      "status": "published",
      "description": "需要一位有经验的语文和数学老师，能够提高孩子的综合学习能力。",
      "createdAt": "2025-03-27T00:00:00.000Z",
      "updatedAt": "2025-03-27T01:00:00.000Z"
    }
  }
}
```

### 删除求教帖子



- **方法**: `DELETE`
- **认证**: 需要 (家长角色)
- **描述**: 删除求教列表

#### 路径参数

- `requestId`: 求教列表ID

#### 响应示例

```json
{
  "status": "success",
  "message": "求教列表已成功删除"
}
```

## 注意事项

1. 所有需要认证的接口都需要在请求头中添加有效的JWT令牌
2. 家长只能操作自己的资源（档案、子女信息、求教列表等）
3. 创建求教列表时，如果指定了 `status` 为 "open"，系统会自动将其转换为 "published"，并在 `customStatus` 字段中保存原始值
4. 教师筛选API支持多种组合条件，可以根据需要添加或省略部分条件
5. 推荐教师API使用协同过滤算法，根据家长偏好和子女需求提供个性化推荐

## 错误处理

所有API在发生错误时会返回统一格式的错误响应：

```json
{
  "status": "fail",
  "error": {
    "statusCode": 400,
    "status": "fail",
    "isOperational": true
  },
  "message": "错误信息",
  "stack": "错误堆栈信息（仅在开发环境中显示）"
}
```

常见错误码及其含义：
- `400`: 请求参数错误或验证失败
- `401`: 未提供认证令牌或令牌已过期
- `403`: 无权限执行操作
- `404`: 请求的资源不存在
- `500`: 服务器内部错误
