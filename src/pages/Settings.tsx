
import { useState, useEffect } from "react";
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
import FTPSettingsModal from "@/components/FTPSettingsModal";
import { useSubscription } from "@/hooks/useSubscription";
import { Loader, Calendar } from "lucide-react";
import { format } from "date-fns";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    
    getUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const { 
    subscribed, 
    subscriptionTier, 
    subscriptionEnd, 
    isLoading: subLoading, 
    handleCustomerPortal 
  } = useSubscription(user?.email);

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
        
        {/* Subscription Card */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>Manage your subscription plan and payment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {subLoading ? (
              <div className="flex items-center justify-center p-4">
                <Loader className="h-5 w-5 animate-spin mr-2" />
                <span>Loading subscription information...</span>
              </div>
            ) : (
              <>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-eznavy-light/20 p-4 rounded-lg">
                  <div>
                    <h3 className="font-medium mb-1">Current Plan</h3>
                    <p className="font-bold text-xl">
                      {subscribed ? 'Business Pro' : 'Free Trial'}
                    </p>
                    {subscriptionEnd && (
                      <div className="flex items-center mt-2 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>
                          {subscribed 
                            ? `Renews on ${format(new Date(subscriptionEnd), 'MMMM d, yyyy')}`
                            : `Expires on ${format(new Date(subscriptionEnd), 'MMMM d, yyyy')}`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                  <Button 
                    onClick={handleCustomerPortal}
                    className="bg-ezblue text-eznavy hover:bg-ezblue-light"
                  >
                    {subscribed ? 'Manage Subscription' : 'Upgrade Plan'}
                  </Button>
                </div>

                {!subscribed && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-md">
                    <p className="text-amber-800 dark:text-amber-200">
                      Your free trial will expire soon. Upgrade to our Business Pro plan to continue using all features.
                    </p>
                    <Button 
                      variant="link" 
                      className="text-amber-800 dark:text-amber-200 p-0 h-auto font-normal underline"
                      onClick={() => navigate('/pricing')}
                    >
                      View pricing options
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
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
              <h3 className="font-medium">FTP Connections</h3>
              <Separator />
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Manage FTP Connections</p>
                  <p className="text-sm text-ezgray">Add and configure FTP server connections</p>
                </div>
                <FTPSettingsModal />
              </div>
            </div>
            
            <div className="space-y-4">
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
