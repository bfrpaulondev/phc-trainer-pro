import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../../stores/session.ts";
import { AppFooter, AppHeader } from "./AppHeader.tsx";
import { Spinner } from "../ui/misc.tsx";
import { Toaster } from "../ui/toast.tsx";

/** bootstrap de sessão + guarda de rotas autenticadas */
export function RequireAuth({ children }: { children?: React.ReactNode }) {
  const status = useSession((s) => s.status);
  const bootstrap = useSession((s) => s.bootstrap);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (status === "loading") void bootstrap();
  }, [status, bootstrap]);

  useEffect(() => {
    if (status === "anon")
      navigate("/login", { state: { from: location.pathname }, replace: true });
  }, [status, navigate, location.pathname]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <Spinner className="h-8 w-8" />
        <p className="text-sm text-muted-foreground">A preparar o Professor Einstein…</p>
      </div>
    );
  }
  if (status === "anon") return null;
  return <>{children ?? <Outlet />}</>;
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <AppFooter />
      <Toaster />
    </div>
  );
}
