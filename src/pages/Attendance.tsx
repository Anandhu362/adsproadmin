import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  LogIn, 
  LogOut, 
  Loader2, 
  Users, 
  CalendarDays, 
  Search, 
  FilterX 
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import AttendanceDownloadBtn from "@/components/AttendanceDownloadBtn";

const Attendance = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchStatus = async () => {
    try {
      const data = await apiFetch("/attendance/status");
      setEmployees(data);
    } catch (error: any) {
      toast({ title: "Sync Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAction = async (type: "check-in" | "check-out") => {
    if (selectedIds.length === 0) {
      toast({ title: "No Selection", description: "Please select employees from the list." });
      return;
    }

    setProcessing(true);
    try {
      const response = await apiFetch(`/attendance/${type}`, {
        method: "POST",
        body: JSON.stringify({ employeeIds: selectedIds })
      });

      const successCount = response.results.filter((r: any) => r.status === "success" || r.status === "updated").length;
      const skipCount = response.results.filter((r: any) => r.status === "skipped").length;

      toast({ 
        title: "Action Processed", 
        description: `Successfully ${type} ${successCount} staff. ${skipCount > 0 ? `${skipCount} status conflicts skipped.` : ""}` 
      });
      
      setSelectedIds([]);
      fetchStatus();
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesDate = true;
      if (startDate || endDate) {
        const logDate = emp.lastTime ? new Date(emp.lastTime).toISOString().split('T')[0] : "";
        if (startDate && logDate < startDate) matchesDate = false;
        if (endDate && logDate > endDate) matchesDate = false;
      }
      return matchesSearch && matchesDate;
    });
  }, [employees, searchTerm, startDate, endDate]);

  const clearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-10 w-10 text-slate-900" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Daily Attendance</h1>
          <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <AttendanceDownloadBtn startDate={startDate} endDate={endDate} />
          
          <Button 
            onClick={() => handleAction("check-in")} 
            className="bg-green-600 hover:bg-green-700 text-white font-black h-12 px-6 shadow-lg"
            disabled={processing}
          >
            {processing ? <Loader2 className="animate-spin h-5 w-5" /> : <LogIn className="mr-2 h-5 w-5" />}
            Check-In
          </Button>
          <Button 
            onClick={() => handleAction("check-out")} 
            className="bg-red-600 hover:bg-red-700 text-white font-black h-12 px-6 shadow-lg"
            disabled={processing}
          >
            {processing ? <Loader2 className="animate-spin h-5 w-5" /> : <LogOut className="mr-2 h-5 w-5" />}
            Check-Out
          </Button>
        </div>
      </div>

      <Card className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Start Date</Label>
              {/* FIX: Added text-slate-900 and bg-white for visibility */}
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="font-bold border-slate-200 h-10 text-slate-900 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">End Date</Label>
              {/* FIX: Added text-slate-900 and bg-white for visibility */}
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="font-bold border-slate-200 h-10 text-slate-900 bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Search Staff</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                {/* FIX: Added text-slate-900, placeholder:text-slate-400 and bg-white */}
                <Input 
                  placeholder="Employee name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 font-bold border-slate-200 h-10 text-slate-900 bg-white placeholder:text-slate-400"
                />
              </div>
            </div>
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="text-slate-500 font-bold h-10 hover:text-red-600 hover:bg-red-50"
            >
              <FilterX className="mr-2 h-4 w-4" /> Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-slate-200 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4 px-6">
          <CardTitle className="text-lg font-black flex items-center gap-2">
            <Users className="h-5 w-5" /> Staff Directory ({filteredEmployees.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-5 w-16 text-center">
                    <Checkbox 
                      checked={selectedIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onCheckedChange={(checked) => setSelectedIds(checked ? filteredEmployees.map(e => e._id) : [])}
                    />
                  </th>
                  <th className="p-5 font-black text-slate-900 uppercase text-[10px] tracking-widest">Employee Name</th>
                  <th className="p-5 font-black text-slate-900 uppercase text-[10px] tracking-widest">Current Status</th>
                  <th className="p-5 font-black text-slate-900 uppercase text-[10px] tracking-widest text-right">Last Log</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 text-center">
                      <Checkbox 
                        checked={selectedIds.includes(emp._id)} 
                        onCheckedChange={() => toggleSelect(emp._id)}
                      />
                    </td>
                    <td className="p-5 font-bold text-slate-900">{emp.name}</td>
                    <td className="p-5">
                      <Badge className={`font-black uppercase text-[9px] px-3 py-1 rounded-full border ${
                        emp.attendanceStatus === 'Checked-In' 
                        ? 'bg-green-50 text-green-700 border-green-200' 
                        : 'bg-slate-100 text-slate-400 border-slate-200'
                      }`}>
                        {emp.attendanceStatus || "Checked-Out"}
                      </Badge>
                    </td>
                    <td className="p-5 text-xs font-black text-slate-400 text-right uppercase tracking-tighter">
                      {emp.lastTime ? new Date(emp.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "--:--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;