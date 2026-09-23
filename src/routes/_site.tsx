import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const Route = createFileRoute("/_site")({ component: SiteLayout });

function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
