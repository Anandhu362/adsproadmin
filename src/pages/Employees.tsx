import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, CheckCircle, Clock, Loader2, Users, UserPlus } from "lucide-react";
import EmployeeDetailsModal from "@/components/EmployeeDetailsModal"; // Separate component

const Employees = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Logic: State to manage the detailed popup card
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Fetch live employee data with task stats
  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/employees", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Logic: Trigger popup when a card is clicked
  const handleCardClick = (employee: any) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
        <p className="text-slate-500 font-bold">Syncing Directory...</p>
      </div>
    );
  }

  const totalCompleted = employees.reduce((acc, emp) => acc + (emp.tasksCompleted || 0), 0);
  const totalPending = employees.reduce((acc, emp) => acc + (emp.tasksPending || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-sm text-slate-500 font-medium">Click any card to view or edit details</p>
        </div>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 px-6">
          <UserPlus className="mr-2 h-5 w-5" /> Add Employee
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Total Staff</p>
                <p className="text-4xl font-black text-slate-900 mt-1">{employees.length}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                <Users className="h-7 w-7 text-slate-900" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6 text-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-green-600">Total Completed</p>
                <p className="text-4xl font-black text-slate-900 mt-1">{totalCompleted}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-green-50 flex items-center justify-center border border-green-100">
                <CheckCircle className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6 text-amber-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-amber-600">Total Pending</p>
                <p className="text-4xl font-black text-slate-900 mt-1">{totalPending}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                <Clock className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Employee Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <Card 
            key={employee._id} 
            className="bg-white border-slate-200 shadow-md hover:shadow-xl transition-all cursor-pointer group"
            onClick={() => handleCardClick(employee)}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4 pb-4">
                <Avatar className="h-16 w-16 border-2 border-slate-100 group-hover:border-slate-900 transition-colors">
                  <AvatarFallback className="bg-slate-900 text-white text-xl font-black">
                    {employee.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-slate-900 text-lg truncate">{employee.name}</h3>
                    <Badge className={`font-black uppercase text-[10px] ${employee.status === 'Active' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                      {employee.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-bold text-slate-500">{employee.role || "Senior Designer"}</p>
                </div>
              </div>

              <div className="py-4 border-t border-slate-50 space-y-2">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm font-bold truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm font-bold">{employee.phone || "+91 00000 00000"}</span>
                </div>
              </div>

              <div className="mt-4 pt-5 border-t border-slate-100 flex gap-4">
                <div className="flex-1 text-center bg-green-50/50 p-3 rounded-xl border border-green-100">
                  <p className="text-2xl font-black text-green-700">{employee.tasksCompleted || 0}</p>
                  <p className="text-[10px] font-black uppercase text-green-600">Completed</p>
                </div>
                <div className="flex-1 text-center bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                  <p className="text-2xl font-black text-amber-700">{employee.tasksPending || 0}</p>
                  <p className="text-[10px] font-black uppercase text-amber-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* The Separate Popup Component */}
      <EmployeeDetailsModal 
        isOpen={isModalOpen} 
        employee={selectedEmployee} 
        onClose={() => setIsModalOpen(false)}
        onUpdate={fetchEmployees} // Refresh data after an edit in the modal
      />
    </div>
  );
};

export default Employees;