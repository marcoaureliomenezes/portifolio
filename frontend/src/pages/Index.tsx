import { Header } from "@/components/Header";
import { Portfolio } from "@/components/portfolio/Portfolio";

const Index = () => {
  return (
    <div className="min-h-screen bg-background w-full">
      <Header />
      <main id="main-content" className="flex-1">
        <Portfolio />
      </main>
    </div>
  );
};

export default Index;
