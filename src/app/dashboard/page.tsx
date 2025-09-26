"use client";

import { useApp } from "@/context/app-provider";
import SuperAdminDashboard from "@/components/dashboard/super-admin-dashboard";
import AdminDashboard from "@/components/dashboard/admin-dashboard";
import SubAdminDashboard from "@/components/dashboard/sub-admin-dashboard";
import UserDashboard from "@/components/dashboard/user-dashboard";

export default function DashboardPage() {
  const { currentUser } = useApp();

  if (!currentUser) return null;

  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'Super-Admin':
        return <SuperAdminDashboard />;
      case 'Admin':
        return <AdminDashboard />;
      case 'Sub Admin':
        return <SubAdminDashboard />;
      case 'User':
        return <UserDashboard />;
      default:
        return <div>Welcome to your dashboard!</div>;
    }
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {currentUser.name}! Here&apos;s your overview.
        </p>
      </div>
      {renderDashboard()}
    </div>
  );
}
