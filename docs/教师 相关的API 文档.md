# 教师 相关的API 文档

# 教师创建个人信息



基础API POST

http://localhost:3000/api/tutorProfiles/profile

Token

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21JZCI6IlRVVE9SXzIwMjUwMzI2MjMxOTMyIiwicm9sZSI6InRlYWNoZXIiLCJpYXQiOjE3NDMwMzExOTUsImV4cCI6MTc0MzExNzU5NX0.6Ut0l0mQfpWC7ik_4vynU4BZOLz9gyAK0u4eGl6MMIk
```



响应结果

##### 201 Created

A new resource was created successfully.

```
{
  "tutorId": "TUTOR_20250323055645", // 应与用户的 customId 一致
  
  "firstName": "王",
  "lastName": "老师",
  "gender": "男",
  "education": {
    "level": "985",
    "school": "北京大学",
    "major": "应用数学",
    "graduationYear": 2015
  },
  "teachingExperience": {
    "years": 10,
    "subjects": [
      {
        "name": "数学",
        "grades": ["初中", "高中"],
        "experience": 8,
        "successCases": [
          {
            "description": "帮助学生数学成绩从60分提升到90分",
            "improvement": 50,
            "duration": 12
          }
        ]
      }
    ]
  },
  "location": {
    "address": "科技园路1号",
    "district": "南山区",
    "city": "深圳市",
    "geo": {
      "coordinates": [114.0579, 22.5431]
    }
  },
  "pricing": {
    "basePrice": 300
  },
  "teachingStyle": {
    "description": "注重基础训练和思维拓展",
    "keywords": ["耐心", "严谨", "启发式"],
    "strengths": ["解题技巧", "考点分析"]
  }

}
```



# 教师更新个人信息

方法 PATCH

Token

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjdXN0b21JZCI6IlRVVE9SXzIwMjUwMzIzMDU1NjQ1Iiwicm9sZSI6InRlYWNoZXIiLCJpYXQiOjE3NDI3MDk0NDUsImV4cCI6MTc0Mjc5NTg0NX0.xENgoo2rTsVFdBjxBKh4HpvhgcG0JFhwebtndU4BB4A
```



http://localhost:3000/api/tutorProfiles/profile

```
{
  "location": {
    "address": "科技园路1号腾讯大厦",
    "district": "南山区",
    "city": "北京市",
    "geo": {
      "type": "Point",
      "coordinates": [113.953411, 22.549176]
    }
  }
}
```



# 教师更新 时薪

PATCH

```
http://localhost:3000/api/tutorProfiles/profile/pricing
```

```
{
  "basePrice": 100
 
}
```

```
{
    "status": "success",
    "data": {
        "profile": {
            "education": {
                "graduationYear": 2025
            },
            "teachingExperience": {
                "years": 10,
                "subjects": [
                    {
                        "name": "初中数学",
                        "grades": [
                            "初中"
                        ],
                        "experience": 5,
                        "successCases": [
                            {
                                "description": "帮助学生在中考数学中获得满分",
                                "improvement": 40,
                                "duration": 18,
                                "_id": "67dfabd810e50edf46cca573"
                            }
                        ],
                        "_id": "67dfabd810e50edf46cca572"
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
                    "coordinates": [
                        114.0579,
                        22.5431
                    ],
                    "type": "Point"
                },
                "address": "科技园路1号",
                "district": "南山区",
                "city": "深圳市"
            },
            "pricing": {
                "basePrice": 100
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
            "_id": "67dfa7e810e50edf46cca558",
            "isVerified": false,
            "status": "active",
            "tutorId": "TUTOR_20250323055645",
            "userId": "67dfa29d579667c2d07e0618",
            "firstName": "王",
            "lastName": "老师",
            "gender": "男",
            "availabilityStatus": "offline",
            "createdAt": "2025-03-23T06:19:20.056Z",
            "updatedAt": "2025-03-23T07:14:22.689Z",
            "__v": 3
        }
    }
}
```



# 教师更新教学风格



```
{
  "description": "注重基础训练和思维拓展",
  "keywords": ["耐心", "严谨"]

}
```



