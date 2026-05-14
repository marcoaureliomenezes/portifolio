import { useState } from "react";
import { Header } from "@/components/Header";
import { Portfolio } from "@/components/Portfolio";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

const Index = () => {
  const [language, setLanguage] = useState("Português");

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background w-full">
        <Header language={language} onLanguageChange={setLanguage} />

        <div className="flex w-full">
          <AppSidebar language={language} />

          <main className="flex-1">
            <Portfolio language={language} />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
