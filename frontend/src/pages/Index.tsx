import { HeaderShell } from "@/components/header/HeaderShell";
import { Portfolio } from "@/components/portfolio/Portfolio";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full">
        <HeaderShell />

        <div className="flex w-full">
          <AppSidebar />

          <main className="flex-1 min-w-0">
            <Portfolio />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
