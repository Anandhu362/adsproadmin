import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Users, CheckCircle, Clock, TrendingUp, Loader2 } from "lucide-react";

// Define TypeScript interfaces for the API responses
interface StatsData {
  total: number;
  completed: number;
  pending: number;
  activeEmployees: number;
}

interface TaskData {
  _id: string;
  employeeId: { name: string } | null;
  employeeName: string;
  taskType: string; // Updated from workType to match your Task model
  clientName: string;
  status: string;
}

const DashboardOverview = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentTasks, setRecentTasks] = useState<TaskData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Parallel fetch for speed
        const [statsRes, tasksRes] = await Promise.all([
          fetch("/api/reports/stats", { headers }),
          fetch("/api/tasks", { headers })
        ]);

        const statsData = await statsRes.json();
        const tasksData = await tasksRes.json();

        setStats(statsData);
        setRecentTasks(tasksData.slice(0, 5)); // Show latest 5
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Updated Status Styles with much higher contrast
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Approved":
      case "Completed": 
        return "bg-green-100 text-green-800 border-green-300";
      case "Progress":
      case "In Progress": 
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Correction": 
        return "bg-red-100 text-red-800 border-red-300";
      default: 
        return "bg-blue-100 text-blue-800 border-blue-300"; // Assigned / Pending
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
        <p className="text-slate-500 font-bold">Syncing Database...</p>
      </div>
    );
  }

  const statCards = [
    { title: "Total Tasks", value: stats?.total || 0, icon: ClipboardList, color: "text-slate-900", bg: "bg-slate-50" },
    { title: "Active Employees", value: stats?.activeEmployees || 0, icon: Users, color: "text-slate-900", bg: "bg-slate-50" },
    { title: "Completed", value: stats?.completed || 0, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { title: "Pending", value: stats?.pending || 0, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-white border-slate-200 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-wider">{stat.title}</p>
                  <p className="text-4xl font-black text-slate-900 mt-1">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-bold text-green-600">Live</span>
                    <span className="text-xs text-slate-400 ml-1 font-medium">Data from DB</span>
                  </div>
                </div>
                <div className={`w-14 h-14 rounded-xl ${stat.bg} flex items-center justify-center border border-slate-100`}>
                  <stat.icon className={`h-7 w-7 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Tasks & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-lg">
          <CardHeader className="border-b border-slate-50 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task._id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center shadow-sm">
                      <span className="text-base font-bold text-white uppercase">
                        {(task.employeeId?.name || "?").charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-slate-900">
                        {task.employeeId?.name || "Unassigned"}
                      </p>
                      <p className="text-sm font-medium text-slate-500">
                        <span className="text-slate-700 font-bold">{task.clientName}</span> • {task.taskType || "Design Work"}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-black px-3 py-1.5 rounded-full border shadow-sm ${getStatusStyles(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-slate-400 font-medium italic">No active tasks found in database.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Overview Column */}
        <Card className="bg-white border-slate-200 shadow-lg overflow-hidden">
          <CardHeader className="bg-slate-900 pb-6">
            <CardTitle className="text-lg font-bold text-white">Current Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="p-5 rounded-xl bg-green-50 border border-green-100">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-600 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900">{stats?.completed || 0}</p>
                  <p className="text-sm font-bold text-green-700">Tasks Completed</p>
                </div>
              </div>
            </div>
            <div className="p-5 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-amber-600 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900">{stats?.pending || 0}</p>
                  <p className="text-sm font-bold text-amber-700">Tasks Pending</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardOverview;