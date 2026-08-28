import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

// ============================================
// PERMISSION DEFINITIONS
// ============================================
export const PERMISSIONS = {
  // CRM Permissions
  VIEW_LEADS: 'view_leads',
  CREATE_LEAD: 'create_lead',
  EDIT_LEAD: 'edit_lead',
  DELETE_LEAD: 'delete_lead',
  VIEW_DEALS: 'view_deals',
  CREATE_DEAL: 'create_deal',
  EDIT_DEAL: 'edit_deal',
  DELETE_DEAL: 'delete_deal',
  VIEW_PIPELINE: 'view_pipeline',
  MANAGE_PIPELINE: 'manage_pipeline',
  
  // Client Permissions
  VIEW_CLIENTS: 'view_clients',
  CREATE_CLIENT: 'create_client',
  EDIT_CLIENT: 'edit_client',
  DELETE_CLIENT: 'delete_client',
  
  // Project Permissions
  VIEW_PROJECTS: 'view_projects',
  CREATE_PROJECT: 'create_project',
  EDIT_PROJECT: 'edit_project',
  DELETE_PROJECT: 'delete_project',
  
  // Task Permissions
  VIEW_TASKS: 'view_tasks',
  CREATE_TASK: 'create_task',
  EDIT_TASK: 'edit_task',
  DELETE_TASK: 'delete_task',
  ASSIGN_TASK: 'assign_task',
  COMPLETE_TASK: 'complete_task',
  
  // Employee Permissions
  VIEW_EMPLOYEES: 'view_employees',
  CREATE_EMPLOYEE: 'create_employee',
  EDIT_EMPLOYEE: 'edit_employee',
  DELETE_EMPLOYEE: 'delete_employee',
  
  // Time & Attendance
  VIEW_TIMESHEETS: 'view_timesheets',
  APPROVE_TIMESHEETS: 'approve_timesheets',
  VIEW_ATTENDANCE: 'view_attendance',
  APPROVE_ATTENDANCE: 'approve_attendance',
  
  // Goals & KPIs
  VIEW_GOALS: 'view_goals',
  CREATE_GOAL: 'create_goal',
  EDIT_GOAL: 'edit_goal',
  DELETE_GOAL: 'delete_goal',
  VIEW_KPIS: 'view_kpis',
  CREATE_KPI: 'create_kpi',
  EDIT_KPI: 'edit_kpi',
  DELETE_KPI: 'delete_kpi',
  
  // Risks
  VIEW_RISKS: 'view_risks',
  CREATE_RISK: 'create_risk',
  EDIT_RISK: 'edit_risk',
  DELETE_RISK: 'delete_risk',
  RESOLVE_RISK: 'resolve_risk',
  
  // Partners
  VIEW_PARTNERS: 'view_partners',
  CREATE_PARTNER: 'create_partner',
  EDIT_PARTNER: 'edit_partner',
  DELETE_PARTNER: 'delete_partner',
  
  // Retainers
  VIEW_RETAINERS: 'view_retainers',
  CREATE_RETAINER: 'create_retainer',
  EDIT_RETAINER: 'edit_retainer',
  DELETE_RETAINER: 'delete_retainer',
  
  // Settings & Admin
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  VIEW_AUDIT: 'view_audit',
  MANAGE_USERS: 'manage_users',
  MANAGE_ROLES: 'manage_roles',
  MANAGE_TENANTS: 'manage_tenants',
  MANAGE_BRANDS: 'manage_brands',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data'
};

