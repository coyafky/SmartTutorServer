# 智能家教推荐系统 API 文档 - 家教请求管理

本文档提供了智能家教推荐系统中与家教请求管理相关的 API 接口详细信息，方便在 Postman 中进行测试。

## 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: JWT Token (在需要认证的接口中，需要在请求头中添加 `Authorization: Bearer <token>`)

## 家教请求接口

### 1. 创建家教需求帖子

- **URL**: `/tutoring-requests`
- **方法**: `POST`
- **认证**: 需要 (家长角色)
- **描述**: 创建新的家教需求帖子
- **请求头**:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "parentId": "PARENT_20250316123456", // 家长ID
    "childId": "60a1b2c3d4e5f6g7h8i9j0k1", // 子女ID
    "title": "寻找高中数学家教",
    "subjects": [
      {
        "name": "数学",
        "grade": "高中",
        "topics": ["函数", "三角函数", "立体几何"],
        "targetScore": 130,
        "currentLevel": "中等",
        "learningGoals": "提高解题速度和准确率，掌握解题技巧"
      }
    ],
    "schedule": {
      "startDate": "2025-04-01",
      "endDate": "2025-06-30",
      "frequency": "每周2次",
      "preferredDays": [1, 3, 5], // 周一、周三、周五
      "preferredTimeSlots": [
        {
          "startTime": "18:00",
          "endTime": "20:00"
        },
        {
          "startTime": "14:00",
          "endTime": "17:00"
        }
      ],
      "lessonDuration": 120 // 单位：分钟
    },
    "location": {
      "type": "线下", // 可选值: "线上", "线下"
      "address": {
        "province": "广东省",
        "city": "深圳市",
        "district": "南山区",
        "detailAddress": "科技园路1号"
      }
    },
    "budget": {
      "minRate": 200,
      "maxRate": 350,
      "rateType": "小时", // 可选值: "小时", "次", "月"
      "currency": "CNY",
      "negotiable": true
    },
    "requirements": {
      "tutorGender": "不限", // 可选值: "男", "女", "不限"
      "tutorAgeRange": {
        "min": 25,
        "max": 45
      },
      "tutorQualification": ["本科", "研究生"],
      "tutorExperience": "3年以上",
      "teachingStyle": ["耐心", "严谨", "启发式"],
      "otherRequirements": "希望老师有高考辅导经验"
    },
    "urgencyLevel": "中等", // 可选值: "紧急", "中等", "一般"
    "status": "open", // 可选值: "open", "in_progress", "completed", "cancelled"
    "visibility": "public" // 可选值: "public", "private"
  }
  ```
- **成功响应** (201):
  ```json
  {
    "status": "success",
    "data": {
      "request": {
        "requestId": "REQ_20250316123456",
        "parentId": "PARENT_20250316123456",
        "childId": "60a1b2c3d4e5f6g7h8i9j0k1",
        "title": "寻找高中数学家教",
        "subjects": [
          {
            "name": "数学",
            "grade": "高中",
            "topics": ["函数", "三角函数", "立体几何"],
            "targetScore": 130,
            "currentLevel": "中等",
            "learningGoals": "提高解题速度和准确率，掌握解题技巧"
          }
        ],
        "schedule": {
          "startDate": "2025-04-01",
          "endDate": "2025-06-30",
          "frequency": "每周2次",
          "preferredDays": [1, 3, 5],
          "preferredTimeSlots": [
            {
              "startTime": "18:00",
              "endTime": "20:00"
            },
            {
              "startTime": "14:00",
              "endTime": "17:00"
            }
          ],
          "lessonDuration": 120
        },
        "location": {
          "type": "线下",
          "address": {
            "province": "广东省",
            "city": "深圳市",
            "district": "南山区",
            "detailAddress": "科技园路1号"
          }
        },
        "budget": {
          "minRate": 200,
          "maxRate": 350,
          "rateType": "小时",
          "currency": "CNY",
          "negotiable": true
        },
        "requirements": {
          "tutorGender": "不限",
          "tutorAgeRange": {
            "min": 25,
            "max": 45
          },
          "tutorQualification": ["本科", "研究生"],
          "tutorExperience": "3年以上",
          "teachingStyle": ["耐心", "严谨", "启发式"],
          "otherRequirements": "希望老师有高考辅导经验"
        },
        "urgencyLevel": "中等",
        "status": "open",
        "visibility": "public",
        "viewCount": 0,
        "applicationCount": 0,
        "createdAt": "2025-03-16T08:16:23.000Z",
        "updatedAt": "2025-03-16T08:16:23.000Z"
      }
    }
  }
  ```
- **错误响应** (400):
  ```json
  {
    "status": "error",
    "message": "家教需求创建失败: 缺少必要字段"
  }
  ```

### 2. 获取单个家教需求帖子

- **URL**: `/tutoring-requests/:requestId`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取指定家教需求帖子的详细信息
- **路径参数**:
  - `requestId`: 需求帖子ID
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "request": {
        "requestId": "REQ_20250316123456",
        "parentId": "PARENT_20250316123456",
        "childId": "60a1b2c3d4e5f6g7h8i9j0k1",
        "title": "寻找高中数学家教",
        "subjects": [
          {
            "name": "数学",
            "grade": "高中",
            "topics": ["函数", "三角函数", "立体几何"],
            "targetScore": 130,
            "currentLevel": "中等",
            "learningGoals": "提高解题速度和准确率，掌握解题技巧"
          }
        ],
        "schedule": {
          "startDate": "2025-04-01",
          "endDate": "2025-06-30",
          "frequency": "每周2次",
          "preferredDays": [1, 3, 5],
          "preferredTimeSlots": [
            {
              "startTime": "18:00",
              "endTime": "20:00"
            },
            {
              "startTime": "14:00",
              "endTime": "17:00"
            }
          ],
          "lessonDuration": 120
        },
        "location": {
          "type": "线下",
          "address": {
            "province": "广东省",
            "city": "深圳市",
            "district": "南山区",
            "detailAddress": "科技园路1号"
          }
        },
        "budget": {
          "minRate": 200,
          "maxRate": 350,
          "rateType": "小时",
          "currency": "CNY",
          "negotiable": true
        },
        "requirements": {
          "tutorGender": "不限",
          "tutorAgeRange": {
            "min": 25,
            "max": 45
          },
          "tutorQualification": ["本科", "研究生"],
          "tutorExperience": "3年以上",
          "teachingStyle": ["耐心", "严谨", "启发式"],
          "otherRequirements": "希望老师有高考辅导经验"
        },
        "urgencyLevel": "中等",
        "status": "open",
        "visibility": "public",
        "viewCount": 1,
        "applicationCount": 0,
        "createdAt": "2025-03-16T08:16:23.000Z",
        "updatedAt": "2025-03-16T08:16:23.000Z",
        "parent": {
          "nickname": "家长昵称",
          "location": {
            "city": "深圳市",
            "district": "南山区"
          }
        },
        "child": {
          "name": "张小明",
          "gender": "男",
          "age": 16,
          "grade": "高中一年级"
        }
      }
    }
  }
  ```
