import { Header } from "@/components/Header";
import { Portfolio } from "@/components/Portfolio";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full">
        <Header />

        <div className="flex w-full">
          <AppSidebar />

          <main className="flex-1">
            <Portfolio />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
