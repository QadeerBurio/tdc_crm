import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";
import { ClientRoute } from "./ClientRoute";
import { ManagerRoute } from "./ManagerRoute";
import { SegmentAdminRoute } from "./SegmentAdminRoute";

// Auth Pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";

// Dashboard
import Dashboard from "../pages/dashboard/Dashboard";
import EmployeeDashboard from "../pages/employees/EmployeeDashboard";
import SuperAdminDashboard from "../pages/dashboard/SuperAdminDashboard";
import SegmentAdminDashboard from "../pages/dashboard/SegmentAdminDashboard";
import ManagerDashboard from "../pages/dashboard/ManagerDashboard";
import ExecutiveDashboard from "../pages/dashboard/ExecutiveDashboard";

// CRM
import Leads from "../pages/crm/Leads";
import LeadDetails from "../pages/crm/LeadDetails";
import Deals from "../pages/crm/Deals";
import Pipeline from "../pages/crm/Pipeline";
import Outreach from "../pages/crm/Outreach";
import Companies from "../pages/crm/Companies";

// Projects
import Projects from "../pages/projects/Projects";
import ProjectDetails from "../pages/projects/ProjectDetails";
import Tasks from "../pages/projects/Tasks";
import TaskDetails from "../pages/projects/TaskDetails";
import ProjectBoard from "../pages/projects/ProjectBoard";
import CalendarView from "../pages/projects/CalendarView";

// Employees
import Attendance from "../pages/employees/Attendance";
import Timesheet from "../pages/employees/Timesheet";
import Performance from "../pages/employees/Performance";
import Standups from "../pages/employees/Standups";
import EmployeeProfile from "../pages/employees/EmployeeProfile";
import Team from "../pages/employees/Team";

// Clients
import ClientDashboard from "../pages/clients/ClientDashboard";
import Approvals from "../pages/clients/Approvals";
import ClientReports from "../pages/clients/Reports";
import Documents from "../pages/clients/Documents";
import Billing from "../pages/clients/Billing";

// Organization
import Company from "../pages/organization/Company";
import Departments from "../pages/organization/Departments";
import Teams from "../pages/organization/Teams";
import Hierarchy from "../pages/organization/Hierarchy";

// Goals
import Goals from "../pages/goals/Goals";
import GoalDetails from "../pages/goals/GoalDetails";
import GoalTracking from "../pages/goals/GoalTracking";
import GoalBoard from "../pages/goals/GoalBoard";

// KPI
import KPIs from "../pages/kpi/KPIs";
import KPIDetails from "../pages/kpi/KPIDetails";
import KPIDashboard from "../pages/kpi/KPIDashboard";
import KPIComparison from "../pages/kpi/KPIComparison";

// Activity
import ActivityFeed from "../pages/activity/ActivityFeed";
import ActivitySearch from "../pages/activity/ActivitySearch";
import ActivityDetails from "../pages/activity/ActivityDetails";

// Workflows
import Workflows from "../pages/workflows/Workflows";
import WorkflowBuilder from "../pages/workflows/WorkflowBuilder";
import WorkflowExecution from "../pages/workflows/WorkflowExecution";
import WorkflowAnalytics from "../pages/workflows/WorkflowAnalytics";

// Partners
import Partners from "../pages/partners/Partners";
import PartnerBrands from "../pages/partners/Brands";        // ✅ Renamed to PartnerBrands
import Universities from "../pages/partners/Universities";
import Employers from "../pages/partners/Employers";
import Influencers from "../pages/partners/Influencers";

// Retainers
import Retainers from "../pages/retainers/Retainers";
import RetainerDetails from "../pages/retainers/RetainerDetails";
import RetainerDashboard from "../pages/retainers/RetainerDashboard";
import RetainerHealth from "../pages/retainers/RetainerHealth";

// Risk
import Risks from "../pages/risk/Risks";
import RiskDetails from "../pages/risk/RiskDetails";
import RiskDashboard from "../pages/risk/RiskDashboard";
// import RiskAlerts from "../pages/risk/RiskAlerts";

// Audit
import AuditLog from "../pages/audit/AuditLog";
import AuditDashboard from "../pages/audit/AuditDashboard";
import AuditSearch from "../pages/audit/AuditSearch";

// Reports
import SystemReports from "../pages/reports/Reports";
import ReportBuilder from "../pages/reports/ReportBuilder";
import ReportViewer from "../pages/reports/ReportViewer";
import ReportScheduler from "../pages/reports/ReportScheduler";

// Dashboard Builder
import Builder from "../pages/dashboardBuilder/Builder";
import Templates from "../pages/dashboardBuilder/Templates";
import WidgetGallery from "../pages/dashboardBuilder/WidgetGallery";
import DashboardPreview from "../pages/dashboardBuilder/DashboardPreview";

// Settings
import Users from "../pages/settings/Users";
import Roles from "../pages/settings/Roles";
import SettingsBrands from "../pages/settings/Brands";        // ✅ Renamed to SettingsBrands
import Tenants from "../pages/settings/Tenants";
import Integrations from "../pages/settings/Integrations";
import Automation from "../pages/settings/Automation";
import OrganizationSettings from "../pages/settings/Organization";
import WorkflowSettings from "../pages/settings/Workflows";
import KPISettings from "../pages/kpi/KPIs";
import DashboardBuilderSettings from "../pages/settings/DashboardBuilder";

