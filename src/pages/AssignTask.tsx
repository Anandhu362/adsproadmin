import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ClipboardPlus, Save, Loader2 } from "lucide-react";

const workCategories = ["Flyer Design", "Poster Design", "Video Creation", "Web Development", "Branding"];
const taskPageOptions = ["Full Page", "Half Page", "Custom Page"];

const AssignTask = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<any[]>([]);
  const [allClients, setAllClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);

  const [formData, setFormData] = useState({
    employeeId: "",
    category: "",
    clientName: "",
    taskType: "",
    customPageDetails: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [empRes, clientRes] = await Promise.all([
          fetch("/api/employees", { headers: { "Authorization": `Bearer ${token}` } }),
          fetch("/api/clients", { headers: { "Authorization": `Bearer ${token}` } })
        ]);

        if (!empRes.ok || !clientRes.ok) throw new Error("Connection failed");

        const allEmployees = await empRes.json();
        const allClientsData = await clientRes.json();
        const activeEmployees = allEmployees.filter((emp: any) => emp.status === "Active");

        setEmployees(activeEmployees);
        setAllClients(allClientsData);
      } catch (err) {
        toast({ title: "Sync Error", description: "Failed to load active employees.", variant: "destructive" });
      } finally {
        setFetchingData(false);
      }
    };
    loadData();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Logic: Required fields change based on category
    const isFlyer = formData.category === "Flyer Design";
    if (!formData.employeeId || !formData.category || !formData.clientName || (isFlyer && !formData.taskType)) {
      toast({ title: "Required", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          ...formData,
          // If not a flyer, we send an empty string or default for taskType
          taskType: isFlyer ? formData.taskType : "Standard",
          status: "Assigned" 
        }),
      });

      if (res.ok) {
        toast({ title: "Task Assigned Successfully!" });
        setFormData({ 
          employeeId: "", 
          category: formData.category, 
          clientName: "", 
          taskType: "", 
          customPageDetails: "" 
        });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to assign task.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl p-4">
      <Card className="bg-white border-slate-200 shadow-lg">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg">
              <ClipboardPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">New Task Assignment</CardTitle>
              <p className="text-sm text-slate-500 font-medium tracking-tight">Assign work to your active employees</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Employee Name *</Label>
              <Select value={formData.employeeId} onValueChange={(v) => setFormData({...formData, employeeId: v})}>
                <SelectTrigger className="bg-white border-slate-300 text-slate-900 h-12 shadow-sm font-bold">
                  <SelectValue placeholder={fetchingData ? "Syncing..." : "Select employee"} />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {employees.map((emp) => (
                    <SelectItem key={emp._id} value={emp._id} className="text-slate-900 font-bold">
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Work Category */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Work Category *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v, taskType: ""})}>
                <SelectTrigger className="bg-white border-slate-300 text-slate-900 h-12 shadow-sm font-bold">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {workCategories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-slate-900 font-bold">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Client Name */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-bold">Client Name *</Label>
              <Select value={formData.clientName} onValueChange={(v) => setFormData({...formData, clientName: v})}>
                <SelectTrigger className="bg-white border-slate-300 text-slate-900 h-12 shadow-sm font-bold">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-[300px] overflow-y-auto">
                  {allClients.map((c) => (
                    <SelectItem key={c._id} value={c.name} className="text-slate-900 font-bold">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* INTEGRATED UPDATION: Only show Page Type if "Flyer Design" is selected */}
            {formData.category === "Flyer Design" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-slate-700 font-bold">Task Page Type *</Label>
                <Select value={formData.taskType} onValueChange={(v) => setFormData({...formData, taskType: v})}>
                  <SelectTrigger className="bg-white border-slate-300 text-slate-900 h-12 shadow-sm font-bold">
                    <SelectValue placeholder="Select page type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {taskPageOptions.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-slate-900 font-bold">{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Custom Details Input - Only shows if Flyer + Custom Page is selected */}
            {formData.category === "Flyer Design" && formData.taskType === "Custom Page" && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label className="text-slate-700 font-bold">Page Number / Details *</Label>
                <Input 
                  className="bg-white border-slate-300 text-slate-900 h-12 font-bold focus:ring-slate-900 shadow-sm" 
                  placeholder="e.g., Pages 4, 6" 
                  value={formData.customPageDetails} 
                  onChange={(e) => setFormData({...formData, customPageDetails: e.target.value})} 
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black h-12 text-lg transition-all" 
              disabled={loading || fetchingData}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              Assign Task
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignTask;