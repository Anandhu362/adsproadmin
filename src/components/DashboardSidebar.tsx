import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardPlus,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Assign Task", url: "/dashboard/assign", icon: ClipboardPlus },
  { title: "Assigned Tasks", url: "/dashboard/tasks", icon: ClipboardList },
  { title: "Employees", url: "/dashboard/employees", icon: Users },
  { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const DashboardSidebar = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-sidebar min-h-screen flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-primary tracking-tight">
          Ads<span className="text-sidebar-foreground">Pro</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.title}>
              <NavLink
                to={item.url}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.url)
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </NavLink>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
