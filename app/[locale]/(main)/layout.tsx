import { Header } from "@/components/layout/header";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="pt-[var(--header-height)] pb-[var(--nav-height)] md:pb-8">
        <div className="max-w-md mx-auto px-4 py-6">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