// ============================================
// ROLE PERMISSION MAPPINGS
// ============================================
const ROLE_PERMISSIONS = {
  super_admin: Object.values(PERMISSIONS),
  
  admin: [
    PERMISSIONS.VIEW_LEADS, PERMISSIONS.CREATE_LEAD, PERMISSIONS.EDIT_LEAD, PERMISSIONS.DELETE_LEAD,
    PERMISSIONS.VIEW_DEALS, PERMISSIONS.CREATE_DEAL, PERMISSIONS.EDIT_DEAL, PERMISSIONS.DELETE_DEAL,
    PERMISSIONS.VIEW_PIPELINE, PERMISSIONS.MANAGE_PIPELINE,
    PERMISSIONS.VIEW_CLIENTS, PERMISSIONS.CREATE_CLIENT, PERMISSIONS.EDIT_CLIENT, PERMISSIONS.DELETE_CLIENT,
    PERMISSIONS.VIEW_PROJECTS, PERMISSIONS.CREATE_PROJECT, PERMISSIONS.EDIT_PROJECT, PERMISSIONS.DELETE_PROJECT,
    PERMISSIONS.VIEW_TASKS, PERMISSIONS.CREATE_TASK, PERMISSIONS.EDIT_TASK, PERMISSIONS.DELETE_TASK, PERMISSIONS.ASSIGN_TASK,
    PERMISSIONS.VIEW_EMPLOYEES, PERMISSIONS.CREATE_EMPLOYEE, PERMISSIONS.EDIT_EMPLOYEE, PERMISSIONS.DELETE_EMPLOYEE,
    PERMISSIONS.VIEW_TIMESHEETS, PERMISSIONS.APPROVE_TIMESHEETS,
    PERMISSIONS.VIEW_ATTENDANCE, PERMISSIONS.APPROVE_ATTENDANCE,
    PERMISSIONS.VIEW_GOALS, PERMISSIONS.CREATE_GOAL, PERMISSIONS.EDIT_GOAL, PERMISSIONS.DELETE_GOAL,
    PERMISSIONS.VIEW_KPIS, PERMISSIONS.CREATE_KPI, PERMISSIONS.EDIT_KPI, PERMISSIONS.DELETE_KPI,
    PERMISSIONS.VIEW_RISKS, PERMISSIONS.CREATE_RISK, PERMISSIONS.EDIT_RISK, PERMISSIONS.DELETE_RISK, PERMISSIONS.RESOLVE_RISK,
    PERMISSIONS.VIEW_PARTNERS, PERMISSIONS.CREATE_PARTNER, PERMISSIONS.EDIT_PARTNER, PERMISSIONS.DELETE_PARTNER,
    PERMISSIONS.VIEW_RETAINERS, PERMISSIONS.CREATE_RETAINER, PERMISSIONS.EDIT_RETAINER, PERMISSIONS.DELETE_RETAINER,
    PERMISSIONS.VIEW_SETTINGS, PERMISSIONS.EDIT_SETTINGS, PERMISSIONS.VIEW_AUDIT,
    PERMISSIONS.MANAGE_USERS, PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.VIEW_ANALYTICS, PERMISSIONS.EXPORT_DATA
  ],
  
  manager: [
    PERMISSIONS.VIEW_LEADS, PERMISSIONS.CREATE_LEAD, PERMISSIONS.EDIT_LEAD,
    PERMISSIONS.VIEW_DEALS, PERMISSIONS.CREATE_DEAL, PERMISSIONS.EDIT_DEAL,
    PERMISSIONS.VIEW_PIPELINE,
    PERMISSIONS.VIEW_CLIENTS, PERMISSIONS.CREATE_CLIENT, PERMISSIONS.EDIT_CLIENT,
    PERMISSIONS.VIEW_PROJECTS, PERMISSIONS.CREATE_PROJECT, PERMISSIONS.EDIT_PROJECT,
    PERMISSIONS.VIEW_TASKS, PERMISSIONS.CREATE_TASK, PERMISSIONS.EDIT_TASK, PERMISSIONS.ASSIGN_TASK,
    PERMISSIONS.VIEW_EMPLOYEES,
    PERMISSIONS.VIEW_TIMESHEETS, PERMISSIONS.APPROVE_TIMESHEETS,
    PERMISSIONS.VIEW_ATTENDANCE, PERMISSIONS.APPROVE_ATTENDANCE,
    PERMISSIONS.VIEW_GOALS, PERMISSIONS.CREATE_GOAL, PERMISSIONS.EDIT_GOAL,
    PERMISSIONS.VIEW_KPIS,
    PERMISSIONS.VIEW_RISKS, PERMISSIONS.CREATE_RISK, PERMISSIONS.EDIT_RISK,
    PERMISSIONS.VIEW_PARTNERS, PERMISSIONS.CREATE_PARTNER, PERMISSIONS.EDIT_PARTNER,
    PERMISSIONS.VIEW_RETAINERS, PERMISSIONS.CREATE_RETAINER, PERMISSIONS.EDIT_RETAINER,
    PERMISSIONS.VIEW_ANALYTICS
  ],
  
  employee: [
    PERMISSIONS.VIEW_LEADS,
    PERMISSIONS.VIEW_DEALS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_TASKS, PERMISSIONS.CREATE_TASK, PERMISSIONS.EDIT_TASK, PERMISSIONS.COMPLETE_TASK,
    PERMISSIONS.VIEW_TIMESHEETS,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.VIEW_GOALS,
    PERMISSIONS.VIEW_KPIS,
    PERMISSIONS.VIEW_RISKS,
    PERMISSIONS.VIEW_PARTNERS,
    PERMISSIONS.VIEW_RETAINERS
  ],
  
  client: [
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_TASKS,
    PERMISSIONS.VIEW_CLIENTS
  ]
};