```
{
    "status": "success",
    "data": {
        "profile": {
            "education": {
                "graduationYear": 2025
            },
            "teachingExperience": {
                "years": 10,
                "subjects": [
                    {
                        "name": "初中数学",
                        "grades": [
                            "初中"
                        ],
                        "experience": 5,
                        "successCases": [
                            {
                                "description": "帮助学生在中考数学中获得满分",
                                "improvement": 40,
                                "duration": 18,
                                "_id": "67dfabd810e50edf46cca573"
                            }
                        ],
                        "_id": "67dfabd810e50edf46cca572"
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
                    "coordinates": [
                        114.0579,
                        22.5431
                    ],
                    "type": "Point"
                },
                "address": "科技园路1号",
                "district": "南山区",
                "city": "深圳市"
            },
            "pricing": {
                "basePrice": 100
            },
            "teachingStyle": {
                "strengths": [],
                "description": "注重基础训练和思维拓展",
                "keywords": [
                    "耐心",
                    "严谨"
                ]
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
            "_id": "67dfa7e810e50edf46cca558",
            "isVerified": false,
            "status": "active",
            "tutorId": "TUTOR_20250323055645",
            "userId": "67dfa29d579667c2d07e0618",
            "firstName": "王",
            "lastName": "老师",
            "gender": "男",
            "availabilityStatus": "offline",
            "createdAt": "2025-03-23T06:19:20.056Z",
            "updatedAt": "2025-03-23T07:17:05.380Z",
            "__v": 3
        }
    }
}
```



# 获取相同城市的帖子

```
http://localhost:3000/api/tutorProfiles/profiles/city-requests
```

