import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

// Demo user for public dashboard preview
const demoUser = {
  id: "demo-user",
  name: "Demo User",
  email: "demo@popupgo.in",
  image: null,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardSidebar user={demoUser} isDemo={true} />
      <SidebarInset className="relative overflow-hidden">
        {/* Gradient backgrounds matching landing page */}
        <div className="absolute inset-0 -z-10 h-full w-full bg-background">
          {/* Primary gradient - top right */}
          <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] bg-radial-[at_100%_0%] from-sky-500/10 via-sky-500/5 to-transparent" />
          {/* Secondary gradient - bottom left */}
          <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] bg-radial-[at_0%_100%] from-violet-500/10 via-violet-500/5 to-transparent" />
          {/* Subtle center glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[800px] w-[800px] bg-radial from-sky-500/5 via-transparent to-transparent opacity-50" />
        </div>
        <main className="flex-1 p-6 md:p-8 lg:p-10">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
