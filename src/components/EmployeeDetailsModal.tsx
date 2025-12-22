import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, Edit3, Save, X, Briefcase, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api"; // Updated: Use centralized API utility

interface Props {
  employee: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const EmployeeDetailsModal = ({ employee, isOpen, onClose, onUpdate }: Props) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ phone: "", role: "", status: "Active" });

  useEffect(() => {
    if (employee) {
      setFormData({
        phone: employee.phone || "",
        role: employee.role || "Designer",
        status: employee.status || "Active"
      });
    }
  }, [employee]);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Logic: Centralized apiFetch automatically handles Base URL and Session Storage token
      await apiFetch(`/employees/${employee._id}`, {
        method: "PATCH",
        body: JSON.stringify(formData)
      });

      toast({ 
        title: "Profile Synced", 
        description: "Employee details have been updated in the cloud database." 
      });
      
      setIsEditing(false);
      onUpdate(); // Refresh the parent list
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not save changes to the VM.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-slate-200 sm:max-w-[480px] p-0 overflow-hidden shadow-2xl">
        {/* Header Section */}
        <div className="bg-slate-900 p-8 text-white relative">
          <div className="flex gap-6 items-center">
            <div className="h-20 w-20 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-black border border-white/20">
              {employee.name.charAt(0)}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-black tracking-tight">{employee.name}</DialogTitle>
              <p className="text-slate-400 font-bold mt-1 uppercase text-xs tracking-wider">{formData.role}</p>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsEditing(!isEditing)} 
              className="text-white hover:bg-white/10"
            >
              {isEditing ? <X className="h-5 w-5" /> : <Edit3 className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {!isEditing ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <Mail className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Email Address</p>
                    <p className="font-bold text-slate-900">{employee.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Contact</p>
                    <p className="font-bold text-slate-900">{formData.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <ShieldCheck className="h-5 w-5 text-slate-400" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Status</p>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full border mt-1 inline-block ${
                      formData.status === 'Active' 
                      ? 'bg-green-100 text-green-700 border-green-200' 
                      : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {formData.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="bg-green-50/50 p-4 rounded-xl text-center border border-green-100">
                  <p className="text-3xl font-black text-green-700">{employee.tasksCompleted}</p>
                  <p className="text-xs font-bold text-green-600 uppercase">Completed</p>
                </div>
                <div className="bg-amber-50/50 p-4 rounded-xl text-center border border-amber-100">
                  <p className="text-3xl font-black text-amber-700">{employee.tasksPending}</p>
                  <p className="text-xs font-bold text-amber-600 uppercase">Pending</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-2">
                <Label className="font-black text-slate-700 text-xs uppercase tracking-widest">Phone Number</Label>
                <Input 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  className="h-12 border-slate-300 font-bold text-slate-900 bg-white focus:ring-slate-900" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-700 text-xs uppercase tracking-widest">Job Role</Label>
                <Input 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})} 
                  className="h-12 border-slate-300 font-bold text-slate-900 bg-white focus:ring-slate-900" 
                />
              </div>
              <div className="space-y-2">
                <Label className="font-black text-slate-700 text-xs uppercase tracking-widest">Availability Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger className="h-12 border-slate-300 font-bold text-slate-900 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Active" className="font-bold">Active (Available for Tasks)</SelectItem>
                    <SelectItem value="Non-active" className="font-bold">Non-active (Hidden from Assignment)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleSave} 
                className="w-full bg-slate-900 text-white font-black h-12 text-lg mt-4 transition-all" 
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save className="mr-2 h-5 w-5" /> Sync Profile</>}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeDetailsModal;
