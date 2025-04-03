/**
 * 权限管理服务
 * 提供权限和角色的管理功能
 */

const Permission = require('../../models/Permission');
const Role = require('../../models/Role');
const User = require('../../models/User');
const { AppError } = require('../utils/errorHandler');

class PermissionService {
  /**
   * 创建新权限
   * @param {Object} permissionData - 权限数据
   * @returns {Promise<Object>} 创建的权限对象
   */
  async createPermission(permissionData) {
    try {
      // 检查权限代码是否已存在
      const existingPermission = await Permission.findOne({ code: permissionData.code });
      if (existingPermission) {
        throw new AppError(`权限代码 ${permissionData.code} 已存在`, 400);
      }

      // 创建新权限
      const permission = new Permission(permissionData);
      await permission.save();

      return permission;
    } catch (error) {
      console.error('创建权限错误:', error);
      throw new AppError(error.message || '创建权限失败', error.statusCode || 500);
    }
  }

  /**
   * 获取所有权限
   * @param {Object} query - 查询参数
   * @returns {Promise<Array>} 权限列表
   */
  async getAllPermissions(query = {}) {
    try {
      const { category } = query;
      const filter = {};
      
      if (category) {
        filter.category = category;
      }
      
      const permissions = await Permission.find(filter).sort({ category: 1, code: 1 });
      return permissions;
    } catch (error) {
      console.error('获取权限列表错误:', error);
      throw new AppError('获取权限列表失败', 500);
    }
  }

  /**
   * 获取权限详情
   * @param {String} permissionId - 权限ID
   * @returns {Promise<Object>} 权限详情
   */
  async getPermissionById(permissionId) {
    try {
      const permission = await Permission.findById(permissionId);
      if (!permission) {
        throw new AppError('权限不存在', 404);
      }
      return permission;
    } catch (error) {
      console.error(`获取权限详情错误 (ID: ${permissionId}):`, error);
      throw new AppError(error.message || '获取权限详情失败', error.statusCode || 500);
    }
  }

  /**
   * 更新权限
   * @param {String} permissionId - 权限ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新后的权限对象
   */
  async updatePermission(permissionId, updateData) {
    try {
      // 如果要更新code，检查是否与其他权限冲突
      if (updateData.code) {
        const existingPermission = await Permission.findOne({ 
          code: updateData.code,
          _id: { $ne: permissionId }
        });
        
        if (existingPermission) {
          throw new AppError(`权限代码 ${updateData.code} 已存在`, 400);
        }
      }

      const permission = await Permission.findByIdAndUpdate(
        permissionId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!permission) {
        throw new AppError('权限不存在', 404);
      }

      return permission;
    } catch (error) {
      console.error(`更新权限错误 (ID: ${permissionId}):`, error);
      throw new AppError(error.message || '更新权限失败', error.statusCode || 500);
    }
  }

  /**
   * 删除权限
   * @param {String} permissionId - 权限ID
   * @returns {Promise<void>}
   */
  async deletePermission(permissionId) {
    try {
      // 检查权限是否被角色使用
      const rolesUsingPermission = await Role.find({ permissions: permissionId });
      if (rolesUsingPermission.length > 0) {
        const roleNames = rolesUsingPermission.map(role => role.name).join(', ');
        throw new AppError(`无法删除权限，它正在被以下角色使用: ${roleNames}`, 400);
      }

      const permission = await Permission.findByIdAndDelete(permissionId);
      if (!permission) {
        throw new AppError('权限不存在', 404);
      }
    } catch (error) {
      console.error(`删除权限错误 (ID: ${permissionId}):`, error);
      throw new AppError(error.message || '删除权限失败', error.statusCode || 500);
    }
  }

  /**
   * 创建新角色
   * @param {Object} roleData - 角色数据
   * @returns {Promise<Object>} 创建的角色对象
   */
  async createRole(roleData) {
    try {
      // 检查角色代码是否已存在
      const existingRole = await Role.findOne({ code: roleData.code });
      if (existingRole) {
        throw new AppError(`角色代码 ${roleData.code} 已存在`, 400);
      }

      // 验证权限ID是否有效
      if (roleData.permissions && roleData.permissions.length > 0) {
        for (const permId of roleData.permissions) {
          const permExists = await Permission.findById(permId);
          if (!permExists) {
            throw new AppError(`权限ID ${permId} 不存在`, 400);
          }
        }
      }

      // 创建新角色
      const role = new Role(roleData);
      await role.save();

      return role;
    } catch (error) {
      console.error('创建角色错误:', error);
      throw new AppError(error.message || '创建角色失败', error.statusCode || 500);
    }
  }

