
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";

interface FTPConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editConnection?: {
    id: string;
    server_name: string;
    host: string;
    port: number;
    username: string;
    password: string;
    root_directory: string | null;
    web_url: string | null;
  };
}

type FormValues = {
  server_name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  root_directory?: string;
  web_url?: string;
};

const FTPConnectionModal = ({ isOpen, onClose, onSave, editConnection }: FTPConnectionModalProps) => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with connection data, handling the password specially
  const { register, handleSubmit, formState: { errors }, getValues, reset } = useForm<FormValues>({
    defaultValues: editConnection ? {
      ...editConnection,
      password: '', // Clear password field initially
      root_directory: editConnection.root_directory || '',
      web_url: editConnection.web_url || '',
    } : {
      server_name: '',
      host: '',
      port: 21,
      username: '',
      password: '',
      root_directory: '',
      web_url: '',
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error("User not authenticated");
      }
      
      const user_id = sessionData.session.user.id;
      
      // If editing and password is empty, use the existing password
      const finalData = {
        ...data,
        password: data.password || (editConnection?.password || ''),
      };

      const { error } = await supabase
        .from("ftp_connections")
        .upsert({
          id: editConnection?.id,
          user_id,
          ...finalData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      toast.success(editConnection ? "Connection updated!" : "New connection added!");
      reset();
      onSave();
    } catch (error: any) {
      toast.error(`Error saving connection: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    const values = getValues();
    if (!values.host || !values.username) {
      toast.error("Please fill in host and username fields");
      return;
    }

    setIsTestingConnection(true);
    try {
      const response = await fetch(`https://natjhcqynqziccssnwim.supabase.co/functions/v1/ftp-test-connection`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          host: values.host,
          port: values.port || 21,
          username: values.username,
          // If editing and password field is empty, use existing password
          password: values.password || (editConnection?.password || '')
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      if (result.success) {
        toast.success("Connection successful!");
      } else {
        toast.error(`Connection failed: ${result.message}`);
      }
    } catch (error: any) {
      toast.error(`Error testing connection: ${error.message}`);
      console.error("FTP test connection error:", error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        reset();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editConnection ? 'Edit FTP Connection' : 'Add FTP Connection'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="server_name">Site Name</Label>
            <Input
              id="server_name"
              placeholder="My Website"
              {...register("server_name", { required: "Site name is required" })}
            />
            {errors.server_name && <p className="text-xs text-red-500">{errors.server_name.message}</p>}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="host">FTP Host</Label>
            <Input
              id="host"
              placeholder="ftp.example.com"
              {...register("host", { required: "FTP host is required" })}
            />
            {errors.host && <p className="text-xs text-red-500">{errors.host.message}</p>}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              type="number"
              placeholder="21"
              {...register("port", { valueAsNumber: true })}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="ftpuser"
              {...register("username", { required: "Username is required" })}
            />
            {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="password">Password {editConnection && "(leave empty to keep current password)"}</Label>
            <Input
              id="password"
              type="password"
              placeholder={editConnection ? "••••••••" : "Enter password"}
              {...register("password", { required: !editConnection })}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="root_directory">Root Directory (Optional)</Label>
            <Input
              id="root_directory"
              placeholder="public_html/"
              {...register("root_directory")}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="web_url">Web URL (Optional)</Label>
            <Input
              id="web_url"
              placeholder="https://example.com"
              {...register("web_url")}
            />
          </div>
          
          <DialogFooter className="flex sm:justify-between gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleTestConnection}
              disabled={isTestingConnection}
            >
              {isTestingConnection && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Test Connection
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-ezblue hover:bg-ezblue/90">
                {isSaving && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {editConnection ? 'Update Connection' : 'Save Connection'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FTPConnectionModal;
