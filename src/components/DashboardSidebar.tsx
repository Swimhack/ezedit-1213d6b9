
import { Link, useLocation } from "react-router-dom";
import { FolderOpen, Upload, Settings, Layers, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const DashboardSidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: Home, label: "Overview", path: "/dashboard" },
    { icon: FolderOpen, label: "Files", path: "/dashboard/files" },
    { icon: Upload, label: "Upload", path: "/dashboard/upload" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];
  
  return (
    <div className="w-64 bg-eznavy-light border-r border-ezgray-dark min-h-[calc(100vh-4rem-3rem)]">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-ezwhite mb-4">Dashboard</h2>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-md text-ezgray hover:text-ezwhite hover:bg-eznavy transition-colors",
                    location.pathname === item.path && "bg-eznavy text-ezwhite"
                  )}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default DashboardSidebar;
