import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { UserPlus, Save, Loader2, Mail, Phone, User, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api"; // FIX: Importing the default 'api' object

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddEmployeeModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "Senior Designer",
    password: "Password@123" // FIX: Backend requires a password to create a user
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast({ title: "Required", description: "Name and Email are mandatory.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // FIX: Using api.post ensures headers are set correctly
      await api.post("/employees", {
        ...formData,
        status: "Active"
      });

      toast({ 
        title: "Employee Added", 
        description: `${formData.name} registered. Default pass: Password@123`,
        className: "bg-green-50 border-green-200 text-green-800"
      });
      
      // Reset form
      setFormData({ name: "", email: "", phone: "", role: "Senior Designer", password: "Password@123" });
      onSuccess(); 
      onClose();   
    } catch (error: any) {
      console.error("Add Employee Error:", error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to add employee. Check server logs.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border-slate-200 sm:max-w-[450px] shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="bg-slate-900 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold">Register Employee</DialogTitle>
              <DialogDescription className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">
                Create a new profile in the directory
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Field */}
          <div className="space-y-2">
            <Label className="font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-2">
              <User className="h-3.5 w-3.5" /> Employee Name *
            </Label>
            <Input 
              className="h-12 border-slate-300 font-bold text-slate-900 bg-white focus:ring-slate-900" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label className="font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" /> Email ID *
            </Label>
            <Input 
              type="email"
              className="h-12 border-slate-300 font-bold text-slate-900 bg-white focus:ring-slate-900" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <Label className="font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-2">
              <Briefcase className="h-3.5 w-3.5" /> Role / Position
            </Label>
            <Input 
              className="h-12 border-slate-300 font-bold text-slate-900 bg-white focus:ring-slate-900" 
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label className="font-black text-slate-700 text-xs uppercase tracking-widest flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" /> Contact Number
            </Label>
            <Input 
              className="h-12 border-slate-300 font-bold text-slate-900 bg-white focus:ring-slate-900" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <Button type="submit" className="w-full bg-slate-900 text-white font-black h-12 text-lg shadow-lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <><Save className="mr-2 h-5 w-5" /> Save Employee</>}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddEmployeeModal;
