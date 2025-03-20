# 智能家教推荐系统 API 文档 - 认证与用户管理

本文档提供了智能家教推荐系统中与认证和用户管理相关的 API 接口详细信息，方便在 Postman 中进行测试。

## 基础信息

- **基础URL**: `http://localhost:3000/api`
- **认证方式**: JWT Token (在需要认证的接口中，需要在请求头中添加 `Authorization: Bearer <token>`)

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
    "role": "parent" // 可选值: "parent", "teacher", "admin"
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

## 用户管理接口

### 1. 获取用户列表 (仅管理员)

- **URL**: `/users`
- **方法**: `GET`
- **认证**: 需要 (管理员)
- **描述**: 获取所有用户列表
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "users": [
        {
          "username": "user1",
          "role": "parent",
          "customId": "PARENT_20250316123456",
          "status": "active"
        },
        {
          "username": "user2",
          "role": "teacher",
          "customId": "TUTOR_20250316123457",
          "status": "active"
        }
      ]
    }
  }
  ```
- **错误响应** (403):
  ```json
  {
    "status": "error",
    "message": "权限不足"
  }
  ```

### 2. 获取单个用户信息

- **URL**: `/users/:customId`
- **方法**: `GET`
- **认证**: 需要
- **描述**: 获取指定用户的信息
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "username": "test_user",
        "role": "parent",
        "customId": "PARENT_20250316123456",
        "status": "active"
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

### 3. 更新用户信息

- **URL**: `/users/:customId/update`
- **方法**: `POST`
- **认证**: 需要
- **描述**: 更新用户信息
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **请求体**:
  ```json
  {
    "username": "new_username",
    "password": "new_password" // 可选
  }
  ```
- **成功响应** (200):
  ```json
  {
    "status": "success",
    "data": {
      "user": {
        "username": "new_username",
        "role": "parent",
        "customId": "PARENT_20250316123456"
      }
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

### 4. 更新用户状态 (仅管理员)

- **URL**: `/users/:customId/status`
- **方法**: `POST`
- **认证**: 需要 (管理员)
- **描述**: 更新用户状态
- **请求头**:
  ```
  Authorization: Bearer <token>
  ```
- **请求体**:
  ```json
  {
    "status": "inactive" // 可选值: "active", "inactive", "suspended"
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
        "customId": "PARENT_20250316123456",
        "status": "inactive"
      }
    }
  }
  ```
- **错误响应** (403):
  ```json
  {
    "status": "error",
    "message": "权限不足"
  }
  ```

## Postman 测试指南

1. **环境设置**:
   - 创建一个新的环境，设置变量:
     - `baseUrl`: `http://localhost:3000/api`
     - `token`: 空 (登录后会自动填充)

2. **认证流程**:
   - 首先调用注册接口创建用户
   - 然后调用登录接口获取 token
   - 使用脚本自动保存 token:
     ```javascript
     if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       pm.environment.set("token", jsonData.data.token);
     }
     ```

3. **认证请求头设置**:
   - 对于需要认证的请求，在 Headers 中添加:
     ```
     Authorization: Bearer {{token}}
     ```

4. **测试用例**:
   - 为每个请求添加测试脚本，验证响应状态码和数据结构
   - 例如:
     ```javascript
     pm.test("Status code is 200", function () {
       pm.response.to.have.status(200);
     });
     
     pm.test("Response has correct structure", function () {
       var jsonData = pm.response.json();
       pm.expect(jsonData).to.have.property('status');
       pm.expect(jsonData.status).to.eql('success');
     });
     ```
