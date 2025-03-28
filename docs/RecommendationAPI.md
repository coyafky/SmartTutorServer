# 智能家教推荐系统 API 文档

## 推荐系统接口文档

本文档详细描述了智能家教推荐系统中与推荐功能相关的 API 接口。系统基于地理位置和协同过滤算法，为教师和家长提供个性化的推荐服务。

### 基础信息

- **基础路径**: `/api/v1`
- **认证方式**: JWT Token (在请求头中添加 `Authorization: Bearer <token>`)
- **响应格式**: JSON

### 通用响应格式

成功响应:
```json
{
  "success": true,
  "data": {}, // 返回的数据
  "message": "操作成功"
}
```

错误响应:
```json
{
  "success": false,
  "message": "错误信息",
  "error": "详细错误描述"
}
```

## 1. 教师角色接口

### 1.1 获取推荐家教需求

为教师推荐合适的家教需求，基于地理位置和匹配度评分。

- **URL**: `/recommendations/requests`
- **方法**: `GET`
- **权限**: 需要教师身份认证
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| limit | Number | 否 | 返回结果数量限制，默认为 10 |
| maxDistance | Number | 否 | 最大距离限制（公里），默认为 10 |

- **成功响应**:

```json
{
  "success": true,
  "data": [
    {
      "requestId": "REQ123456",
      "parentId": "PAR123456",
      "subject": "数学",
      "grade": "高中",
      "price": {
        "min": 150,
        "max": 200
      },
      "location": {
        "city": "北京",
        "district": "海淀区",
        "address": "中关村",
        "coordinates": [116.3, 39.9]
      },
      "schedule": {
        "weekdays": ["周一", "周三", "周五"],
        "timeSlots": ["18:00-20:00"]
      },
      "requirements": "需要有高考辅导经验",
      "matchScore": 85
    }
  ],
  "message": "获取推荐家教需求成功"
}
```

- **错误响应**:

```json
{
  "success": false,
  "message": "获取推荐家教需求失败",
  "error": "错误详情"
}
```

## 2. 家长角色接口

### 2.1 获取推荐教师

为家长推荐合适的教师，基于地理位置和匹配度评分。

- **URL**: `/recommendations/tutors`
- **方法**: `GET`
- **权限**: 需要家长身份认证
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| limit | Number | 否 | 返回结果数量限制，默认为 10 |
| maxDistance | Number | 否 | 最大距离限制（公里），默认为 10 |

- **成功响应**:

```json
{
  "success": true,
  "data": [
    {
      "tutorId": "TUT123456",
      "name": "张老师",
      "subjects": ["数学", "物理"],
      "grades": ["初中", "高中"],
      "priceRange": {
        "min": 150,
        "max": 250
      },
      "location": {
        "city": "北京",
        "district": "朝阳区",
        "coordinates": [116.4, 39.9]
      },
      "education": {
        "degree": "硕士",
        "major": "应用数学",
        "school": "北京大学"
      },
      "experience": 5,
      "rating": 4.8,
      "matchScore": 92
    }
  ],
  "message": "获取推荐教师成功"
}
```

- **错误响应**:

```json
{
  "success": false,
  "message": "获取推荐教师失败",
  "error": "错误详情"
}
```

## 3. 通用接口

### 3.1 提交匹配反馈

用户（教师或家长）对匹配结果提交反馈，用于改进推荐系统。

- **URL**: `/recommendations/feedback`
- **方法**: `POST`
- **权限**: 需要用户身份认证（教师或家长）
- **请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| matchId | String | 是 | 匹配记录ID |
| rating | Number | 是 | 评分（1-5） |
| review | String | 否 | 评价内容 |
| role | String | 是 | 角色，必须是 "parent" 或 "tutor" |

- **请求示例**:

```json
{
  "matchId": "MATCH123456",
  "rating": 4,
  "review": "教学方法很好，孩子进步明显",
  "role": "parent"
}
```

- **成功响应**:

```json
{
  "success": true,
  "message": "反馈提交成功"
}
```

- **错误响应**:

```json
{
  "success": false,
  "message": "反馈提交失败",
  "error": "错误详情"
}
```

## 4. 管理员接口

### 4.1 训练推荐模型（已废弃）

此接口已废弃，因为系统不再使用机器学习模型。

- **URL**: `/admin/recommendations/train`
- **方法**: `POST`
- **权限**: 需要管理员身份认证
- **请求参数**: 无
- **成功响应**:

```json
{
  "success": true,
  "message": "系统已不再使用机器学习模型，此功能已废弃"
}
```

## 5. 推荐算法说明

### 5.1 地理位置推荐

系统基于用户的地理位置信息，优先推荐同城市的匹配对象，然后是附近城市的匹配对象。使用 Haversine 公式计算两点之间的球面距离，以提供基于距离的排序。

### 5.2 匹配度评分

系统根据以下因素计算匹配度评分：

1. **学科匹配度**：教师擅长的学科与需求学科的匹配程度
2. **年级匹配度**：教师教授的年级与需求年级的匹配程度
3. **价格匹配度**：教师的价格范围与家长的预算匹配程度
4. **地理位置匹配度**：基于距离计算的匹配程度

### 5.3 协同过滤推荐

系统使用基于用户的协同过滤算法，根据用户的历史匹配和评分数据，找到相似用户，并基于相似用户的偏好提供推荐。

## 6. 错误代码说明

| 错误代码 | 描述 |
|---------|------|
| 400 | 请求参数错误 |
| 401 | 未授权访问 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 7. 版本历史

| 版本 | 日期 | 描述 |
|------|------|------|
| v1.0 | 2025-03-20 | 初始版本 |
| v1.1 | 2025-03-20 | 移除机器学习推荐功能，优化传统推荐算法 |