```
{
    "status": "success",
    "data": {
        "requests": [
            {
                "_id": "67dd13567cdd60f05be987ba",
                "requestId": "REQUEST_20250320025248_1742541654838-02",
                "status": "open",
                "parentId": "PARENT_20250320025248",
                "childId": "CHILD_20250320025248_03",
                "grade": "小学五年级",
                "location": {
                    "coordinates": {
                        "type": "Point",
                        "coordinates": [
                            116.4716,
                            39.9088
                        ]
                    },
                    "address": "北京市朝阳区建国路88号",
                    "district": "朝阳区",
                    "city": "北京市",
                    "_id": "67dd13567cdd60f05be987bb"
                },
                "subjects": [
                    {
                        "name": "语文",
                        "currentScore": "75",
                        "targetScore": "95",
                        "difficulty": "中等",
                        "_id": "67dd14597cdd60f05be987ec"
                    },
                    {
                        "name": "数学",
                        "currentScore": "80",
                        "targetScore": "90",
                        "difficulty": "较难",
                        "_id": "67dd14597cdd60f05be987ed"
                    }
                ],
                "preferences": {
                    "budget": {
                        "min": 250,
                        "max": 400,
                        "period": "per_hour"
                    },
                    "teachingLocation": "家里",
                    "teacherGender": "女",
                    "teachingStyle": [
                        "有耐心",
                        "善于沟通",
                        "生动有趣",
                        "擅长激发学习兴趣"
                    ],
                    "_id": "67dd14597cdd60f05be987eb"
                },
                "reports": [],
                "createdAt": "2025-03-21T07:20:54.904Z",
                "updatedAt": "2025-03-21T07:25:13.983Z",
                "__v": 0
            },
            {
                "_id": "67dc2223a38afd38537f9bee",
                "requestId": "REQUEST_20250320025248_1742479907894-01",
                "status": "open",
                "parentId": "PARENT_20250320025248",
                "childId": "CHILD_20250320025248_03",
                "grade": "高中二年级",
                "location": {
                    "coordinates": {
                        "type": "Point",
                        "coordinates": [
                            116.4716,
                            39.9087
                        ]
                    },
                    "address": "北京市朝阳区建国路88号",
                    "district": "朝阳区",
                    "city": "北京市",
                    "_id": "67dc2223a38afd38537f9bef"
                },
                "subjects": [
                    {
                        "name": "数学",
                        "currentScore": "82",
                        "targetScore": "95",
                        "difficulty": "较难",
                        "_id": "67dc2223a38afd38537f9bf0"
                    },
                    {
                        "name": "物理",
                        "currentScore": "78",
                        "targetScore": "90",
                        "difficulty": "中等",
                        "_id": "67dc2223a38afd38537f9bf1"
                    },
                    {
                        "name": "化学",
                        "currentScore": "85",
                        "targetScore": "92",
                        "difficulty": "简单",
                        "_id": "67dc2223a38afd38537f9bf2"
                    }
                ],
                "preferences": {
                    "budget": {
                        "min": 200,
                        "max": 350,
                        "period": "per_hour"
                    },
                    "teachingLocation": "家里",
                    "teacherGender": "女",
                    "teachingStyle": [
                        "耐心",
                        "善于沟通",
                        "有趣",
                        "严谨"
                    ],
                    "_id": "67dc2223a38afd38537f9bf3"
                },
                "reports": [],
                "createdAt": "2025-03-20T14:11:47.954Z",
                "updatedAt": "2025-03-20T14:11:47.954Z",
                "__v": 0
            },
            {
                "_id": "67dc218feb7706cd8acb99a9",
                "requestId": "REQUEST_20250320025248_1742479759657-02",
                "status": "open",
                "parentId": "67db85bf4ce0abdd6f73b7b5",
                "childId": "CHILD_0250320025248_03",
                "grade": "高中二年级",
                "location": {
                    "coordinates": {
                        "type": "Point",
                        "coordinates": [
                            116.4716,
                            39.9087
                        ]
                    },
                    "address": "北京市朝阳区建国路88号",
                    "district": "朝阳区",
                    "city": "北京市",
                    "_id": "67dc218feb7706cd8acb99aa"
                },
                "subjects": [
                    {
                        "name": "数学",
                        "currentScore": "82",
                        "targetScore": "95",
                        "difficulty": "较难",
                        "_id": "67dc218feb7706cd8acb99ab"
                    },
                    {
                        "name": "物理",
                        "currentScore": "78",
                        "targetScore": "90",
                        "difficulty": "中等",
                        "_id": "67dc218feb7706cd8acb99ac"
                    },
                    {
                        "name": "化学",
                        "currentScore": "85",
                        "targetScore": "92",
                        "difficulty": "简单",
                        "_id": "67dc218feb7706cd8acb99ad"
                    }
                ],
                "preferences": {
                    "budget": {
                        "min": 200,
                        "max": 350,
                        "period": "per_hour"
                    },
                    "teachingLocation": "家里",
                    "teacherGender": "女",
                    "teachingStyle": [
                        "耐心",
                        "善于沟通",
                        "有趣",
                        "严谨"
                    ],
                    "_id": "67dc218feb7706cd8acb99ae"
                },
                "reports": [],
                "createdAt": "2025-03-20T14:09:19.691Z",
                "updatedAt": "2025-03-20T14:09:19.691Z",
                "__v": 0
            },
            {
                "_id": "67dc1e9aeb7706cd8acb9992",
                "requestId": "REQUEST_20250320025248_1742479002930-01",
                "status": "open",
                "parentId": "67db85bf4ce0abdd6f73b7b5",
                "childId": "CHILD_0250320025248_03",
                "grade": "高中二年级",
                "location": {
                    "coordinates": {
                        "type": "Point",
                        "coordinates": [
                            116.4716,
                            39.9087
                        ]
                    },
                    "address": "北京市朝阳区建国路88号",
                    "district": "朝阳区",
                    "city": "北京市",
                    "_id": "67dc1e9aeb7706cd8acb9993"
                },
                "subjects": [
                    {
                        "name": "数学",
                        "currentScore": "82",
                        "targetScore": "95",
                        "difficulty": "较难",
                        "_id": "67dc1e9aeb7706cd8acb9994"
                    },
                    {
                        "name": "物理",
                        "currentScore": "78",
                        "targetScore": "90",
                        "difficulty": "中等",
                        "_id": "67dc1e9aeb7706cd8acb9995"
                    },
                    {
                        "name": "化学",
                        "currentScore": "85",
                        "targetScore": "92",
                        "difficulty": "简单",
                        "_id": "67dc1e9aeb7706cd8acb9996"
                    }
                ],
                "preferences": {
                    "budget": {
                        "min": 200,
                        "max": 350,
                        "period": "per_hour"
                    },
                    "teachingLocation": "家里",
                    "teacherGender": "女",
                    "teachingStyle": [
                        "耐心",
                        "善于沟通",
                        "有趣",
                        "严谨"
                    ],
                    "_id": "67dc1e9aeb7706cd8acb9997"
                },
                "reports": [],
                "createdAt": "2025-03-20T13:56:42.944Z",
                "updatedAt": "2025-03-20T13:56:42.944Z",
                "__v": 0
            }
        ],
        "pagination": {
            "total": 4,
            "page": 1,
            "limit": 10,
            "pages": 1
        }
    }
}
```



