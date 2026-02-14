import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Page Imports
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import DashboardOverview from "./pages/DashboardOverview";
import AssignTask from "./pages/AssignTask";
import AssignedTasks from "./pages/AssignedTasks";
import Employees from "./pages/Employees";
import Clients from "./pages/Clients";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import MarkAttendance from "./pages/MarkAttendance"; // NEW IMPORT

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Route (Login) */}
          <Route path="/" element={<Login />} />

          {/* NEW: Standalone Mobile Attendance Page (No Sidebar) */}
          <Route path="/mark-attendance" element={<MarkAttendance />} />

          {/* Protected Dashboard Routes (Admin Panel) */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardOverview />} />
            <Route path="assign" element={<AssignTask />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="clients" element={<Clients />} />
            <Route path="tasks" element={<AssignedTasks />} />
            <Route path="employees" element={<Employees />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all Route for 404s */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