// ============================================
// PERMISSION CONTEXT
// ============================================
const PermissionContext = createContext(null);

export const PermissionProvider = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // ============================================
  // CALCULATE PERMISSIONS
  // ============================================
  const calculatePermissions = useCallback(() => {
    if (!user) {
      setPermissions([]);
      setIsAdmin(false);
      setIsManager(false);
      setIsEmployee(false);
      setIsClient(false);
      return;
    }

    // Get role-based permissions
    let rolePerms = ROLE_PERMISSIONS[user.role] || [];
    
    // Merge with custom permissions
    const customPerms = user.permissions || [];
    const allPerms = [...new Set([...rolePerms, ...customPerms])];
    
    setPermissions(allPerms);
    setIsAdmin(user.role === 'super_admin' || user.role === 'admin');
    setIsManager(user.role === 'super_admin' || user.role === 'admin' || user.role === 'manager');
    setIsEmployee(user.role === 'super_admin' || user.role === 'admin' || user.role === 'manager' || user.role === 'employee');
    setIsClient(user.role === 'client');
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      calculatePermissions();
      setLoading(false);
    }
  }, [authLoading, calculatePermissions]);

  // ============================================
  // PERMISSION CHECK FUNCTIONS
  // ============================================
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'admin') return true;
    return permissions.includes(permission);
  }, [user, permissions]);

  const hasAnyPermission = useCallback((permissionList) => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'admin') return true;
    return permissionList.some(p => permissions.includes(p));
  }, [user, permissions]);

  const hasAllPermissions = useCallback((permissionList) => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'admin') return true;
    return permissionList.every(p => permissions.includes(p));
  }, [user, permissions]);

  const hasRole = useCallback((role) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return user.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    return roles.includes(user.role);
  }, [user]);

  const canView = useCallback((resource, ownerId = null) => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'admin') return true;
    
    // Manager can view team resources
    if (user.role === 'manager') {
      if (!ownerId) return true;
      // Check if owner is in manager's team
      return true; // Simplified - actual check would look up team membership
    }
    
    // Employee can only view their own resources
    if (user.role === 'employee') {
      if (!ownerId) return false;
      return user._id === ownerId;
    }
    
    // Client can only view their own resources
    if (user.role === 'client') {
      // Special client logic
      return true;
    }
    
    return false;
  }, [user]);

  const canEdit = useCallback((resource, ownerId = null) => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'admin') return true;
    
    if (user.role === 'manager') {
      if (!ownerId) return true;
      return true; // Simplified
    }
    
    if (user.role === 'employee') {
      if (!ownerId) return false;
      return user._id === ownerId;
    }
    
    return false;
  }, [user]);

  const canDelete = useCallback((resource, ownerId = null) => {
    if (!user) return false;
    if (user.role === 'super_admin' || user.role === 'admin') return true;
    return false;
  }, [user]);

  // ============================================
  // GET PERMISSION LABEL
  // ============================================
  const getPermissionLabel = useCallback((permission) => {
    const labels = {
      [PERMISSIONS.VIEW_LEADS]: 'View Leads',
      [PERMISSIONS.CREATE_LEAD]: 'Create Lead',
      [PERMISSIONS.EDIT_LEAD]: 'Edit Lead',
      [PERMISSIONS.DELETE_LEAD]: 'Delete Lead',
      [PERMISSIONS.VIEW_DEALS]: 'View Deals',
      [PERMISSIONS.CREATE_DEAL]: 'Create Deal',
      [PERMISSIONS.EDIT_DEAL]: 'Edit Deal',
      [PERMISSIONS.DELETE_DEAL]: 'Delete Deal',
      [PERMISSIONS.VIEW_PIPELINE]: 'View Pipeline',
      [PERMISSIONS.MANAGE_PIPELINE]: 'Manage Pipeline',
      [PERMISSIONS.VIEW_CLIENTS]: 'View Clients',
      [PERMISSIONS.CREATE_CLIENT]: 'Create Client',
      [PERMISSIONS.EDIT_CLIENT]: 'Edit Client',
      [PERMISSIONS.DELETE_CLIENT]: 'Delete Client',
      [PERMISSIONS.VIEW_PROJECTS]: 'View Projects',
      [PERMISSIONS.CREATE_PROJECT]: 'Create Project',
      [PERMISSIONS.EDIT_PROJECT]: 'Edit Project',
      [PERMISSIONS.DELETE_PROJECT]: 'Delete Project',
      [PERMISSIONS.VIEW_TASKS]: 'View Tasks',
      [PERMISSIONS.CREATE_TASK]: 'Create Task',
      [PERMISSIONS.EDIT_TASK]: 'Edit Task',
      [PERMISSIONS.DELETE_TASK]: 'Delete Task',
      [PERMISSIONS.ASSIGN_TASK]: 'Assign Task',
      [PERMISSIONS.COMPLETE_TASK]: 'Complete Task',
      [PERMISSIONS.VIEW_EMPLOYEES]: 'View Employees',
      [PERMISSIONS.CREATE_EMPLOYEE]: 'Create Employee',
      [PERMISSIONS.EDIT_EMPLOYEE]: 'Edit Employee',
      [PERMISSIONS.DELETE_EMPLOYEE]: 'Delete Employee',
      [PERMISSIONS.VIEW_TIMESHEETS]: 'View Timesheets',
      [PERMISSIONS.APPROVE_TIMESHEETS]: 'Approve Timesheets',
      [PERMISSIONS.VIEW_ATTENDANCE]: 'View Attendance',
      [PERMISSIONS.APPROVE_ATTENDANCE]: 'Approve Attendance',
      [PERMISSIONS.VIEW_GOALS]: 'View Goals',
      [PERMISSIONS.CREATE_GOAL]: 'Create Goal',
      [PERMISSIONS.EDIT_GOAL]: 'Edit Goal',
      [PERMISSIONS.DELETE_GOAL]: 'Delete Goal',
      [PERMISSIONS.VIEW_KPIS]: 'View KPIs',
      [PERMISSIONS.CREATE_KPI]: 'Create KPI',
      [PERMISSIONS.EDIT_KPI]: 'Edit KPI',
      [PERMISSIONS.DELETE_KPI]: 'Delete KPI',
      [PERMISSIONS.VIEW_RISKS]: 'View Risks',
      [PERMISSIONS.CREATE_RISK]: 'Create Risk',
      [PERMISSIONS.EDIT_RISK]: 'Edit Risk',
      [PERMISSIONS.DELETE_RISK]: 'Delete Risk',
      [PERMISSIONS.RESOLVE_RISK]: 'Resolve Risk',
      [PERMISSIONS.VIEW_PARTNERS]: 'View Partners',
      [PERMISSIONS.CREATE_PARTNER]: 'Create Partner',
      [PERMISSIONS.EDIT_PARTNER]: 'Edit Partner',
      [PERMISSIONS.DELETE_PARTNER]: 'Delete Partner',
      [PERMISSIONS.VIEW_RETAINERS]: 'View Retainers',
      [PERMISSIONS.CREATE_RETAINER]: 'Create Retainer',
      [PERMISSIONS.EDIT_RETAINER]: 'Edit Retainer',
      [PERMISSIONS.DELETE_RETAINER]: 'Delete Retainer',
      [PERMISSIONS.VIEW_SETTINGS]: 'View Settings',
      [PERMISSIONS.EDIT_SETTINGS]: 'Edit Settings',
      [PERMISSIONS.VIEW_AUDIT]: 'View Audit Log',
      [PERMISSIONS.MANAGE_USERS]: 'Manage Users',
      [PERMISSIONS.MANAGE_ROLES]: 'Manage Roles',
      [PERMISSIONS.MANAGE_TENANTS]: 'Manage Tenants',
      [PERMISSIONS.MANAGE_BRANDS]: 'Manage Brands',
      [PERMISSIONS.VIEW_ANALYTICS]: 'View Analytics',
      [PERMISSIONS.EXPORT_DATA]: 'Export Data'
    };
    return labels[permission] || permission;
  }, []);

  // ============================================
  // GET PERMISSION CATEGORY
  // ============================================
  const getPermissionCategory = useCallback((permission) => {
    const categories = {
      lead: ['view_leads', 'create_lead', 'edit_lead', 'delete_lead'],
      deal: ['view_deals', 'create_deal', 'edit_deal', 'delete_deal'],
      pipeline: ['view_pipeline', 'manage_pipeline'],
      client: ['view_clients', 'create_client', 'edit_client', 'delete_client'],
      project: ['view_projects', 'create_project', 'edit_project', 'delete_project'],
      task: ['view_tasks', 'create_task', 'edit_task', 'delete_task', 'assign_task', 'complete_task'],
      employee: ['view_employees', 'create_employee', 'edit_employee', 'delete_employee'],
      timesheet: ['view_timesheets', 'approve_timesheets'],
      attendance: ['view_attendance', 'approve_attendance'],
      goal: ['view_goals', 'create_goal', 'edit_goal', 'delete_goal'],
      kpi: ['view_kpis', 'create_kpi', 'edit_kpi', 'delete_kpi'],
      risk: ['view_risks', 'create_risk', 'edit_risk', 'delete_risk', 'resolve_risk'],
      partner: ['view_partners', 'create_partner', 'edit_partner', 'delete_partner'],
      retainer: ['view_retainers', 'create_retainer', 'edit_retainer', 'delete_retainer'],
      settings: ['view_settings', 'edit_settings'],
      audit: ['view_audit'],
      user_management: ['manage_users', 'manage_roles', 'manage_tenants', 'manage_brands'],
      analytics: ['view_analytics', 'export_data']
    };
    
    for (const [category, perms] of Object.entries(categories)) {
      if (perms.includes(permission)) {
        return category;
      }
    }
    return 'other';
  }, []);

  // ============================================
  // GET USER PERMISSIONS SUMMARY
  // ============================================
  const getPermissionsSummary = useCallback(() => {
    if (!user) {
      return {
        total: 0,
        byCategory: {},
        role: 'none'
      };
    }

    const byCategory = {};
    for (const permission of permissions) {
      const category = getPermissionCategory(permission);
      if (!byCategory[category]) {
        byCategory[category] = 0;
      }
      byCategory[category]++;
    }

    return {
      total: permissions.length,
      byCategory,
      role: user.role
    };
  }, [user, permissions, getPermissionCategory]);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    loading,
    permissions,
    isAdmin,
    isManager,
    isEmployee,
    isClient,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canView,
    canEdit,
    canDelete,
    getPermissionLabel,
    getPermissionCategory,
    getPermissionsSummary,
    // User object for convenience
    user
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

// ============================================
// HOOK
// ============================================
export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};

export default PermissionContext;