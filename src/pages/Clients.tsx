import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // NEW: Imports for custom dialog
import { Pencil, Trash2, Loader2, Users2, UserPlus, Save, X, AlertTriangle } from "lucide-react";
import { apiFetch } from "@/lib/api"; 
import { useToast } from "@/hooks/use-toast";

const categories = ["Flyer Design", "Poster Design", "Video Creation", "Web Development"];

const Clients = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false); // NEW: State for delete loading
  
  // NEW: State for handling the custom delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ 
    id: "", 
    name: "", 
    category: "" 
  });

  const fetchClients = async () => {
    try {
      const data = await apiFetch("/clients");
      setClients(data);
    } catch (error: any) {
      toast({ 
        title: "Sync Error", 
        description: error.message || "Failed to load clients.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchClients(); 
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.category) {
      toast({ title: "Required", description: "Please fill all fields.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      if (formData.id) {
        await apiFetch(`/clients/${formData.id}`, { 
          method: "PATCH", 
          body: JSON.stringify({ name: formData.name, category: formData.category }) 
        });
        toast({ title: "Client Updated" });
      } else {
        await apiFetch("/clients", { 
          method: "POST", 
          body: JSON.stringify({ name: formData.name, category: formData.category }) 
        });
        toast({ title: "Client Added" });
      }
      
      setFormData({ id: "", name: "", category: "" });
      fetchClients();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.message || "Operation failed.", 
        variant: "destructive" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (client: any) => {
    setFormData({ 
      id: client._id, 
      name: client.name, 
      category: client.category 
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // NEW: Logic to trigger the custom dialog instead of browser confirm()
  const initiateDelete = (id: string) => {
    setClientToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  // NEW: Logic to handle the actual API call after confirmation
  const confirmDelete = async () => {
    if (!clientToDelete) return;
    
    setIsDeleting(true);
    try {
      await apiFetch(`/clients/${clientToDelete}`, { method: "DELETE" });
      setClients(clients.filter(c => c._id !== clientToDelete));
      toast({ title: "Client Deleted", description: "The record has been removed." });
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setClientToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-slate-900" />
        <p className="text-slate-500 font-bold">Syncing Client Directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Management Form */}
        <Card className="bg-white border-slate-200 shadow-lg h-fit">
          <CardHeader className="bg-slate-900 text-white rounded-t-xl">
            <div className="flex items-center gap-2">
              {formData.id ? <Pencil className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
              <CardTitle className="text-lg font-bold">
                {formData.id ? "Edit Client" : "Register New Client"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Full Business Name *</Label>
                <Input 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g., Al Madina Supermarket" 
                  className="font-bold border-slate-300 h-12 text-slate-900 bg-white placeholder:text-slate-400 focus:ring-slate-900" 
                />
              </div>
              
              <div className="space-y-2">
                <Label className="font-black text-slate-700 uppercase text-[10px] tracking-widest">Service Category *</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger className="font-bold border-slate-300 h-12 text-slate-900 bg-white shadow-sm">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 shadow-xl">
                    {categories.map(c => <SelectItem key={c} value={c} className="font-bold text-slate-900 focus:bg-slate-100">{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black h-12" type="submit" disabled={submitting}>
                  {submitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                  {formData.id ? "Update Info" : "Add to Directory"}
                </Button>
                {formData.id && (
                  <Button variant="outline" className="border-slate-300 font-bold h-12 text-slate-600 hover:bg-slate-50" onClick={() => setFormData({id: "", name: "", category: ""})}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Directory List Card */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between py-5 px-6">
            <CardTitle className="text-xl font-black text-slate-900 flex items-center gap-2 uppercase tracking-tighter">
              <Users2 className="h-6 w-6" /> 
              Client Directory
            </CardTitle>
            <span className="text-[10px] font-black bg-slate-900 px-3 py-1 rounded-full uppercase text-white shadow-sm">
              {clients.length} Active Accounts
            </span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="font-black text-slate-900 px-6 h-14 uppercase text-[11px] tracking-wider">Business Name</TableHead>
                    <TableHead className="font-black text-slate-900 h-14 uppercase text-[11px] tracking-wider">Category</TableHead>
                    <TableHead className="text-right pr-8 font-black text-slate-900 h-14 uppercase text-[11px] tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map(c => (
                    <TableRow key={c._id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100">
                      <TableCell className="font-black text-slate-900 px-6 py-5 text-sm">{c.name}</TableCell>
                      <TableCell>
                        <span className="text-[10px] font-black uppercase text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                          {c.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6 space-x-1">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-slate-100" onClick={() => handleEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => initiateDelete(c._id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- NEW: CUSTOM DELETE CONFIRMATION POPUP --- */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white border-slate-200 sm:max-w-[400px] shadow-2xl">
          <DialogHeader>
            <div className="mx-auto w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100 shadow-sm">
              <AlertTriangle className="h-7 w-7 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl font-black text-slate-900 uppercase tracking-tight">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-center text-slate-500 font-bold px-4">
              Are you sure you want to remove this client? This action is permanent and will remove them from the directory.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-center gap-3 pt-6 pb-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)} 
              className="flex-1 border-slate-200 font-bold text-slate-700 h-11" 
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmDelete} 
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black shadow-lg h-11" 
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Delete Client"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;