  /**
   * 获取所有角色
   * @returns {Promise<Array>} 角色列表
   */
  async getAllRoles() {
    try {
      const roles = await Role.find().populate('permissions');
      return roles;
    } catch (error) {
      console.error('获取角色列表错误:', error);
      throw new AppError('获取角色列表失败', 500);
    }
  }

  /**
   * 获取角色详情
   * @param {String} roleId - 角色ID
   * @returns {Promise<Object>} 角色详情
   */
  async getRoleById(roleId) {
    try {
      const role = await Role.findById(roleId).populate('permissions');
      if (!role) {
        throw new AppError('角色不存在', 404);
      }
      return role;
    } catch (error) {
      console.error(`获取角色详情错误 (ID: ${roleId}):`, error);
      throw new AppError(error.message || '获取角色详情失败', error.statusCode || 500);
    }
  }

  /**
   * 更新角色
   * @param {String} roleId - 角色ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<Object>} 更新后的角色对象
   */
  async updateRole(roleId, updateData) {
    try {
      // 获取角色信息
      const role = await Role.findById(roleId);
      if (!role) {
        throw new AppError('角色不存在', 404);
      }

      // 系统角色不允许修改代码
      if (role.isSystem && updateData.code && updateData.code !== role.code) {
        throw new AppError('系统角色不允许修改代码', 400);
      }

      // 如果要更新code，检查是否与其他角色冲突
      if (updateData.code) {
        const existingRole = await Role.findOne({ 
          code: updateData.code,
          _id: { $ne: roleId }
        });
        
        if (existingRole) {
          throw new AppError(`角色代码 ${updateData.code} 已存在`, 400);
        }
      }

      // 验证权限ID是否有效
      if (updateData.permissions && updateData.permissions.length > 0) {
        for (const permId of updateData.permissions) {
          const permExists = await Permission.findById(permId);
          if (!permExists) {
            throw new AppError(`权限ID ${permId} 不存在`, 400);
          }
        }
      }

      const updatedRole = await Role.findByIdAndUpdate(
        roleId,
        updateData,
        { new: true, runValidators: true }
      ).populate('permissions');

      return updatedRole;
    } catch (error) {
      console.error(`更新角色错误 (ID: ${roleId}):`, error);
      throw new AppError(error.message || '更新角色失败', error.statusCode || 500);
    }
  }

  /**
   * 删除角色
   * @param {String} roleId - 角色ID
   * @returns {Promise<void>}
   */
  async deleteRole(roleId) {
    try {
      // 获取角色信息
      const role = await Role.findById(roleId);
      if (!role) {
        throw new AppError('角色不存在', 404);
      }

      // 系统角色不允许删除
      if (role.isSystem) {
        throw new AppError('系统角色不允许删除', 400);
      }

      // 检查角色是否被用户使用
      const usersWithRole = await User.countDocuments({ role: role.code });
      if (usersWithRole > 0) {
        throw new AppError(`无法删除角色，它正在被 ${usersWithRole} 个用户使用`, 400);
      }

      await Role.findByIdAndDelete(roleId);
    } catch (error) {
      console.error(`删除角色错误 (ID: ${roleId}):`, error);
      throw new AppError(error.message || '删除角色失败', error.statusCode || 500);
    }
  }

  /**
   * 为角色分配权限
   * @param {String} roleId - 角色ID
   * @param {Array} permissionIds - 权限ID数组
   * @returns {Promise<Object>} 更新后的角色对象
   */
  async assignPermissionsToRole(roleId, permissionIds) {
    try {
      // 获取角色信息
      const role = await Role.findById(roleId);
      if (!role) {
        throw new AppError('角色不存在', 404);
      }

      // 验证权限ID是否有效
      for (const permId of permissionIds) {
        const permExists = await Permission.findById(permId);
        if (!permExists) {
          throw new AppError(`权限ID ${permId} 不存在`, 400);
        }
      }

      // 更新角色权限
      role.permissions = permissionIds;
      await role.save();

      // 返回更新后的角色，包含权限详情
      const updatedRole = await Role.findById(roleId).populate('permissions');
      return updatedRole;
    } catch (error) {
      console.error(`为角色分配权限错误 (ID: ${roleId}):`, error);
      throw new AppError(error.message || '为角色分配权限失败', error.statusCode || 500);
    }
  }

