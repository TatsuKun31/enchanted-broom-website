import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard,
  Users, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  FileText,
  Settings
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Scheduling",
    icon: Calendar,
    href: "/admin/scheduling",
  },
  {
    title: "Pricing",
    icon: DollarSign,
    href: "/admin/pricing",
  },
  {
    title: "Communication",
    icon: MessageSquare,
    href: "/admin/communication",
  },
  {
    title: "Work Orders",
    icon: FileText,
    href: "/admin/work-orders",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 border-r min-h-[calc(100vh-4rem)] p-4 bg-background">
      <nav className="space-y-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-foreground",
              location.pathname === item.href 
                ? "bg-purple-secondary dark:bg-purple-dark text-purple-primary dark:text-purple-primary" 
                : "text-muted-foreground hover:bg-accent"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
};