- **错误响应** (404):
  ```json
  {
    "status": "error",
    "message": "未找到家教需求帖子"
  }
  ```

### 3. 更新家教需求帖子

- **URL**: `/tutoring-requests/:requestId`
- **方法**: `PUT`
- **认证**: 需要 (家长角色)
- **描述**: 更新家教需求帖子
- **路径参数**:
  - `requestId`: 需求帖子ID
- **请求头**:
  ```
  Authorization: Bearer <token>
  Content-Type: application/json
  ```
- **请求体**:
  ```json
  {
    "title": "急寻高中数学家教",
    "subjects": [
      {
        "name": "数学",
        "grade": "高中",
        "topics": ["函数", "三角函数", "立体几何", "概率统计"],
        "targetScore": 140,
        "currentLevel": "中等",
        "learningGoals": "提高解题速度和准确率，掌握解题技巧"
      }
    ],
    "schedule": {
      "frequency": "每周3次",
      "preferredDays": [1, 3, 5, 6]
    },
    "budget": {
      "minRate": 250,
      "maxRate": 400
    },
    "urgencyLevel": "紧急",
    "status": "open"
  }
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "request": {
        "requestId": "REQ_20250316123456",
        "parentId": "PARENT_20250316123456",
        "childId": "60a1b2c3d4e5f6g7h8i9j0k1",
        "title": "急寻高中数学家教",
        "subjects": [
          {
            "name": "数学",
            "grade": "高中",
            "topics": ["函数", "三角函数", "立体几何", "概率统计"],
            "targetScore": 140,
            "currentLevel": "中等",
            "learningGoals": "提高解题速度和准确率，掌握解题技巧"
          }
        ],
        "schedule": {
          "startDate": "2025-04-01",
          "endDate": "2025-06-30",
          "frequency": "每周3次",
          "preferredDays": [1, 3, 5, 6],
          "preferredTimeSlots": [
            {
              "startTime": "18:00",
              "endTime": "20:00"
            },
            {
              "startTime": "14:00",
              "endTime": "17:00"
            }
          ],
          "lessonDuration": 120
        },
        "location": {
          "type": "线下",
          "address": {
            "province": "广东省",
            "city": "深圳市",
            "district": "南山区",
            "detailAddress": "科技园路1号"
          }
        },
        "budget": {
          "minRate": 250,
          "maxRate": 400,
          "rateType": "小时",
          "currency": "CNY",
          "negotiable": true
        },
        "requirements": {
          "tutorGender": "不限",
          "tutorAgeRange": {
            "min": 25,
            "max": 45
          },
          "tutorQualification": ["本科", "研究生"],
          "tutorExperience": "3年以上",
          "teachingStyle": ["耐心", "严谨", "启发式"],
          "otherRequirements": "希望老师有高考辅导经验"
        },
        "urgencyLevel": "紧急",
        "status": "open",
        "visibility": "public",
        "viewCount": 1,
        "applicationCount": 0,
        "updatedAt": "2025-03-16T09:16:23.000Z"
      }
    }
  }
  ```
