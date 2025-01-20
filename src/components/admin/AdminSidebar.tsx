import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  MessageSquare, 
  FileText,
  BarChart
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: BarChart,
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
];

export const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 border-r min-h-[calc(100vh-4rem)] p-4">
      <nav className="space-y-2">
        {sidebarItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
              location.pathname === item.href && "bg-purple-secondary dark:bg-purple-dark text-purple-primary dark:text-purple-primary"
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