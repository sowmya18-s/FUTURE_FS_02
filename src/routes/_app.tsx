import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { LayoutDashboard, Users, User, LogOut, Sparkles, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const { location } = useRouterState();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login", replace: true });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/leads", label: "Leads", icon: Users },
    { to: "/profile", label: "Profile", icon: User },
  ] as const;

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gradient-soft">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col">
        <Link to="/dashboard" className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary shadow-elegant">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">LeadFlow</span>
        </Link>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map((n) => {
            const active = location.pathname === n.to || (n.to === "/leads" && location.pathname.startsWith("/leads"));
            return (
              <Link key={n.to} to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-gradient-primary text-primary-foreground shadow-elegant"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}>
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-4">
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="w-full justify-start text-muted-foreground">
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">LeadFlow</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="h-4 w-4" /></Button>
        </header>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-border bg-card md:hidden">
          {nav.map((n) => {
            const active = location.pathname === n.to || (n.to === "/leads" && location.pathname.startsWith("/leads"));
            return (
              <Link key={n.to} to={n.to} className={cn("flex flex-1 flex-col items-center gap-1 py-3 text-xs",
                active ? "text-primary" : "text-muted-foreground")}>
                <n.icon className="h-5 w-5" />{n.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
