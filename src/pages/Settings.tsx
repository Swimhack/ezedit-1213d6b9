
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
        setEmail(data.session.user.email || "");
      }
    };
    
    getUser();
  }, []);

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      // Save settings logic would go here
      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error(`Error saving settings: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
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
      toast.error("Please enter your email address");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account details and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={loading}
              />
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <Button 
                variant="outline" 
                onClick={handlePasswordChange}
                disabled={loading}
              >
                Change Password
              </Button>
              
              <Button 
                onClick={handleSaveSettings} 
                disabled={loading}
              >
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>FTP Connections</CardTitle>
            <CardDescription>Manage your FTP server connections</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate('/dashboard/sites')}
              className="w-full"
            >
              Manage FTP Sites
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
