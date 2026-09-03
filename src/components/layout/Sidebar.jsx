import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ChevronLeft,
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  Calendar,
  BarChart,
  Settings,
  LogOut,
  Activity,
  UsersRound,
  Building2,
  Target,
  Clock,
  MessageSquare,
  FileText,
  CreditCard,
  Zap,
  Shield,
  Headphones,
  ChevronRight,
  TrendingUp,
  Award,
  Briefcase,
  PieChart,
  Mail,
  UserCheck,
  BellRing,
  Gift,
  DollarSign,
  AlertCircle,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get user initials
  const getInitials = () => {
    if (!user) return 'U';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Get user role display
  const getRoleDisplay = () => {
    if (!user) return 'Guest';
    const roleMap = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'segment_admin': 'Segment Admin',
      'manager': 'Manager',
      'project_manager': 'Project Manager',
      'employee': 'Employee',
      'client': 'Client'
    };
    return roleMap[user.role] || user.role?.replace('_', ' ') || 'Employee';
  };

  // ============================================
  // MENU ITEMS BASED ON ROLE WITH WORKFLOW SECTIONS
  // ============================================
  const getMenuItems = () => {
    const role = user?.role || 'employee';

    // ============================================
    // SUPER ADMIN - Full system access
    // ============================================
    if (role === 'super_admin') {
      return [
        // DASHBOARD
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', color: '#013E37', id: 'dashboard' },
        { icon: LayoutDashboard, label: 'Executive Dashboard', href: '/executive-dashboard', color: '#013E37', id: 'executive-dashboard' },
        { icon: Award, label: 'Goal Dashboard', href: '/goals/board', color: '#013E37', id: 'goal-board' },
        { icon: PieChart, label: 'KPI Dashboard', href: '/kpi/dashboard', color: '#013E37', id: 'kpi-dashboard' },
        // { icon: LayoutDashboard, label: 'Client Dashboard', href: '/client/dashboard', color: '#013E37', id: 'client-dashboard' },
        
        { icon: AlertCircle, label: 'Risk Dashboard', href: '/risk/dashboard', color: '#013E37', id: 'risk-dashboard' },
        { icon: BarChart, label: 'Workflow Dashboard', href: '/workflows/analytics', color: '#013E37', id: 'workflow-analytics' },
        { icon: Shield, label: 'Audit Dashboard', href: '/audit/dashboard', color: '#013E37', id: 'audit-dashboard' },
        
        
        // ORGANIZATION
        { type: 'separator', label: 'CRM' },
        
        { icon: Building2, label: 'Company', href: '/organization/company', color: '#013E37', id: 'company' },
        { icon: Building2, label: 'Segments', href: '/organization/Segments', color: '#013E37', id: 'segments' },
        { icon: UsersRound, label: 'Departments', href: '/organization/departments', color: '#013E37', id: 'departments' },
        { icon: UsersRound, label: 'Teams', href: '/organization/teams', color: '#013E37', id: 'teams' },
        { icon: Building2, label: 'hierarchy', href: '/organization/hierarchy', color: '#013E37', id: 'hierarchy' },
        
        // CRM & SALES
        // { type: 'separator', label: 'CRM & SALES' },
        { icon: Users, label: 'Leads', href: '/crm/leads', color: '#013E37', id: 'leads' },
        { icon: Target, label: 'Deals', href: '/crm/deals', color: '#013E37', id: 'deals' },
        { icon: Target, label: 'Pipeline', href: '/crm/pipeline', color: '#013E37', id: 'pipeline' },
        { icon: Mail, label: 'Outreach', href: '/crm/outreach', color: '#013E37', id: 'outreach' },
        { icon: Building2, label: 'Companies', href: '/crm/companies', color: '#013E37', id: 'companies' },
        
        // ANALYTICS
        // { type: 'separator', label: 'ANALYTICS' },
        { icon: TrendingUp, label: 'Revenue', href: '/analytics/revenue', color: '#013E37', id: 'revenue-analytics' },
        { icon: TrendingUp, label: 'Productivity', href: '/analytics/productivity', color: '#013E37', id: 'productivity-analytics' },
        { icon: TrendingUp, label: 'Growth Metrics', href: '/analytics/growth', color: '#013E37', id: 'growth-metrics' },
        
        // ACTIVITY
        // { type: 'separator', label: 'ACTIVITY' },
        { icon: Activity, label: 'Activity Feed', href: '/activities', color: '#013E37', id: 'activities' },
        { icon: Activity, label: 'Search', href: '/activities/search', color: '#013E37', id: 'activity-search' },
        
        // PROJECTS
        { type: 'separator', label: 'PROJECTS' },
        { icon: FolderKanban, label: 'Projects', href: '/projects', color: '#013E37', id: 'projects' },
        { icon: CheckSquare, label: 'Tasks', href: '/projects/tasks', color: '#013E37', id: 'tasks' },
        { icon: CheckSquare, label: 'Board View', href: '/task-board', color: '#013E37', id: 'task-board' },
        { icon: Calendar, label: 'Calendar', href: '/calendar', color: '#013E37', id: 'calendar' },
        
        // EMPLOYEES
        { type: 'separator', label: 'EMPLOYEES' },
        { icon: UserCheck, label: 'Attendance', href: '/employees/attendance', color: '#013E37', id: 'attendance' },
        { icon: Clock, label: 'Timesheets', href: '/employees/timesheet', color: '#013E37', id: 'timesheets' },
        { icon: Activity, label: 'Performance', href: '/employees/performance', color: '#013E37', id: 'performance' },
        { icon: MessageSquare, label: 'Standups', href: '/employees/standups', color: '#013E37', id: 'standups' },
        { icon: UsersRound, label: 'Employees', href: '/team', color: '#013E37', id: 'team' },
        
        
        // CLIENT PORTAL
        // { type: 'separator', label: 'CLIENT PORTAL' },
        // { icon: FileText, label: 'Approvals', href: '/client/approvals', color: '#013E37', id: 'client-approvals' },
        // { icon: FileText, label: 'Reports', href: '/client/reports', color: '#013E37', id: 'client-reports' },
        // { icon: FileText, label: 'Documents', href: '/client/documents', color: '#013E37', id: 'client-documents' },
        // { icon: CreditCard, label: 'Billing', href: '/client/billing', color: '#013E37', id: 'client-billing' },
        
        // PARTNERS
        { type: 'separator', label: 'PARTNERS' },
        { icon: HeartHandshake, label: 'Partners', href: '/partners', color: '#013E37', id: 'partners' },
        { icon: Briefcase, label: 'Brands', href: '/partners/brands', color: '#013E37', id: 'partner-brands' },
        { icon: Users, label: 'Universities', href: '/partners/universities', color: '#013E37', id: 'universities' },
        { icon: Building2, label: 'Employers', href: '/partners/employers', color: '#013E37', id: 'employers' },
        { icon: Award, label: 'Influencers', href: '/partners/influencers', color: '#013E37', id: 'influencers' },
        
        // GOALS & KPIs
        { type: 'separator', label: 'GOALS & KPIs' },
        { icon: Award, label: 'Goals', href: '/goals', color: '#013E37', id: 'goals' },
        // { icon: Award, label: 'Goal Board', href: '/goals/board', color: '#013E37', id: 'goal-board' },
        // { icon: PieChart, label: 'KPI Dashboard', href: '/kpi/dashboard', color: '#013E37', id: 'kpi-dashboard' },
        { icon: BarChart, label: 'KPIs', href: '/kpis', color: '#013E37', id: 'kpis' },
        
        // RISK MANAGEMENT
        { type: 'separator', label: 'RISK MANAGEMENT' },
        { icon: AlertCircle, label: 'Risks', href: '/risks', color: '#013E37', id: 'risks' },
        
        
        
        // REPORTS
        { type: 'separator', label: 'REPORTS' },
        { icon: FileText, label: 'Reports', href: '/reports', color: '#013E37', id: 'reports' },
        
        
        // AUTOMATION
        // { type: 'separator', label: 'AUTOMATION' },
        // { icon: Zap, label: 'Workflows', href: '/workflows', color: '#013E37', id: 'workflows' },
        // { icon: Zap, label: 'Workflow Builder', href: '/workflows/builder', color: '#013E37', id: 'workflow-builder' },
        // { icon: BarChart, label: 'Analytics', href: '/workflows/analytics', color: '#013E37', id: 'workflow-analytics' },
        
        // AUDIT
        // { type: 'separator', label: 'AUDIT' },
        // { icon: Shield, label: 'Audit Log', href: '/audit', color: '#013E37', id: 'audit' },
       
        // // DASHBOARD BUILDER
        // { type: 'separator', label: 'DASHBOARD BUILDER' },
        // { icon: LayoutDashboard, label: 'Builder', href: '/dashboard-builder', color: '#013E37', id: 'dashboard-builder' },
        // { icon: LayoutDashboard, label: 'Templates', href: '/dashboard-builder/templates', color: '#013E37', id: 'templates' },
        
        // SETTINGS
        { type: 'separator', label: 'SETTINGS' },
        { icon: Settings, label: 'Settings', href: '/settings', color: '#013E37', id: 'settings' },
        
        
      ];
    }

    // ============================================
    // ADMIN - Manage users, settings, all modules
    // ============================================
    if (role === 'admin') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', color: '#013E37', id: 'dashboard' },
        { icon: LayoutDashboard, label: 'Executive Dashboard', href: '/executive-dashboard', color: '#013E37', id: 'executive-dashboard' },
        
        { type: 'separator', label: 'ORGANIZATION' },
        { icon: UsersRound, label: 'Departments', href: '/organization/departments', color: '#013E37', id: 'departments' },
        { icon: UsersRound, label: 'Teams', href: '/organization/teams', color: '#013E37', id: 'teams' },
        { icon: Building2, label: 'Hierarchy', href: '/organization/hierarchy', color: '#013E37', id: 'hierarchy' },
        
        { type: 'separator', label: 'CRM & SALES' },
        { icon: Users, label: 'Leads', href: '/crm/leads', color: '#013E37', id: 'leads' },
        { icon: Target, label: 'Deals', href: '/crm/deals', color: '#013E37', id: 'deals' },
        { icon: Target, label: 'Pipeline', href: '/crm/pipeline', color: '#013E37', id: 'pipeline' },
        { icon: Mail, label: 'Outreach', href: '/crm/outreach', color: '#013E37', id: 'outreach' },
        { icon: Building2, label: 'Companies', href: '/crm/companies', color: '#013E37', id: 'companies' },
        
        { type: 'separator', label: 'PROJECTS' },
        { icon: FolderKanban, label: 'Projects', href: '/projects', color: '#013E37', id: 'projects' },
        { icon: CheckSquare, label: 'Tasks', href: '/projects/tasks', color: '#013E37', id: 'tasks' },
        { icon: CheckSquare, label: 'Board View', href: '/task-board', color: '#013E37', id: 'task-board' },
        { icon: Calendar, label: 'Calendar', href: '/calendar', color: '#013E37', id: 'calendar' },
        
        { type: 'separator', label: 'EMPLOYEES' },
        { icon: UserCheck, label: 'Attendance', href: '/employees/attendance', color: '#013E37', id: 'attendance' },
        { icon: Clock, label: 'Timesheets', href: '/employees/timesheet', color: '#013E37', id: 'timesheets' },
        { icon: Activity, label: 'Performance', href: '/employees/performance', color: '#013E37', id: 'performance' },
        { icon: MessageSquare, label: 'Standups', href: '/employees/standups', color: '#013E37', id: 'standups' },
        { icon: UsersRound, label: 'Team', href: '/team', color: '#013E37', id: 'team' },
        
        { type: 'separator', label: 'GOALS & KPIs' },
        { icon: Award, label: 'Goals', href: '/goals', color: '#013E37', id: 'goals' },
        { icon: Award, label: 'Goal Board', href: '/goals/board', color: '#013E37', id: 'goal-board' },
        { icon: PieChart, label: 'KPI Dashboard', href: '/kpi/dashboard', color: '#013E37', id: 'kpi-dashboard' },
        { icon: BarChart, label: 'KPIs', href: '/kpis', color: '#013E37', id: 'kpis' },
        
        { type: 'separator', label: 'CLIENT PORTAL' },
        { icon: LayoutDashboard, label: 'Client Dashboard', href: '/client/dashboard', color: '#013E37', id: 'client-dashboard' },
        { icon: FileText, label: 'Approvals', href: '/client/approvals', color: '#013E37', id: 'client-approvals' },
        { icon: FileText, label: 'Reports', href: '/client/reports', color: '#013E37', id: 'client-reports' },
        { icon: FileText, label: 'Documents', href: '/client/documents', color: '#013E37', id: 'client-documents' },
        { icon: CreditCard, label: 'Billing', href: '/client/billing', color: '#013E37', id: 'client-billing' },
        
        { type: 'separator', label: 'PARTNERS' },
        { icon: HeartHandshake, label: 'Partners', href: '/partners', color: '#013E37', id: 'partners' },
        { icon: Briefcase, label: 'Brands', href: '/partners/brands', color: '#013E37', id: 'partner-brands' },
        
        { type: 'separator', label: 'RETAINERS' },
        { icon: DollarSign, label: 'Retainers', href: '/retainers', color: '#013E37', id: 'retainers' },
        { icon: DollarSign, label: 'Retainer Health', href: '/retainers/dashboard', color: '#013E37', id: 'retainer-health' },
        
        { type: 'separator', label: 'RISK MANAGEMENT' },
        { icon: AlertCircle, label: 'Risks', href: '/risks', color: '#013E37', id: 'risks' },
        { icon: AlertCircle, label: 'Risk Dashboard', href: '/risk/dashboard', color: '#013E37', id: 'risk-dashboard' },
        
        { type: 'separator', label: 'ANALYTICS' },
        { icon: TrendingUp, label: 'Revenue', href: '/analytics/revenue', color: '#013E37', id: 'revenue-analytics' },
        { icon: TrendingUp, label: 'Growth Metrics', href: '/analytics/growth', color: '#013E37', id: 'growth-metrics' },
        
        { type: 'separator', label: 'REPORTS' },
        { icon: FileText, label: 'Reports', href: '/reports', color: '#013E37', id: 'reports' },
        
        { type: 'separator', label: 'ACTIVITY' },
        { icon: Activity, label: 'Activity Feed', href: '/activities', color: '#013E37', id: 'activities' },
        
        { type: 'separator', label: 'SETTINGS' },
        { icon: Users, label: 'Users', href: '/settings/users', color: '#013E37', id: 'settings-users' },
        { icon: Shield, label: 'Roles', href: '/settings/roles', color: '#013E37', id: 'settings-roles' },
        { icon: Briefcase, label: 'Brands', href: '/settings/brands', color: '#013E37', id: 'settings-brands' },
        { icon: Zap, label: 'Integrations', href: '/settings/integrations', color: '#013E37', id: 'settings-integrations' },
        { icon: Zap, label: 'Automation', href: '/settings/automation', color: '#013E37', id: 'settings-automation' },
        { icon: Building2, label: 'Organization', href: '/settings/organization', color: '#013E37', id: 'settings-organization' },
        { icon: Settings, label: 'Settings', href: '/settings', color: '#013E37', id: 'settings' },
      ];
    }

    // ============================================
    // SEGMENT ADMIN - Manage specific business segment
    // ============================================
    if (role === 'segment_admin') {
      return [
        { icon: LayoutDashboard, label: 'Segment Dashboard', href: '/dashboard', color: '#013E37', id: 'dashboard' },
        
        { type: 'separator', label: 'CRM & SALES' },
        { icon: Users, label: 'Leads', href: '/crm/leads', color: '#013E37', id: 'leads' },
        { icon: Target, label: 'Deals', href: '/crm/deals', color: '#013E37', id: 'deals' },
        { icon: Building2, label: 'Companies', href: '/crm/companies', color: '#013E37', id: 'companies' },
        
        { type: 'separator', label: 'PROJECTS' },
        { icon: FolderKanban, label: 'Projects', href: '/projects', color: '#013E37', id: 'projects' },
        { icon: CheckSquare, label: 'Tasks', href: '/projects/tasks', color: '#013E37', id: 'tasks' },
        { icon: Calendar, label: 'Calendar', href: '/calendar', color: '#013E37', id: 'calendar' },
        
        { type: 'separator', label: 'TEAM' },
        { icon: UsersRound, label: 'Team', href: '/team', color: '#013E37', id: 'team' },
        { icon: Clock, label: 'Timesheets', href: '/employees/timesheet', color: '#013E37', id: 'timesheets' },
        { icon: MessageSquare, label: 'Standups', href: '/employees/standups', color: '#013E37', id: 'standups' },
        
        { type: 'separator', label: 'ANALYTICS' },
        { icon: TrendingUp, label: 'Analytics', href: '/analytics/revenue', color: '#013E37', id: 'analytics' },
        
        { type: 'separator', label: 'SETTINGS' },
        { icon: Settings, label: 'Settings', href: '/settings', color: '#013E37', id: 'settings' },
      ];
    }

    // ============================================
    // MANAGER - Manage team, projects, approvals
    // ============================================
    if (role === 'manager' || role === 'project_manager') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', color: '#013E37', id: 'dashboard' },
        
        { type: 'separator', label: 'PROJECTS' },
        { icon: FolderKanban, label: 'Projects', href: '/projects', color: '#013E37', id: 'projects' },
        { icon: CheckSquare, label: 'Tasks', href: '/projects/tasks', color: '#013E37', id: 'tasks' },
        { icon: CheckSquare, label: 'Board View', href: '/task-board', color: '#013E37', id: 'task-board' },
        { icon: Calendar, label: 'Calendar', href: '/calendar', color: '#013E37', id: 'calendar' },
        
        { type: 'separator', label: 'TEAM' },
        { icon: UserCheck, label: 'Attendance', href: '/employees/attendance', color: '#013E37', id: 'attendance' },
        { icon: UsersRound, label: 'Team', href: '/team', color: '#013E37', id: 'team' },
        { icon: Clock, label: 'Timesheets', href: '/employees/timesheet', color: '#013E37', id: 'timesheets' },
        { icon: Activity, label: 'Performance', href: '/employees/performance', color: '#013E37', id: 'performance' },
        { icon: MessageSquare, label: 'Standups', href: '/employees/standups', color: '#013E37', id: 'standups' },
        
        { type: 'separator', label: 'GOALS & KPIs' },
        { icon: Award, label: 'Goals', href: '/goals', color: '#013E37', id: 'goals' },
        { icon: PieChart, label: 'KPI Dashboard', href: '/kpi/dashboard', color: '#013E37', id: 'kpi-dashboard' },
        
        { type: 'separator', label: 'CLIENT PORTAL' },
        { icon: FileText, label: 'Approvals', href: '/client/approvals', color: '#013E37', id: 'client-approvals' },
        
        { type: 'separator', label: 'ANALYTICS' },
        { icon: TrendingUp, label: 'Reports', href: '/analytics/revenue', color: '#013E37', id: 'reports' },
        { icon: FileText, label: 'Reports', href: '/reports', color: '#013E37', id: 'system-reports' },
        
        { type: 'separator', label: 'SETTINGS' },
        { icon: Settings, label: 'Settings', href: '/settings', color: '#013E37', id: 'settings' },
      ];
    }

    // ============================================
    // EMPLOYEE - Complete tasks, log time, view own data
    // ============================================
    if (role === 'employee') {
      return [
        { icon: LayoutDashboard, label: 'My Dashboard', href: '/dashboard', color: '#013E37', id: 'employee-dashboard' },
        
        { type: 'separator', label: 'MY WORK' },
        { icon: CheckSquare, label: 'My Tasks', href: '/projects/tasks', color: '#013E37', id: 'my-tasks' },
        { icon: FolderKanban, label: 'Projects', href: '/projects', color: '#013E37', id: 'projects' },
        { icon: Clock, label: 'Time Tracker', href: '/employees/timesheet', color: '#013E37', id: 'timesheets' },
        
        { type: 'separator', label: 'PERFORMANCE' },
        { icon: UserCheck, label: 'Attendance', href: '/employees/attendance', color: '#013E37', id: 'attendance' },
        { icon: Activity, label: 'My Performance', href: '/employees/performance', color: '#013E37', id: 'performance' },
        { icon: MessageSquare, label: 'Standups', href: '/employees/standups', color: '#013E37', id: 'standups' },
        
        { type: 'separator', label: 'TEAM' },
        { icon: UsersRound, label: 'Team', href: '/team', color: '#013E37', id: 'team' },
      ];
    }

    // ============================================
    // CLIENT - View projects, approve work, check reports
    // ============================================
    if (role === 'client') {
      return [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/client/dashboard', color: '#013E37', id: 'client-dashboard' },
        
        { type: 'separator', label: 'PROJECTS' },
        { icon: FolderKanban, label: 'My Projects', href: '/projects', color: '#013E37', id: 'client-projects' },
        { icon: CheckSquare, label: 'My Tasks', href: '/projects/tasks', color: '#013E37', id: 'client-tasks' },
        
        { type: 'separator', label: 'REVIEW' },
        { icon: FileText, label: 'Approvals', href: '/client/approvals', color: '#013E37', id: 'client-approvals' },
        
        { type: 'separator', label: 'REPORTS' },
        { icon: FileText, label: 'Reports', href: '/client/reports', color: '#013E37', id: 'client-reports' },
        { icon: FileText, label: 'Documents', href: '/client/documents', color: '#013E37', id: 'client-documents' },
        
        { type: 'separator', label: 'BILLING' },
        { icon: CreditCard, label: 'Billing', href: '/client/billing', color: '#013E37', id: 'client-billing' },
        
        { type: 'separator', label: 'TEAM' },
        { icon: Users, label: 'Team', href: '/team', color: '#013E37', id: 'client-team' },
        
        { type: 'separator', label: 'SUPPORT' },
        { icon: Headphones, label: 'Support', href: '/support', color: '#013E37', id: 'client-support' },
      ];
    }

    // ============================================
    // DEFAULT - Fallback
    // ============================================
    return [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', color: '#013E37', id: 'dashboard' },
      { icon: Settings, label: 'Settings', href: '/settings', color: '#013E37', id: 'settings' },
    ];
  };

  const menuItems = getMenuItems();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  // ============================================
  // STYLES - Updated with brand colors
  // ============================================
  const styles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(1, 62, 55, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 40,
      display: isOpen ? 'block' : 'none',
    },
    sidebar: {
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: isCollapsed ? '72px' : '280px',
      backgroundColor: '#ffffff',
      borderRight: '2px solid #FFEFB3',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 50,
      height: '100vh',
      overflow: 'hidden',
      boxShadow: '4px 0 20px rgba(1, 62, 55, 0.08)',
      transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    },
    logoSection: {
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      borderBottom: '2px solid #FFEFB3',
      flexShrink: 0,
      background: 'linear-gradient(to right, #ffffff, #FFEFB3)',
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      overflow: 'hidden',
    },
    logoIcon: {
      width: '36px',
      height: '36px',
      flexShrink: 0,
      background: 'linear-gradient(135deg, #013E37, #013E37)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(1, 62, 55, 0.25)',
    },
    logoText: {
      color: '#ffffff',
      fontWeight: 'bold',
      fontSize: '14px',
    },
    logoLabel: {
      fontSize: '15px',
      fontWeight: 'bold',
      color: '#013E37',
      whiteSpace: 'nowrap',
    },
    logoSub: {
      fontSize: '8px',
      color: '#013E37',
      fontWeight: '500',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      marginTop: '-2px',
      opacity: 0.6,
    },
    closeButton: {
      padding: '4px',
      borderRadius: '8px',
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      color: '#013E37',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
    },
    userProfile: {
      padding: '12px 16px',
      borderBottom: '2px solid #FFEFB3',
      flexShrink: 0,
    },
    userContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    avatarWrapper: {
      position: 'relative',
      flexShrink: 0,
    },
    avatar: {
      width: '40px',
      height: '40px',
      backgroundColor: '#FFEFB3',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '2px solid #013E37',
    },
    avatarText: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#013E37',
    },
    onlineDot: {
      position: 'absolute',
      bottom: '-2px',
      right: '-2px',
      width: '12px',
      height: '12px',
      backgroundColor: '#013E37',
      borderRadius: '50%',
      border: '2px solid #ffffff',
    },
    userInfo: {
      flex: 1,
      minWidth: 0,
    },
    userName: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#013E37',
      margin: 0,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    userRole: {
      fontSize: '11px',
      color: '#013E37',
      margin: '2px 0 0 0',
      textTransform: 'capitalize',
      opacity: 0.7,
    },
    nav: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '8px 12px',
      overflow: 'hidden',
    },
    navScroll: {
      flex: 1,
      overflowY: 'auto',
      paddingBottom: '8px',
    },
    separator: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 8px 4px 8px',
    },
    separatorLine: {
      flex: 1,
      height: '2px',
      background: 'linear-gradient(to right, transparent, #FFEFB3, transparent)',
    },
    separatorLabel: {
      fontSize: '8px',
      fontWeight: '600',
      color: '#013E37',
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      opacity: 0.7,
    },
    navItems: {
      spaceY: '2px',
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 12px',
      borderRadius: '12px',
      color: '#013E37',
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      position: 'relative',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
    },
    navLinkActive: {
      backgroundColor: '#FFEFB3',
      color: '#013E37',
      fontWeight: '600',
      boxShadow: '0 2px 8px rgba(1, 62, 55, 0.08)',
    },
    navLinkCollapsed: {
      justifyContent: 'center',
      padding: '8px',
    },
    navIcon: {
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px',
    },
    navLabel: {
      flex: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    activeIndicator: {
      position: 'absolute',
      right: '8px',
      width: '4px',
      height: '24px',
      background: 'linear-gradient(to bottom, #013E37, #013E37)',
      borderRadius: '4px',
      boxShadow: '0 0 12px rgba(1, 62, 55, 0.3)',
    },
    bottomSection: {
      borderTop: '2px solid #FFEFB3',
      paddingTop: '8px',
      flexShrink: 0,
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 12px',
      borderRadius: '12px',
      border: 'none',
      background: 'transparent',
      color: '#013E37',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: '100%',
      fontSize: '13px',
      fontWeight: '500',
    },
    logoutButtonHover: {
      backgroundColor: '#FFEFB3',
    },
    logoutButtonCollapsed: {
      justifyContent: 'center',
      padding: '8px',
    },
    logoutIcon: {
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '20px',
    },
    collapseButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: '100%',
      padding: '6px 12px',
      borderRadius: '8px',
      border: '2px solid #FFEFB3',
      background: 'transparent',
      color: '#013E37',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '12px',
      fontWeight: '500',
      marginTop: '4px',
    },
    collapseButtonHover: {
      backgroundColor: '#FFEFB3',
      borderColor: '#013E37',
    },
  };

  const getNavLinkStyle = (isActive) => {
    let style = { ...styles.navLink };
    if (isActive) {
      style = { ...style, ...styles.navLinkActive };
    }
    if (isCollapsed) {
      style = { ...style, ...styles.navLinkCollapsed };
    }
    return style;
  };

  return (
    <>
      {isOpen && (
        <div 
          style={styles.overlay}
          className="lg:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        style={styles.sidebar}
        className="lg:translate-x-0"
      >
        {/* Logo */}
        <div style={styles.logoSection}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>
              <span style={styles.logoText}>A</span>
            </div>
            {!isCollapsed && (
              <div>
                <div style={styles.logoLabel}>AgencyOS</div>
                <div style={styles.logoSub}>Enterprise</div>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={styles.closeButton}
            className="lg:hidden"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* User Profile */}
        {!isCollapsed && (
          <div style={styles.userProfile}>
            <div style={styles.userContainer}>
              <div style={styles.avatarWrapper}>
                <div style={styles.avatar}>
                  <span style={styles.avatarText}>{getInitials()}</span>
                </div>
                <div style={styles.onlineDot}></div>
              </div>
              <div style={styles.userInfo}>
                <p style={styles.userName}>
                  {user?.firstName || 'User'} {user?.lastName || ''}
                </p>
                <p style={styles.userRole}>{getRoleDisplay()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav style={styles.nav}>
          <div style={styles.navScroll} className="sidebar-scroll">
            <div style={styles.navItems}>
              {menuItems.map((item, index) => {
                if (item.type === 'separator') {
                  if (isCollapsed) return null;
                  return (
                    <div key={`sep-${index}`} style={styles.separator}>
                      <div style={styles.separatorLine}></div>
                      <span style={styles.separatorLabel}>{item.label}</span>
                      <div style={styles.separatorLine}></div>
                    </div>
                  );
                }
                return (
                  <NavLink
                    key={item.id}
                    to={item.href}
                    style={({ isActive }) => getNavLinkStyle(isActive)}
                    title={isCollapsed ? item.label : ''}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        onClose();
                      }
                    }}
                    className="sidebar-nav-link"
                  >
                    {({ isActive }) => (
                      <>
                        <div style={styles.navIcon}>
                          <item.icon 
                            size={isCollapsed ? 20 : 18} 
                            color={isActive ? '#013E37' : '#013E37'}
                            strokeWidth={isActive ? 2 : 1.8}
                          />
                        </div>
                        {!isCollapsed && (
                          <span style={styles.navLabel}>{item.label}</span>
                        )}
                        {isActive && !isCollapsed && (
                          <div style={styles.activeIndicator}></div>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Bottom */}
          <div style={styles.bottomSection}>
            <button
              onClick={handleLogout}
              style={{
                ...styles.logoutButton,
                ...(isCollapsed ? styles.logoutButtonCollapsed : {})
              }}
              title={isCollapsed ? 'Logout' : ''}
              className="sidebar-logout"
            >
              <div style={styles.logoutIcon}>
                <LogOut size={18} color="#013E37" />
              </div>
              {!isCollapsed && <span>Logout</span>}
            </button>

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={styles.collapseButton}
              className="hidden lg:flex sidebar-collapse"
            >
              {isCollapsed ? (
                <ChevronRight size={16} />
              ) : (
                <>
                  <ChevronLeft size={16} />
                  <span>Collapse</span>
                </>
              )}
            </button>
          </div>
        </nav>
      </aside>

      <style>{`
        .sidebar-nav-link:hover {
          background-color: #FFEFB3;
          color: #013E37;
          transform: translateX(2px);
        }
        
        .sidebar-nav-link.active {
          background-color: #FFEFB3;
          color: #013E37;
          font-weight: 600;
        }

        .sidebar-logout:hover {
          background-color: #FFEFB3;
          color: #013E37;
        }

        .sidebar-collapse:hover {
          background-color: #FFEFB3;
          border-color: #013E37;
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #FFEFB3;
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #013E37;
        }
        
        .sidebar-nav-link {
          position: relative;
          transition: all 0.2s ease;
        }
      `}</style>
    </>
  );
};

export default Sidebar;