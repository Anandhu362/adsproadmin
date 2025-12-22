import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Mail, 
  Phone, 
  CheckCircle, 
  Clock, 
  Loader2, 
  Users, 
  UserPlus, 
  Trash2, 
  AlertTriangle 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EmployeeDetailsModal from "@/components/EmployeeDetailsModal"; 
import AddEmployeeModal from "@/components/AddEmployeeModal";
import { apiFetch } from "@/lib/api"; 
import { useToast } from "@/hooks/use-toast";

const Employees = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Modal States
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      const data = await apiFetch("/employees");
      setEmployees(data);
    } catch (error: any) {
      console.error("Directory Sync Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleCardClick = (employee: any) => {
    setSelectedEmployee(employee);
    setIsDetailsOpen(true);
  };

  // Logic: Trigger custom delete dialog and stop event propagation
  const initiateDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevents opening the details modal when clicking trash
    setEmployeeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // Logic: Perform deletion via centralized API
  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    setIsDeleting(true);
    try {
      await apiFetch(`/employees/${employeeToDelete}`, { method: "DELETE" });
      setEmployees(employees.filter(emp => emp._id !== employeeToDelete));
      toast({ title: "Employee Removed", description: "The profile has been permanently deleted." });
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setEmployeeToDelete(null);
    }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-10 w-10 text-slate-900" /></div>;

  // Calculate summary stats
  const totalCompleted = employees.reduce((acc, emp) => acc + (emp.tasksCompleted || 0), 0);
  const totalPending = employees.reduce((acc, emp) => acc + (emp.tasksPending || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Employee Directory</h1>
          <p className="text-sm text-slate-500 font-medium">Manage your agency staff and task loads</p>
        </div>
        <Button 
          onClick={() => setIsAddModalOpen(true)} 
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 px-6 shadow-md transition-transform active:scale-95"
        >
          <UserPlus className="mr-2 h-5 w-5" /> Add Employee
        </Button>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Active Staff</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{employees.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
              <Users className="h-6 w-6 text-slate-900" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-green-600 tracking-widest">Completed</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalCompleted}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center border border-green-100 text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Pending</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{totalPending}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <Card 
            key={employee._id} 
            className="bg-white border-slate-200 shadow-md hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
            onClick={() => handleCardClick(employee)}
          >
            {/* Trash Action Overlay */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 h-8 w-8 text-slate-300 hover:text-red-600 hover:bg-red-50 z-10 transition-colors rounded-full"
              onClick={(e) => initiateDelete(e, employee._id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <CardContent className="p-6">
              <div className="flex items-start gap-4 pb-4 border-b border-slate-50">
                <Avatar className="h-14 w-14 border-2 border-slate-100 group-hover:border-slate-900 transition-colors shadow-inner">
                  <AvatarFallback className="bg-slate-900 text-white font-black">
                    {employee.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-black text-slate-900 text-base truncate pr-6 tracking-tight">{employee.name}</h3>
                    <Badge className={`font-black uppercase text-[9px] ${employee.status === 'Active' ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                      {employee.status}
                    </Badge>
                  </div>
                  {/* Designation: Fixed as "Employee" for all */}
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">Agency Employee</p>
                </div>
              </div>

              <div className="py-4 space-y-2">
                <div className="flex items-center gap-3 text-slate-600">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone className="h-3.5 w-3.5" />
                  <span className="text-xs font-bold">{employee.phone || "No contact info"}</span>
                </div>
              </div>

              <div className="mt-2 flex gap-3">
                <div className="flex-1 text-center bg-green-50/40 p-2 rounded-lg border border-green-100/50">
                  <p className="text-lg font-black text-green-700 leading-none">{employee.tasksCompleted || 0}</p>
                  <p className="text-[9px] font-black uppercase text-green-600 mt-1">Completed</p>
                </div>
                <div className="flex-1 text-center bg-amber-50/40 p-2 rounded-lg border border-amber-100/50">
                  <p className="text-lg font-black text-amber-700 leading-none">{employee.tasksPending || 0}</p>
                  <p className="text-[9px] font-black uppercase text-amber-600 mt-1">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* --- Custom Deletion Dialog --- */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border-slate-200 sm:max-w-[400px] shadow-2xl">
          <DialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl font-black text-slate-900 uppercase tracking-tight">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-bold px-4">
              Are you sure? This will permanently remove the employee and all their task history from the directory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-center gap-3 pt-6 pb-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-slate-200 font-bold text-slate-700 h-11" disabled={isDeleting}>Cancel</Button>
            <Button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black shadow-lg h-11" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Delete Profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Employee Registration Modal */}
      <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchEmployees} />

      {/* Employee Details & Edit Modal */}
      <EmployeeDetailsModal isOpen={isDetailsOpen} employee={selectedEmployee} onClose={() => setIsDetailsOpen(false)} onUpdate={fetchEmployees} />
    </div>
  );
};

export default Employees;
