import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Database, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Profile Settings */}
      <Card className="bg-background border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Profile Settings</CardTitle>
              <CardDescription>Manage your admin account details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input defaultValue="Admin User" className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input defaultValue="admin@adspro.com" className="bg-background" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input defaultValue="AdsPro Creative Agency" className="bg-background" />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-background border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Notifications</CardTitle>
              <CardDescription>Configure alert preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Receive task updates via email</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Task Reminders</p>
              <p className="text-sm text-muted-foreground">Get reminders for pending tasks</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Weekly Reports</p>
              <p className="text-sm text-muted-foreground">Receive weekly summary reports</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-background border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Security</CardTitle>
              <CardDescription>Manage password and security options</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" placeholder="••••••••" className="bg-background" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" placeholder="••••••••" className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" placeholder="••••••••" className="bg-background" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-background border-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Database className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">Data Management</CardTitle>
              <CardDescription>Export or backup your data</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Export All Tasks</Button>
            <Button variant="outline">Export Employee Data</Button>
            <Button variant="outline">Backup Database</Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save All Changes
        </Button>
      </div>
    </div>
  );
};

export default Settings;
