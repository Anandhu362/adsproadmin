import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardPlus,
  ClipboardList,
  Users,
  BarChart3,
  Settings,
  LogOut,
  UserCheck,
} from "lucide-react";
import { authStorage } from "@/lib/auth"; // Utility to clear session

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Assign Task", url: "/dashboard/assign", icon: ClipboardPlus },
  { title: "Clients", url: "/dashboard/clients", icon: Users },
  { title: "Assigned Tasks", url: "/dashboard/tasks", icon: ClipboardList },
  { title: "Employees", url: "/dashboard/employees", icon: UserCheck },
  { title: "Reports", url: "/dashboard/reports", icon: BarChart3 },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  // Logic: Handle logout as a function to clear session storage
  const handleLogout = () => {
    authStorage.clear();
    navigate("/");
  };

  return (
    // FIX: Added h-screen and sticky top-0 to keep logout at bottom
    <aside className="w-64 bg-sidebar h-screen sticky top-0 flex flex-col border-r border-sidebar-border shrink-0">
      {/* Logo Section */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0">
        <h1 className="text-xl font-bold text-sidebar-primary tracking-tight">
          Ads<span className="text-sidebar-foreground">Pro</span>
        </h1>
      </div>

      {/* Navigation Area */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
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
                <item.icon className={`h-4 w-4 ${isActive(item.url) ? "text-sidebar-primary" : ""}`} />
                {item.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Fixed Logout Section */}
      <div className="px-3 py-4 border-t border-sidebar-border mt-auto shrink-0 bg-sidebar">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
