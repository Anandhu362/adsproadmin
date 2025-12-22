import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
import { Download, Calendar, Filter, Loader2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import XLSX from "xlsx-js-style"; 
import { apiFetch } from "@/lib/api"; // Updated: Use centralized API utility

const Reports = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("All Employees");

  const fetchReports = async () => {
    try {
      // Logic: Centralized apiFetch replaces raw fetch and localStorage
      // This automatically handles the Base URL and Auth headers
      const data = await apiFetch("/reports/tasks");
      setTasks(data);
    } catch (error: any) {
      toast({ 
        title: "Sync Error", 
        description: error.message || "Failed to load report data.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const filteredData = tasks.filter((item) => {
    const employeeName = item.employeeId?.name || "Unassigned";
    const matchesEmployee = selectedEmployee === "All Employees" || employeeName === selectedEmployee;
    const taskDate = new Date(item.assignedDate);
    const matchesStartDate = !startDate || taskDate >= new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setHours(23, 59, 59, 999);
    const matchesEndDate = !end || taskDate <= end;
    return matchesEmployee && matchesStartDate && matchesEndDate;
  });

  const uniqueEmployees = ["All Employees", ...new Set(tasks.map(t => t.employeeId?.name).filter(Boolean))];

  const handleExport = () => {
    if (filteredData.length === 0) {
      toast({ title: "No data", description: "No records found for export.", variant: "destructive" });
      return;
    }

    const groupedData: { [key: string]: string[] } = {};
    filteredData.forEach((task) => {
      const empName = (task.employeeId?.name || "Unassigned").toUpperCase();
      if (!groupedData[empName]) groupedData[empName] = [];
      const taskDetail = `${task.clientName} ${task.taskType === "Custom Page" ? `${task.customPageDetails}` : task.taskType}`;
      groupedData[empName].push(taskDetail.toUpperCase());
    });

    const employees = Object.keys(groupedData);
    const maxTasks = Math.max(...Object.values(groupedData).map(t => t.length));

    const headerStyle = {
      fill: { fgColor: { rgb: "C5E0B4" } },
      font: { bold: true, sz: 12, color: { rgb: "000000" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };

    const worksSidebarStyle = {
      fill: { fgColor: { rgb: "FF0000" } },
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14, italic: true },
      alignment: { horizontal: "center", vertical: "center" },
      border: { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
    };

    const contentStyle = {
      font: { sz: 10, italic: true, bold: true },
      alignment: { horizontal: "left" },
      border: { bottom: { style: "thin" }, right: { style: "thin" } }
    };

    const dataWithStyle = [];
    const headerRow = [
      { v: "", s: { border: { right: { style: "thin" }, bottom: { style: "thin" } } } },
      ...employees.map(emp => ({ v: emp, s: headerStyle }))
    ];
    dataWithStyle.push(headerRow);

    for (let i = 0; i < maxTasks; i++) {
      const row = [];
      row.push({ v: i === 0 ? "WORKS" : "", s: worksSidebarStyle });
      employees.forEach((emp) => {
        row.push({ v: groupedData[emp][i] || "", s: contentStyle });
      });
      dataWithStyle.push(row);
    }

    const ws = XLSX.utils.aoa_to_sheet(dataWithStyle);
    ws["!merges"] = [{ s: { r: 1, c: 0 }, e: { r: maxTasks, c: 0 } }];
    ws['!cols'] = [{ wch: 15 }, ...employees.map(() => ({ wch: 30 }))];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Task Analysis");
    XLSX.writeFile(wb, `Work_Report_${new Date().toISOString().split('T')[0]}.xlsx`);

    toast({ title: "Excel Created", description: "Report exported successfully." });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      <p className="text-slate-500 font-medium">Loading reports...</p>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-4">
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">Generate Report</CardTitle>
              <p className="text-xs text-slate-500 font-medium">Filter assignments and export to Excel</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label className="uppercase text-[11px] font-bold text-slate-600 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> From Date
              </Label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="h-10 font-bold border-slate-300 text-slate-900 bg-white placeholder:text-slate-400 focus:border-slate-900" 
              />
            </div>

            <div className="space-y-2">
              <Label className="uppercase text-[11px] font-bold text-slate-600 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> To Date
              </Label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="h-10 font-bold border-slate-300 text-slate-900 bg-white placeholder:text-slate-400 focus:border-slate-900" 
              />
            </div>

            <div className="space-y-2">
              <Label className="uppercase text-[11px] font-bold text-slate-600 flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" /> Employee
              </Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="h-10 font-bold border-slate-300 text-slate-900 bg-white">
                  <SelectValue placeholder="All Employees" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 shadow-md">
                  {uniqueEmployees.map(emp => (
                    <SelectItem key={emp} value={emp} className="font-bold text-slate-900 focus:bg-slate-100">
                      {emp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleExport} className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-md">
                <Download className="mr-2 h-4 w-4" /> Export to Excel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-xl overflow-hidden bg-white">
        <CardHeader className="bg-white border-b border-slate-100 py-5">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md font-bold text-slate-900">Report Preview</CardTitle>
            <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold border-slate-200 px-3 py-1">
              {filteredData.length} records found
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                  <TableHead className="font-bold text-slate-900 py-4 px-6">Employee</TableHead>
                  <TableHead className="font-bold text-slate-900 py-4 px-6">Client</TableHead>
                  <TableHead className="font-bold text-slate-900 py-4 px-6">Work Type</TableHead>
                  <TableHead className="font-bold text-slate-900 py-4 px-6 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableRow key={item._id} className="hover:bg-slate-50 transition-colors border-slate-100">
                      <TableCell className="font-bold text-slate-900 py-4 px-6">
                        {item.employeeId?.name || "Unassigned"}
                      </TableCell>
                      <TableCell className="font-semibold text-slate-600 py-4 px-6">
                        {item.clientName}
                      </TableCell>
                      <TableCell className="italic font-bold text-slate-700 py-4 px-6">
                        {item.taskType === "Custom Page" ? item.customPageDetails : item.taskType}
                      </TableCell>
                      <TableCell className="text-right py-4 px-6">
                        <Badge className={`font-bold px-3 py-1 rounded-md border shadow-sm ${
                          item.status === "Approved" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-slate-400 italic font-medium">
                      No matching records found for the selected filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
