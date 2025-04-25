
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      // Here you would typically save settings to Supabase or local storage
      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error(`Error saving settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    const email = (await supabase.auth.getUser()).data.user?.email;
    
    if (email) {
      try {
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) throw error;
        
        toast.success("Password reset email sent. Please check your inbox.");
      } catch (error: any) {
        toast.error(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("You must be logged in to change your password");
    }
  };

  return (
    <DashboardLayout>
      <div className="container max-w-4xl py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-ezgray mt-2">Manage your account settings and preferences</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Update your account preferences and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Security</h3>
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-ezgray">Change your account password</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handlePasswordChange}
                  disabled={loading}
                >
                  Change Password
                </Button>
              </div>
            </div>
            
            <div className="space-y-4 mt-6">
              <h3 className="font-medium">Preferences</h3>
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-ezgray">Receive email notifications about account activity</p>
                  </div>
                  <Switch 
                    id="email-notifications" 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-ezgray">Enable dark mode for the application interface</p>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={darkMode} 
                    onCheckedChange={setDarkMode} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save">Auto Save</Label>
                    <p className="text-sm text-ezgray">Automatically save changes as you work</p>
                  </div>
                  <Switch 
                    id="auto-save" 
                    checked={autoSave} 
                    onCheckedChange={setAutoSave} 
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4">
              <Button 
                onClick={handleSaveSettings} 
                className="bg-ezblue text-eznavy hover:bg-ezblue-light"
                disabled={loading}
              >
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