# 获取过滤的帖子



```
http://localhost:3000/api/tutorProfiles/profile/city-requests/filters?subject=化学
```

```
{
    "status": "success",
    "data": {
        "requests": [
            {
                "_id": "67dc2223a38afd38537f9bee",
                "requestId": "REQUEST_20250320025248_1742479907894-01",
                "status": "open",
                "parentId": "PARENT_20250320025248",
                "childId": "CHILD_20250320025248_03",
                "grade": "高中二年级",
                "location": {
                    "coordinates": {
                        "type": "Point",
                        "coordinates": [
                            116.4716,
                            39.9087
                        ]
                    },
                    "address": "北京市朝阳区建国路88号",
                    "district": "朝阳区",
                    "city": "北京市",
                    "_id": "67dc2223a38afd38537f9bef"
                },
                "subjects": [
                    {
                        "name": "数学",
                        "currentScore": "82",
                        "targetScore": "95",
                        "difficulty": "较难",
                        "_id": "67dc2223a38afd38537f9bf0"
                    },
                    {
                        "name": "物理",
                        "currentScore": "78",
                        "targetScore": "90",
                        "difficulty": "中等",
                        "_id": "67dc2223a38afd38537f9bf1"
                    },
                    {
                        "name": "化学",
                        "currentScore": "85",
                        "targetScore": "92",
                        "difficulty": "简单",
                        "_id": "67dc2223a38afd38537f9bf2"
                    }
                ],
                "preferences": {
                    "budget": {
                        "min": 200,
                        "max": 350,
                        "period": "per_hour"
                    },
                    "teachingLocation": "家里",
                    "teacherGender": "女",
                    "teachingStyle": [
                        "耐心",
                        "善于沟通",
                        "有趣",
                        "严谨"
                    ],
                    "_id": "67dc2223a38afd38537f9bf3"
                },
                "reports": [],
                "createdAt": "2025-03-20T14:11:47.954Z",
                "updatedAt": "2025-03-20T14:11:47.954Z",
                "__v": 0
            },
            {
                "_id": "67dc218feb7706cd8acb99a9",
                "requestId": "REQUEST_20250320025248_1742479759657-02",
                "status": "open",
                "parentId": "67db85bf4ce0abdd6f73b7b5",
                "childId": "CHILD_0250320025248_03",
                "grade": "高中二年级",
                "location": {
                    "coordinates": {
                        "type": "Point",
                        "coordinates": [
                            116.4716,
                            39.9087
                        ]
                    },
                    "address": "北京市朝阳区建国路88号",
                    "district": "朝阳区",
                    "city": "北京市",
                    "_id": "67dc218feb7706cd8acb99aa"
                },
                "subjects": [
                    {
                        "name": "数学",
                        "currentScore": "82",
                        "targetScore": "95",
                        "difficulty": "较难",
                        "_id": "67dc218feb7706cd8acb99ab"
                    },
                    {
                        "name": "物理",
                        "currentScore": "78",
                        "targetScore": "90",
                        "difficulty": "中等",
                        "_id": "67dc218feb7706cd8acb99ac"
                    },
                    {
                        "name": "化学",
                        "currentScore": "85",
                        "targetScore": "92",
                        "difficulty": "简单",
                        "_id": "67dc218feb7706cd8acb99ad"
                    }
                ],
                "preferences": {
                    "budget": {
                        "min": 200,
                        "max": 350,
                        "period": "per_hour"
                    },
                    "teachingLocation": "家里",
                    "teacherGender": "女",
                    "teachingStyle": [
                        "耐心",
                        "善于沟通",
                        "有趣",
                        "严谨"
                    ],
                    "_id": "67dc218feb7706cd8acb99ae"
                },
                "reports": [],
                "createdAt": "2025-03-20T14:09:19.691Z",
                "updatedAt": "2025-03-20T14:09:19.691Z",
                "__v": 0
            },
            {
                "_id": "67dc1e9aeb7706cd8acb9992",
                "requestId": "REQUEST_20250320025248_1742479002930-01",
                "status": "open",
                "parentId": "67db85bf4ce0abdd6f73b7b5",
                "childId": "CHILD_0250320025248_03",
                "grade": "高中二年级",
                "location": {
                    "coordinates": {
                        "type": "Point",
                        "coordinates": [
                            116.4716,
                            39.9087
                        ]
                    },
                    "address": "北京市朝阳区建国路88号",
                    "district": "朝阳区",
                    "city": "北京市",
                    "_id": "67dc1e9aeb7706cd8acb9993"
                },
                "subjects": [
                    {
                        "name": "数学",
                        "currentScore": "82",
                        "targetScore": "95",
                        "difficulty": "较难",
                        "_id": "67dc1e9aeb7706cd8acb9994"
                    },
                    {
                        "name": "物理",
                        "currentScore": "78",
                        "targetScore": "90",
                        "difficulty": "中等",
                        "_id": "67dc1e9aeb7706cd8acb9995"
                    },
                    {
                        "name": "化学",
                        "currentScore": "85",
                        "targetScore": "92",
                        "difficulty": "简单",
                        "_id": "67dc1e9aeb7706cd8acb9996"
                    }
                ],
                "preferences": {
                    "budget": {
                        "min": 200,
                        "max": 350,
                        "period": "per_hour"
                    },
                    "teachingLocation": "家里",
                    "teacherGender": "女",
                    "teachingStyle": [
                        "耐心",
                        "善于沟通",
                        "有趣",
                        "严谨"
                    ],
                    "_id": "67dc1e9aeb7706cd8acb9997"
                },
                "reports": [],
                "createdAt": "2025-03-20T13:56:42.944Z",
                "updatedAt": "2025-03-20T13:56:42.944Z",
                "__v": 0
            }
        ],
        "pagination": {
            "total": 3,
            "page": 1,
            "limit": 10,
            "pages": 1
        }
    }
}
```