- **错误响应** (404):
  ```json
  {
    "status": "error",
    "message": "未找到家教需求帖子"
  }
  ```

### 4. 删除家教需求帖子

- **URL**: `/tutoring-requests/:requestId`
- **方法**: `DELETE`
- **认证**: 需要 (家长角色)
- **描述**: 删除家教需求帖子
- **路径参数**:
  - `requestId`: 需求帖子ID
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **成功响应** (204): 无内容
- **错误响应** (404):
  ```json
  {
    "status": "error",
    "message": "未找到家教需求帖子"
  }
  ```

### 5. 查询家教需求帖子列表

- **URL**: `/tutoring-requests`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 查询家教需求帖子列表，支持筛选和分页
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **查询参数**:
  - `page`: 页码，默认为 1
  - `limit`: 每页数量，默认为 10
  - `sort`: 排序字段，例如 `-createdAt,urgencyLevel`
  - `subject`: 科目，例如 `数学`
  - `grade`: 年级，例如 `高中`
  - `location`: 地区，例如 `深圳市`
  - `minBudget`: 最低预算，例如 `200`
  - `maxBudget`: 最高预算，例如 `400`
  - `status`: 状态，例如 `open`
  - `parentId`: 家长ID，例如 `PARENT_20250316123456`
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "results": 5,
    "data": {
      "requests": [
        {
          "requestId": "REQ_20250316123456",
          "title": "急寻高中数学家教",
          "subjects": [
            {
              "name": "数学",
              "grade": "高中"
            }
          ],
          "location": {
            "type": "线下",
            "address": {
              "city": "深圳市",
              "district": "南山区"
            }
          },
          "budget": {
            "minRate": 250,
            "maxRate": 400,
            "rateType": "小时"
          },
          "urgencyLevel": "紧急",
          "status": "open",
          "createdAt": "2025-03-16T08:16:23.000Z",
          "parent": {
            "nickname": "家长昵称"
          }
        },
        // ... 更多需求帖子
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "totalPages": 1,
        "totalResults": 5
      }
    }
  }
  ```

## Postman 测试指南

1. **环境设置**:
   - 使用与认证和用户 API 相同的环境
   - 确保已经设置了 `baseUrl` 和 `token` 变量

2. **测试流程**:
   - 首先调用认证接口获取 token
   - 创建家长档案和子女信息
   - 创建家教需求帖子
   - 获取、更新和删除家教需求帖子
   - 查询家教需求帖子列表

3. **测试集合**:
   - 创建一个测试集合，包含所有家教需求相关的接口
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
       pm.environment.set("requestId", jsonData.data.request.requestId);
     }
     ```

5. **自动化测试**:
   - 创建一个运行顺序，按照以下顺序执行请求:
     1. 登录获取 token
     2. 创建家长档案和子女信息
     3. 创建家教需求帖子
     4. 获取家教需求帖子
     5. 更新家教需求帖子
     6. 查询家教需求帖子列表
     7. 删除家教需求帖子
