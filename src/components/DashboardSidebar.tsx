
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Globe, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardSidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Globe, label: "My Sites", path: "/dashboard/sites" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];
  
  return (
    <div className={cn(
      "bg-white border-r border-gray-200",
      isMobile ? "w-full min-h-0" : "w-64 min-h-screen"
    )}>
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard</h2>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors",
                    location.pathname === item.path && "bg-gray-100 text-gray-900"
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