教师获取推荐的帖子

```
{{base_url}}tutorProfiles/profile/recommended-requests
```

```
{
    "status": "success",
    "data": {
        "recommendations": [
            {
                "request": {
                    "_id": "67e3bfe413a3b0a292f1797f",
                    "requestId": "REQUEST_PARENT_20250326162501_174297904528",
                    "status": "published",
                    "reviewedAt": "2025-03-25T23:08:39.456Z",
                    "reviewedBy": "ADMIN_QRl6D4gB",
                    "reviewNote": null,
                    "reports": [],
                    "parentId": "PARENT_20250326162501",
                    "childId": "CHILD_20250326162501_02",
                    "grade": "小学三年级",
                    "location": {
                        "coordinates": {
                            "type": "Point",
                            "coordinates": [
                                -120.4895,
                                -28.3029
                            ]
                        },
                        "address": "北京朝阳区浮巷3号",
                        "district": "朝阳区",
                        "city": "北京",
                        "_id": "67e3bfe413a3b0a292f17980"
                    },
                    "subjects": [
                        {
                            "name": "数学",
                            "currentScore": "74",
                            "targetScore": "89",
                            "difficulty": "中等",
                            "_id": "67e3bfe413a3b0a292f17981"
                        }
                    ],
                    "preferences": {
                        "budget": {
                            "min": 198,
                            "max": 370,
                            "period": "per_hour"
                        },
                        "teachingLocation": "其他",
                        "teacherGender": "不限",
                        "teachingStyle": [
                            "互动式教学"
                        ],
                        "_id": "67e3bfe413a3b0a292f17982"
                    },
                    "createdAt": "2025-03-26T01:53:29.753Z",
                    "updatedAt": "2025-03-25T21:23:36.320Z",
                    "__v": 0
                },
                "score": 0.8999999999999999,
                "matchDetails": {
                    "baseScore": 0.3,
                    "priceScore": 0.1,
                    "subjectScore": 0.3,
                    "genderScore": 0.2,
                    "timeScore": 0
                }
            },
            {
                "request": {
                    "_id": "67e3bfe413a3b0a292f179ea",
                    "requestId": "REQUEST_PARENT_20250326162524_174297904549",
                    "status": "published",
                    "reviewedAt": "2025-03-25T15:57:50.807Z",
                    "reviewedBy": null,
                    "reviewNote": null,
                    "reports": [],
                    "parentId": "PARENT_20250326162524",
                    "childId": "CHILD_20250326162524_01",
                    "grade": "高中三年级",
                    "location": {
                        "coordinates": {
                            "type": "Point",
                            "coordinates": [
                                107.3565,
                                -45.6228
                            ]
                        },
                        "address": "北京西城区剑侬5966号",
                        "district": "西城区",
                        "city": "北京",
                        "_id": "67e3bfe413a3b0a292f179eb"
                    },
                    "subjects": [
                        {
                            "name": "数学",
                            "currentScore": "64",
                            "targetScore": "86",
                            "difficulty": "困难",
                            "_id": "67e3bfe413a3b0a292f179ec"
                        }
                    ],
                    "preferences": {
                        "budget": {
                            "min": 183,
                            "max": 325,
                            "period": "per_session"
                        },
                        "teachingLocation": "教师家",
                        "teacherGender": "不限",
                        "teachingStyle": [
                            "翻转课堂"
                        ],
                        "_id": "67e3bfe413a3b0a292f179ed"
                    },
                    "createdAt": "2025-03-25T12:28:47.990Z",
                    "updatedAt": "2025-03-25T12:10:42.337Z",
                    "__v": 0
                },
                "score": 0.8999999999999999,
                "matchDetails": {
                    "baseScore": 0.3,
                    "priceScore": 0.1,
                    "subjectScore": 0.3,
                    "genderScore": 0.2,
                    "timeScore": 0
                }
            },
            {
                "request": {
                    "_id": "67e3bfe413a3b0a292f177e7",
                    "requestId": "REQUEST_PARENT_20250326162526_174297904449",
                    "status": "published",
                    "reviewedAt": "2025-03-26T07:53:26.425Z",
                    "reviewedBy": "ADMIN_bGXjl6DE",
                    "reviewNote": null,
                    "reports": [],
                    "parentId": "PARENT_20250326162526",
                    "childId": "CHILD_20250326162526_01",
                    "grade": "初中一年级",
                    "location": {
                        "coordinates": {
                            "type": "Point",
                            "coordinates": [
                                -91.4778,
                                52.4389
                            ]
                        },
                        "address": "北京朝阳区杭桥81029号",
                        "district": "朝阳区",
                        "city": "北京",
                        "_id": "67e3bfe413a3b0a292f177e8"
                    },
                    "subjects": [
                        {
                            "name": "数学",
                            "currentScore": "81",
                            "targetScore": "99",
                            "difficulty": "困难",
                            "_id": "67e3bfe413a3b0a292f177e9"
                        },
                        {
                            "name": "生物",
                            "currentScore": "85",
                            "targetScore": "87",
                            "difficulty": "简单",
                            "_id": "67e3bfe413a3b0a292f177ea"
                        },
                        {
                            "name": "物理",
                            "currentScore": "71",
                            "targetScore": "97",
                            "difficulty": "困难",
                            "_id": "67e3bfe413a3b0a292f177eb"
                        }
                    ],
                    "preferences": {
                        "budget": {
                            "min": 185,
                            "max": 305,
                            "period": "per_session"
                        },
                        "teachingLocation": "教师家",
                        "teacherGender": "不限",
                        "teachingStyle": [
                            "启发式教学"
                        ],
                        "_id": "67e3bfe413a3b0a292f177ec"
                    },
                    "createdAt": "2025-03-25T21:32:39.164Z",
                    "updatedAt": "2025-03-26T07:25:56.810Z",
                    "__v": 0
                },
                "score": 0.7,
                "matchDetails": {
                    "baseScore": 0.3,
                    "priceScore": 0.1,
                    "subjectScore": 0.09999999999999999,
                    "genderScore": 0.2,
                    "timeScore": 0
                }
            }
        ]
    }
}
```





# 教师添加教学科目

```
{{base_url}}tutorProfiles/profile/subjects/67dfa7e810e50edf46cca559{{对应的科目ID}}
```

```
{
  "name": "高中数学竞赛",
  "grades": ["高一", "高二", "高三"],

  "successCases": [
    {
      "description": "培养数学奥赛省级一等奖学员",
      "improvement": 75,
      "duration": 24
    }
  ]
}
```



# 教师删除某一个教学科目

```
{{base_url}}tutorProfiles/profile/subjects/67dfa7e810e50edf46cca559
```





# 教师 更新个人状态

```
{{base_url}}tutorProfiles/profile
```

