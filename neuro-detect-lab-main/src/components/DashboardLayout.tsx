import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Brain } from "lucide-react";
import FloatingChatbot from "@/components/FloatingChatbot";

const DashboardLayout = () => {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(210_35%_96%)_100%)]">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border/80 bg-card/85 px-4 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
                {user?.role === "doctor" ? "Doctor Dashboard" : "Patient Dashboard"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="h-4 w-4 text-primary" />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>
      <FloatingChatbot />
    </SidebarProvider>
  );
};

export default DashboardLayout;