  /**
   * 检查用户是否有指定权限
   * @param {String} userId - 用户ID
   * @param {String} permissionCode - 权限代码
   * @returns {Promise<Boolean>} 是否有权限
   */
  async checkUserPermission(userId, permissionCode) {
    try {
      // 获取用户信息
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      // 获取用户角色
      const role = await Role.findOne({ code: user.role }).populate('permissions');
      if (!role) {
        return false;
      }

      // 检查角色是否有指定权限
      const hasPermission = role.permissions.some(perm => perm.code === permissionCode);
      return hasPermission;
    } catch (error) {
      console.error(`检查用户权限错误 (用户ID: ${userId}, 权限: ${permissionCode}):`, error);
      throw new AppError(error.message || '检查用户权限失败', error.statusCode || 500);
    }
  }

  /**
   * 获取用户的所有权限
   * @param {String} userId - 用户ID
   * @returns {Promise<Array>} 权限列表
   */
  async getUserPermissions(userId) {
    try {
      // 获取用户信息
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('用户不存在', 404);
      }

      // 获取用户角色及其权限
      const role = await Role.findOne({ code: user.role }).populate('permissions');
      if (!role) {
        return [];
      }

      return role.permissions;
    } catch (error) {
      console.error(`获取用户权限错误 (用户ID: ${userId}):`, error);
      throw new AppError(error.message || '获取用户权限失败', error.statusCode || 500);
    }
  }

  /**
   * 初始化系统默认角色和权限
   * @returns {Promise<void>}
   */
  async initializeRolesAndPermissions() {
    try {
      // 检查是否已初始化
      const adminRole = await Role.findOne({ code: 'admin' });
      if (adminRole) {
        console.log('角色和权限已初始化，跳过');
        return;
      }

      // 创建基础权限
      const permissions = [
        // 用户管理权限
        {
          code: 'user:view',
          name: '查看用户',
          description: '查看用户列表和详情',
          category: 'user'
        },
        {
          code: 'user:create',
          name: '创建用户',
          description: '创建新用户',
          category: 'user'
        },
        {
          code: 'user:edit',
          name: '编辑用户',
          description: '编辑用户信息',
          category: 'user'
        },
        {
          code: 'user:delete',
          name: '删除用户',
          description: '删除用户',
          category: 'user'
        },
        
        // 教师管理权限
        {
          code: 'tutor:view',
          name: '查看教师',
          description: '查看教师列表和详情',
          category: 'tutor'
        },
        {
          code: 'tutor:verify',
          name: '审核教师',
          description: '审核教师资料',
          category: 'tutor'
        },
        {
          code: 'tutor:edit',
          name: '编辑教师',
          description: '编辑教师信息',
          category: 'tutor'
        },
        
        // 家长管理权限
        {
          code: 'parent:view',
          name: '查看家长',
          description: '查看家长列表和详情',
          category: 'parent'
        },
        {
          code: 'parent:edit',
          name: '编辑家长',
          description: '编辑家长信息',
          category: 'parent'
        },
        
        // 系统管理权限
        {
          code: 'system:settings',
          name: '系统设置',
          description: '管理系统设置',
          category: 'system'
        },
        {
          code: 'system:logs',
          name: '系统日志',
          description: '查看系统日志',
          category: 'system'
        },
        
        // 权限管理
        {
          code: 'permission:manage',
          name: '权限管理',
          description: '管理角色和权限',
          category: 'system'
        }
      ];

      // 批量创建权限
      const createdPermissions = await Permission.insertMany(permissions);
      
      // 获取权限ID
      const permissionIds = createdPermissions.map(p => p._id);
      
      // 创建角色
      const roles = [
        {
          code: 'admin',
          name: '管理员',
          description: '系统管理员，拥有所有权限',
          permissions: permissionIds,
          isSystem: true
        },
        {
          code: 'teacher',
          name: '教师',
          description: '教师用户',
          permissions: createdPermissions
            .filter(p => ['tutor:view'].includes(p.code))
            .map(p => p._id),
          isSystem: true
        },
        {
          code: 'parent',
          name: '家长',
          description: '家长用户',
          permissions: createdPermissions
            .filter(p => ['parent:view'].includes(p.code))
            .map(p => p._id),
          isSystem: true
        }
      ];

      // 批量创建角色
      await Role.insertMany(roles);
      
      console.log('角色和权限初始化完成');
    } catch (error) {
      console.error('初始化角色和权限错误:', error);
      throw new AppError('初始化角色和权限失败', 500);
    }
  }
}

module.exports = new PermissionService();
