import { HeaderShell } from "@/components/header/HeaderShell";
import { Portfolio } from "@/components/portfolio/Portfolio";
import { AppSidebar } from "@/components/AppSidebar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background w-full">
      <HeaderShell />

      <div className="flex w-full">
        <AppSidebar />

        <main className="flex-1 min-w-0 md:pl-60">
          <Portfolio />
        </main>
      </div>
    </div>
  );
};

export default Index;