// Analytics
import RevenueAnalytics from "../pages/analytics/RevenueAnalytics";
import ProductivityAnalytics from "../pages/analytics/ProductivityAnalytics";
import GrowthMetrics from "../pages/analytics/GrowthMetrics";

// Layouts
import DashboardLayout from "../components/layout/DashboardLayout";
import ClientLayout from "../components/layout/ClientLayout";
import Settings from "../pages/settings/Settings";
import Segments from "../pages/organization/Segments";

export const AppRoutes = () => {
  const { isAuthenticated, getDashboardRoute, user } = useAuth();

  const getDashboardComponent = () => {
    if (!user) return Dashboard;
    if (user.role === 'super_admin') return SuperAdminDashboard;
    if (user.role === 'admin') return SuperAdminDashboard;
    if (user.role === 'segment_admin') return SegmentAdminDashboard;
    if (user.role === 'manager') return ManagerDashboard;
    if (user.role === 'employee') return EmployeeDashboard;
    if (user.role === 'client') return ClientDashboard;
    return Dashboard;
  };

  const DashboardComponent = getDashboardComponent();

  return (
    <Routes>
      {/* ========================================== */}
      {/* PUBLIC ROUTES */}
      {/* ========================================== */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to={getDashboardRoute()} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to={getDashboardRoute()} replace />
          ) : (
            <Register />
          )
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ========================================== */}
      {/* PROTECTED ROUTES */}
      {/* ========================================== */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* ======================================== */}
          {/* DASHBOARD - Role based */}
          {/* ======================================== */}
          <Route path="/" element={<Navigate to={getDashboardRoute()} replace />} />
          <Route path="/dashboard" element={<DashboardComponent />} />
          <Route path="/executive-dashboard" element={<ExecutiveDashboard />} />

          {/* ======================================== */}
          {/* CRM ROUTES */}
          {/* ======================================== */}
          <Route path="/crm/leads" element={<Leads />} />
          <Route path="/crm/leads/:id" element={<LeadDetails />} />
          <Route path="/crm/deals" element={<Deals />} />
          <Route path="/crm/pipeline" element={<Pipeline />} />
          <Route path="/crm/outreach" element={<Outreach />} />
          <Route path="/crm/companies" element={<Companies />} />

          {/* ======================================== */}
          {/* PROJECT ROUTES */}
          {/* ======================================== */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/projects/tasks" element={<Tasks />} />
          <Route path="/tasks/:id" element={<TaskDetails />} />
          <Route path="/task-board" element={<ProjectBoard />} />
          <Route path="/calendar" element={<CalendarView />} />

          {/* ======================================== */}
          {/* EMPLOYEE ROUTES */}
          {/* ======================================== */}
          <Route path="/employees/attendance" element={<Attendance />} />
          <Route path="/employees/timesheet" element={<Timesheet />} />
          <Route path="/employees/performance" element={<Performance />} />
          <Route path="/employees/standups" element={<Standups />} />
          <Route path="/employees/profile/:id" element={<EmployeeProfile />} />
          <Route path="/team" element={<Team />} />

          {/* ======================================== */}
          {/* ORGANIZATION ROUTES - Admin Only */}
          {/* ======================================== */}
          <Route element={<AdminRoute />}>
            <Route path="/organization/company" element={<Company />} />
            <Route path="/organization/departments" element={<Departments />} />
             <Route path="/organization/Segments" element={<Segments />} />
            <Route path="/organization/teams" element={<Teams />} />
            <Route path="/organization/hierarchy" element={<Hierarchy />} />
          </Route>

          {/* ======================================== */}
          {/* GOALS ROUTES - Manager+ */}
          {/* ======================================== */}
          <Route element={<ManagerRoute />}>
            <Route path="/goals" element={<Goals />} />
            <Route path="/goals/:id" element={<GoalDetails />} />
            <Route path="/goals/tracking" element={<GoalTracking />} />
            <Route path="/goals/board" element={<GoalBoard />} />
          </Route>

          {/* ======================================== */}
          {/* KPI ROUTES - Manager+ */}
          {/* ======================================== */}
          <Route element={<ManagerRoute />}>
            <Route path="/kpis" element={<KPIs />} />
            <Route path="/kpis/:id" element={<KPIDetails />} />
            <Route path="/kpi/dashboard" element={<KPIDashboard />} />
            <Route path="/kpi/comparison" element={<KPIComparison />} />
          </Route>

          {/* ======================================== */}
          {/* ACTIVITY ROUTES */}
          {/* ======================================== */}
          <Route path="/activities" element={<ActivityFeed />} />
          <Route path="/activities/search" element={<ActivitySearch />} />
          <Route path="/activities/:id" element={<ActivityDetails />} />

          {/* ======================================== */}
          {/* WORKFLOW ROUTES - Admin Only */}
          {/* ======================================== */}
          <Route element={<AdminRoute />}>
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/workflows/builder" element={<WorkflowBuilder />} />
            <Route path="/workflows/builder/:id" element={<WorkflowBuilder />} />
            <Route path="/workflows/execution/:entityType/:entityId" element={<WorkflowExecution />} />
            <Route path="/workflows/analytics" element={<WorkflowAnalytics />} />
          </Route>

          {/* ======================================== */}
          {/* PARTNER ROUTES - Manager+ */}
          {/* ======================================== */}
          <Route element={<ManagerRoute />}>
            <Route path="/partners" element={<Partners />} />
            <Route path="/partners/brands" element={<PartnerBrands />} />   {/* ✅ Using PartnerBrands */}
            <Route path="/partners/universities" element={<Universities />} />
            <Route path="/partners/employers" element={<Employers />} />
            <Route path="/partners/influencers" element={<Influencers />} />
          </Route>

          {/* ======================================== */}
          {/* RETAINER ROUTES - Manager+ */}
          {/* ======================================== */}
          <Route element={<ManagerRoute />}>
            <Route path="/retainers" element={<Retainers />} />
            <Route path="/retainers/:id" element={<RetainerDetails />} />
            <Route path="/retainers/dashboard" element={<RetainerDashboard />} />
            <Route path="/retainers/:id/health" element={<RetainerHealth />} />
          </Route>

          {/* ======================================== */}
          {/* RISK ROUTES - Manager+ */}
          {/* ======================================== */}
          <Route element={<ManagerRoute />}>
            <Route path="/risks" element={<Risks />} />
            <Route path="/risks/:id" element={<RiskDetails />} />
            <Route path="/risk/dashboard" element={<RiskDashboard />} />
            {/* <Route path="/risk/alerts" element={<RiskAlerts />} /> */}
          </Route>

          {/* ======================================== */}
          {/* AUDIT ROUTES - Admin Only */}
          {/* ======================================== */}
          <Route element={<AdminRoute />}>
            <Route path="/audit" element={<AuditLog />} />
            <Route path="/audit/dashboard" element={<AuditDashboard />} />
            <Route path="/audit/search" element={<AuditSearch />} />
          </Route>

          {/* ======================================== */}
          {/* REPORT ROUTES - Manager+ */}
          {/* ======================================== */}
          <Route element={<ManagerRoute />}>
            <Route path="/reports" element={<SystemReports />} />
            <Route path="/reports/builder" element={<ReportBuilder />} />
            <Route path="/reports/builder/:id" element={<ReportBuilder />} />
            <Route path="/reports/:id" element={<ReportViewer />} />
            <Route path="/reports/scheduler" element={<ReportScheduler />} />
          </Route>

          {/* ======================================== */}
          {/* DASHBOARD BUILDER - Admin Only */}
          {/* ======================================== */}
          <Route element={<AdminRoute />}>
            <Route path="/dashboard-builder" element={<Builder />} />
            <Route path="/dashboard-builder/templates" element={<Templates />} />
            <Route path="/dashboard-builder/widgets" element={<WidgetGallery />} />
            <Route path="/dashboard-builder/preview/:id" element={<DashboardPreview />} />
          </Route>

          {/* ======================================== */}
          {/* ANALYTICS ROUTES - Manager+ */}
          {/* ======================================== */}
          <Route element={<ManagerRoute />}>
            <Route path="/analytics/revenue" element={<RevenueAnalytics />} />
            <Route path="/analytics/productivity" element={<ProductivityAnalytics />} />
            <Route path="/analytics/growth" element={<GrowthMetrics />} />
          </Route>

          {/* ======================================== */}
          {/* SETTINGS ROUTES - Admin Only */}
          {/* ======================================== */}
          <Route element={<AdminRoute />}>
          <Route path="/settings" element={<Settings />} />
            <Route path="/settings/users" element={<Users />} />
            <Route path="/settings/roles" element={<Roles />} />
            <Route path="/settings/brands" element={<SettingsBrands />} />   {/* ✅ Using SettingsBrands */}
            <Route path="/settings/tenants" element={<Tenants />} />
            <Route path="/settings/integrations" element={<Integrations />} />
            <Route path="/settings/automation" element={<Automation />} />
            <Route path="/settings/organization" element={<OrganizationSettings />} />
            <Route path="/settings/workflows" element={<WorkflowSettings />} />
            <Route path="/settings/kpis" element={<KPISettings />} />
            <Route path="/settings/dashboard-builder" element={<DashboardBuilderSettings />} />
          </Route>
        </Route>

        {/* ======================================== */}
        {/* CLIENT ROUTES */}
        {/* ======================================== */}
        <Route element={<ClientRoute />}>
          <Route element={<ClientLayout />}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/approvals" element={<Approvals />} />
            <Route path="/client/reports" element={<ClientReports />} />
            <Route path="/client/documents" element={<Documents />} />
            <Route path="/client/billing" element={<Billing />} />
          </Route>
        </Route>
      </Route>

      {/* ========================================== */}
      {/* 404 - Redirect */}
      {/* ========================================== */}
      <Route path="*" element={<Navigate to={getDashboardRoute()} replace />} />
    </Routes>
  );
};