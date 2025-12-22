import { Outlet, useLocation } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/dashboard/assign": "Assign Task",
  "/dashboard/tasks": "Assigned Tasks",
  "/dashboard/employees": "Employees",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

const DashboardLayout = () => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="flex min-h-screen bg-secondary">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader title={title} />
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
