import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileSpreadsheet } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx-js-style"; // CRITICAL: Use xlsx-js-style for color support

interface Props {
  startDate?: string;
  endDate?: string;
}

const AttendanceDownloadBtn = ({ startDate, endDate }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Formats UTC timestamps to readable local time
  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', minute: '2-digit', hour12: true 
    });
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      // 1. Fetch filtered data from backend
      let queryPath = "/attendance/report";
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (params.toString()) queryPath += `?${params.toString()}`;

      const rawData = await apiFetch(queryPath);

      if (!rawData || rawData.length === 0) {
        toast({ title: "No Data", description: "No records found for the selected range.", variant: "destructive" });
        setLoading(false);
        return;
      }

      // 2. Data Transformation (Vertical Matrix Layout)
      const uniqueDates = [...new Set(rawData.map((r: any) => r.date))];
      const employeeMap = new Map(); 
      rawData.forEach((r: any) => {
        if (r.employeeId && !employeeMap.has(r.employeeId._id)) {
          employeeMap.set(r.employeeId._id, r.employeeId.name);
        }
      });

      const employeeIds = Array.from(employeeMap.keys());
      const employeeNames = Array.from(employeeMap.values());

      const headerRow = ["Date", ...employeeNames];
      const matrixData: any[][] = [headerRow];

      uniqueDates.forEach(date => {
        const dailyEntriesMap = new Map<string, string[]>();
        employeeIds.forEach(id => dailyEntriesMap.set(id, []));

        // Group IN/OUT logs vertically per employee
        rawData.filter((r: any) => r.date === date).forEach((r: any) => {
          const empId = r.employeeId._id;
          const entries = dailyEntriesMap.get(empId) || [];
          if (r.checkIn) entries.push(`IN: ${formatTime(r.checkIn)}`);
          if (r.checkOut) entries.push(`OUT: ${formatTime(r.checkOut)}`);
          dailyEntriesMap.set(empId, entries);
        });

        let maxRowsForDate = 0;
        dailyEntriesMap.forEach(entries => {
          maxRowsForDate = Math.max(maxRowsForDate, entries.length);
        });

        for (let i = 0; i < maxRowsForDate; i++) {
          const row: any[] = [];
          row.push(i === 0 ? date : ""); // Only show date on the first row of that group
          employeeIds.forEach(empId => {
            const entries = dailyEntriesMap.get(empId);
            row.push(entries && entries[i] ? entries[i] : "");
          });
          matrixData.push(row);
        }
        matrixData.push(Array(headerRow.length).fill("")); // Row spacer
      });

      // 3. Apply Styles (Color Logic)
      const ws = XLSX.utils.aoa_to_sheet(matrixData);
      const range = XLSX.utils.decode_range(ws['!ref']!);

      for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
          const address = XLSX.utils.encode_cell({ r: R, c: C });
          if (!ws[address]) continue;

          const value = String(ws[address].v);

          // Navy Blue Header (AdsPro Theme)
          if (R === 0) {
            ws[address].s = {
              font: { bold: true, color: { rgb: "FFFFFF" }, sz: 12 },
              fill: { fgColor: { rgb: "0F172A" } },
              alignment: { horizontal: "center", vertical: "center" },
              border: { bottom: { style: "medium", color: { rgb: "000000" } } }
            };
          } 
          // Light Gray Date Column Highlight
          else if (C === 0 && value !== "") {
            ws[address].s = {
              font: { bold: true, color: { rgb: "1E293B" } },
              fill: { fgColor: { rgb: "F1F5F9" } },
              border: { right: { style: "thin", color: { rgb: "CBD5E1" } } }
            };
          } 
          // Green Text for Check-In
          else if (value.startsWith("IN:")) {
            ws[address].s = {
              font: { color: { rgb: "15803D" }, bold: true },
              fill: { fgColor: { rgb: "DCFCE7" } },
              alignment: { horizontal: "left" }
            };
          } 
          // Red Text for Check-Out
          else if (value.startsWith("OUT:")) {
            ws[address].s = {
              font: { color: { rgb: "B91C1C" }, bold: true },
              fill: { fgColor: { rgb: "FEE2E2" } },
              alignment: { horizontal: "left" }
            };
          }
        }
      }

      // 4. Finalize Excel File
      const wscols = [{ wch: 18 }]; 
      employeeNames.forEach(() => wscols.push({ wch: 25 }));
      ws['!cols'] = wscols;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Attendance Report");
      
      const fileName = `AdsPro_Attendance_${startDate || 'Report'}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast({ title: "Success", description: "Colored matrix report generated." });
    } catch (error: any) {
      toast({ title: "Export Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleDownload} 
      variant="outline" 
      className="bg-white hover:bg-slate-50 text-slate-700 font-bold h-12 border-slate-200 shadow-sm transition-all"
      disabled={loading}
    >
      {loading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <FileSpreadsheet className="mr-2 h-5 w-5 text-green-600" />}
      Export Excel
    </Button>
  );
};

export default AttendanceDownloadBtn;