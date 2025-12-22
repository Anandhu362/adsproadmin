import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
}

const DashboardHeader = ({ title }: DashboardHeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-right hidden md:block">
          <p className="text-sm text-foreground font-medium">{formatDate(currentTime)}</p>
          <p className="text-xs text-muted-foreground">{formatTime(currentTime)}</p>
        </div>

        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </button>

        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">Admin</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
