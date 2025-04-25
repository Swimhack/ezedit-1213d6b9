
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
