
import { Link, useLocation } from "react-router-dom";
import { Home, Globe, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardSidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  
  const menuItems = [
    { icon: Home, label: "Overview", path: "/dashboard" },
    { icon: Globe, label: "My Sites", path: "/dashboard/sites" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ];
  
  return (
    <div className={cn(
      "bg-eznavy-light border-ezgray-dark",
      isMobile ? "w-full min-h-0" : "w-64 border-r min-h-[calc(100vh-4rem-3rem)]"
    )}>
      <div className="p-4">
        {!isMobile && <h2 className="text-xl font-semibold text-ezwhite mb-4">Dashboard</h2>}
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
