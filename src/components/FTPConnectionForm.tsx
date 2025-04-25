import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FTPConnectionModal from "./FTPConnectionModal";

export interface FTPConnectionFormData {
  server_name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  root_directory?: string;
  web_url?: string;
}

interface FTPConnectionFormProps {
  defaultValues: Partial<FTPConnectionFormData>;
  isEditing: boolean;
  children: React.ReactNode;
  onSubmit: (data: FTPConnectionFormData) => void;
}

export function FTPConnectionFormFields({ 
  defaultValues,
  isEditing,
  children,
  onSubmit 
}: FTPConnectionFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FTPConnectionFormData>({
    defaultValues: {
      port: 21,
      ...defaultValues,
      password: '', // Clear password field initially when editing
    }
  });

  return (
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
        <Label htmlFor="password">Password {isEditing && "(leave empty to keep current password)"}</Label>
        <Input
          id="password"
          type="password"
          placeholder={isEditing ? "••••••••" : "Enter password"}
          {...register("password", { required: !isEditing })}
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

      {children}
    </form>
  );
}

const FTPConnectionForm = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  
  const handleSaveConnection = () => {
    setIsModalOpen(false);
    // If we had a way to refresh connections, we would call it here
  };
  
  return (
    <div>
      <Card className="mb-4 bg-eznavy-light border-ezgray-dark">
        <CardContent className="pt-6">
          <Button 
            onClick={handleOpenModal} 
            className="bg-ezblue hover:bg-ezblue/90 w-full flex items-center justify-center"
          >
            <Plus className="mr-2 h-4 w-4" /> Add FTP Connection
          </Button>
        </CardContent>
      </Card>
      
      <FTPConnectionModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSave={handleSaveConnection}
      />
    </div>
  );
};

export default FTPConnectionForm;
