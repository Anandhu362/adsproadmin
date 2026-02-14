import { useState, useEffect, useRef } from "react";
import { 
  User, 
  LogIn, 
  LogOut, 
  CheckCircle2, 
  Loader2,
  Navigation,
  AlertCircle,
  ChevronDown,
  Check
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Employee {
  _id: string;
  name: string;
  position?: string;
}

export default function MarkAttendance() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Custom Dropdown State
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Checkout State
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [remark, setRemark] = useState("");

  useEffect(() => {
    fetchEmployees();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await api.get('/employees');
      setEmployees(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error(error);
      toast({ title: "Connection Error", description: "Failed to load employee list. Check your network.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!selectedEmpId) return;
    setSubmitting(true);
    try {
      const response = await api.post('/attendance/check-in', {
        employeeId: selectedEmpId,
        timestamp: new Date().toISOString()
      });
      
      // FIX: Check if the server skipped the request because user is already checked in
      const result = response.results?.[0];

      if (result?.status === "skipped") {
        toast({
          title: "Already Checked In",
          description: "You are already marked as present.",
          variant: "destructive" // Shows red warning
        });
        // We do NOT clear the selected ID so they can correct it if needed
        return; 
      }
      
      // Success Case
      toast({
        title: "Checked In!",
        description: `Successfully marked at ${new Date().toLocaleTimeString()}`,
        className: "bg-green-50 border-green-200 text-green-800"
      });
      setSelectedEmpId(""); 
    } catch (error: any) {
      toast({ 
        title: "Check-in Failed", 
        description: error.message || "Could not save check-in.", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!selectedEmpId) return;
    setShowCheckoutForm(true);
  };

  const submitCheckOut = async () => {
    if (!remark.trim()) return;
    setSubmitting(true);
    try {
      const response = await api.post('/attendance/check-out', {
        employeeId: selectedEmpId,
        timestamp: new Date().toISOString(),
        remark: remark
      });

      // FIX: Also check if checkout was skipped (e.g., if they were never checked in)
      const result = response.results?.[0];
      if (result?.status === "skipped") {
        toast({
          title: "Action Failed",
          description: "You have not checked in today.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Checked Out",
        description: "Have a good day!",
        className: "bg-orange-50 border-orange-200 text-orange-800"
      });
      
      setShowCheckoutForm(false);
      setRemark("");
      setSelectedEmpId("");
    } catch (error: any) {
      toast({ 
        title: "Check-out Failed", 
        description: error.message || "Could not save check-out.", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedEmployeeName = employees.find(e => e._id === selectedEmpId)?.name || "Select your name";

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-sm text-slate-400 font-medium">Loading staff directory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-10">
      
      {/* Mobile Header */}
      <div className="bg-white p-6 shadow-sm border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Attendance</h1>
            <p className="text-xs text-slate-500 font-medium">Mark your daily status</p>
          </div>
        </div>
      </div>

      <main className="p-5 space-y-6 max-w-md mx-auto mt-4">
        
        {/* DROPDOWN SECTION */}
        <div className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 space-y-3 z-20 relative">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
            Who are you?
          </label>
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full h-14 pl-4 pr-4 rounded-xl border flex items-center justify-between transition-all duration-200 ${
                isDropdownOpen 
                  ? "bg-blue-50/50 border-blue-500 ring-4 ring-blue-500/10" 
                  : "bg-slate-50 border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${selectedEmpId ? "bg-blue-100 text-blue-600" : "bg-slate-200 text-slate-400"}`}>
                  <User className="h-4 w-4" />
                </div>
                <span className={`font-bold text-sm ${selectedEmpId ? "text-slate-900" : "text-slate-400"}`}>
                  {selectedEmployeeName}
                </span>
              </div>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-blue-500" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-[300px] overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100 scrollbar-thin">
                <div className="p-2 space-y-1">
                  {employees.length === 0 ? (
                    <div className="p-4 text-center text-sm text-slate-400">No employees found</div>
                  ) : (
                    employees.map((emp) => (
                      <button
                        key={emp._id}
                        onClick={() => {
                          setSelectedEmpId(emp._id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-lg text-sm font-bold transition-colors ${
                          selectedEmpId === emp._id 
                            ? "bg-blue-50 text-blue-700" 
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            selectedEmpId === emp._id ? "bg-blue-200 text-blue-700" : "bg-slate-100 text-slate-500"
                          }`}>
                            {emp.name.charAt(0)}
                          </div>
                          <span>{emp.name}</span>
                        </div>
                        {selectedEmpId === emp._id && <Check className="h-4 w-4 text-blue-600" />}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-4 z-0">
          <button
            onClick={handleCheckIn}
            disabled={!selectedEmpId || submitting}
            className="group relative overflow-hidden w-full h-24 bg-white hover:bg-green-50 border-2 border-green-100 hover:border-green-500 rounded-[24px] transition-all duration-300 flex items-center justify-between px-6 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold text-slate-900 group-hover:text-green-700">Check In</span>
              <span className="text-xs text-slate-500 font-medium mt-1">Start your day</span>
            </div>
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
              <LogIn className="h-6 w-6" />
            </div>
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!selectedEmpId || submitting}
            className="group relative overflow-hidden w-full h-24 bg-white hover:bg-orange-50 border-2 border-orange-100 hover:border-orange-500 rounded-[24px] transition-all duration-300 flex items-center justify-between px-6 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold text-slate-900 group-hover:text-orange-700">Check Out</span>
              <span className="text-xs text-slate-500 font-medium mt-1">End shift / Break</span>
            </div>
            <div className="h-12 w-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <LogOut className="h-6 w-6 pl-1" />
            </div>
          </button>
        </div>

        <div className="bg-blue-50/50 border border-blue-100 rounded-[20px] p-4 flex gap-3">
          <Navigation className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            Remember to check out when leaving the premises for client visits or ending your shift. Location services are active.
          </p>
        </div>

      </main>

      {/* Checkout Modal */}
      {showCheckoutForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md sm:rounded-[24px] rounded-t-[24px] p-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Check Out</h3>
                <p className="text-xs text-slate-500">Adding a remark is required</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Where are you going?</label>
                <textarea
                  autoFocus
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  placeholder="e.g., Client visit, Home, Lunch break..."
                  className="w-full h-32 p-4 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none text-sm font-medium"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowCheckoutForm(false)}
                  className="flex-1 h-12 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitCheckOut}
                  disabled={submitting || !remark.trim()}
                  className="flex-1 h-12 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}