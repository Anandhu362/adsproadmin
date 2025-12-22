import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Pencil, Trash2, Loader2, 
  AlertTriangle, Edit3, RefreshCcw, CheckCircle2 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api"; // Updated: Use centralized API utility

const taskPageOptions = ["Full Page", "Half Page", "Custom Page"];
const statusWorkflow = ["Assigned", "Progress", "Correction", "Approved"];

const AssignedTasks = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  
  const [editFormData, setEditFormData] = useState({ id: "", taskType: "", customPageDetails: "" });
  const [statusFormData, setStatusFormData] = useState({ id: "", status: "" });

  const fetchTasks = async () => {
    try {
      // Logic: Centralized apiFetch replaces raw fetch and localStorage
      const data = await apiFetch("/tasks");
      setTasks(data);
    } catch (error: any) {
      toast({ title: "Sync Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const initiateDelete = (task: any) => {
    if (task.status !== "Assigned") {
      toast({ 
        title: "Action Restricted", 
        description: "Only tasks with 'Assigned' status can be deleted.",
        variant: "destructive" 
      });
      return;
    }
    setTaskToDelete(task._id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      // Logic: Centralized DELETE call
      await apiFetch(`/tasks/${taskToDelete}`, { method: "DELETE" });
      
      setTasks(tasks.filter((t) => t._id !== taskToDelete));
      toast({ title: "Task Deleted", description: "Successfully removed from the system." });
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to delete task.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setTaskToDelete(null);
    }
  };

  const initiateStatusUpdate = (task: any) => {
    setStatusFormData({ id: task._id, status: task.status });
    setIsStatusDialogOpen(true);
  };

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      // Logic: Centralized PATCH call
      const updated = await apiFetch(`/tasks/${statusFormData.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: statusFormData.status })
      });

      setTasks(tasks.map(t => t._id === updated._id ? updated : t));
      toast({ title: "Status Updated" });
      setIsStatusDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const initiateEdit = (task: any) => {
    setEditFormData({ id: task._id, taskType: task.taskType, customPageDetails: task.customPageDetails || "" });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Logic: Centralized PATCH update for task details
      const updated = await apiFetch(`/tasks/${editFormData.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          taskType: editFormData.taskType,
          customPageDetails: editFormData.taskType === "Custom Page" ? editFormData.customPageDetails : ""
        })
      });
      
      setTasks(tasks.map(t => t._id === updated._id ? updated : t));
      toast({ title: "Task Updated" });
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally { setIsUpdating(false); }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-800 border-green-300";
      case "Progress": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Correction": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-slate-900 h-10 w-10" /></div>;

  return (
    <div className="space-y-6">
      <Card className="bg-white border-slate-200 shadow-lg">
        <CardHeader className="border-b border-slate-100">
          <CardTitle className="text-xl font-bold text-slate-900">Live Assigned Tasks</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="font-bold text-slate-900">Employee</TableHead>
                <TableHead className="font-bold text-slate-900">Category</TableHead>
                <TableHead className="font-bold text-slate-900">Client</TableHead>
                <TableHead className="font-bold text-slate-900">Task Type</TableHead>
                <TableHead className="font-bold text-slate-900">Status</TableHead>
                <TableHead className="text-right pr-6 font-bold text-slate-900">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task._id} className="border-b border-slate-100">
                  <TableCell className="font-bold text-slate-900">{task.employeeId?.name || "N/A"}</TableCell>
                  <TableCell className="text-slate-700 font-medium">{task.category}</TableCell>
                  <TableCell className="text-slate-700 font-medium">{task.clientName}</TableCell>
                  <TableCell className="text-slate-700 font-medium italic">
                    {task.taskType === "Custom Page" ? `Custom (${task.customPageDetails})` : task.taskType}
                  </TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-black px-3 py-1 rounded-full border uppercase tracking-tighter shadow-sm ${getStatusStyles(task.status)}`}>
                      {task.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-4">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => initiateStatusUpdate(task)}>
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400 hover:text-slate-900 hover:bg-slate-100" onClick={() => initiateEdit(task)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-9 w-9 ${task.status === "Assigned" ? "text-slate-400 hover:text-red-600 hover:bg-red-50" : "text-slate-200 cursor-not-allowed"}`} 
                        disabled={task.status !== "Assigned"}
                        onClick={() => initiateDelete(task)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border-slate-200 sm:max-w-[400px] shadow-2xl">
          <DialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100 shadow-sm">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl font-black text-slate-900">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-bold px-4">
              Are you sure you want to remove this task? This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-center gap-3 pt-6 pb-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="flex-1 border-slate-200 font-bold text-slate-700" disabled={isDeleting}>Cancel</Button>
            <Button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black shadow-lg" disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Delete Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="bg-white border-slate-200 sm:max-w-[400px] shadow-2xl">
          <DialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-2 border border-green-100"><CheckCircle2 className="h-7 w-7 text-green-600" /></div>
            <DialogTitle className="text-center text-xl font-black text-slate-900">Update Task Status</DialogTitle>
          </DialogHeader>
          <div className="py-6 px-2">
            <Label className="text-slate-900 font-black text-xs uppercase mb-3 block tracking-widest">Select Current Workflow Stage</Label>
            <Select value={statusFormData.status} onValueChange={(v) => setStatusFormData({...statusFormData, status: v})}>
              <SelectTrigger className="bg-white border-slate-300 text-slate-900 h-12 font-bold focus:ring-slate-900"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white">{statusWorkflow.map(s => <SelectItem key={s} value={s} className="font-bold text-slate-900">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <DialogFooter className="flex flex-row justify-center gap-3">
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} className="flex-1 border-slate-200 font-bold" disabled={isUpdating}>Cancel</Button>
            <Button onClick={handleStatusUpdate} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black shadow-lg" disabled={isUpdating}>Update Stage</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white border-slate-200 sm:max-w-[450px] shadow-2xl">
          <DialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mb-2 border border-blue-100"><Edit3 className="h-7 w-7 text-blue-600" /></div>
            <DialogTitle className="text-center text-xl font-black text-slate-900">Edit Task Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-6 px-2">
            <div className="space-y-2">
              <Label className="text-slate-900 font-black text-xs uppercase tracking-widest">Task Page Type</Label>
              <Select value={editFormData.taskType} onValueChange={(v) => setEditFormData({...editFormData, taskType: v})}>
                <SelectTrigger className="bg-white border-slate-300 text-slate-900 h-12 font-bold focus:ring-slate-900"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">{taskPageOptions.map(opt => <SelectItem key={opt} value={opt} className="font-bold text-slate-900">{opt}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {editFormData.taskType === "Custom Page" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <Label className="text-slate-900 font-black text-xs uppercase tracking-widest">Page Number / Details</Label>
                <Input className="bg-white border-slate-300 text-slate-900 h-12 font-bold focus:ring-slate-900" value={editFormData.customPageDetails} onChange={(e) => setEditFormData({...editFormData, customPageDetails: e.target.value})} />
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-row justify-center gap-3">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1 border-slate-200 font-bold" disabled={isUpdating}>Cancel</Button>
            <Button onClick={handleUpdate} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black shadow-lg" disabled={isUpdating}>Confirm Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignedTasks;
