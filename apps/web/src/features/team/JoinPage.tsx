import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../../lib/api.ts";
import { useSession } from "../../stores/session.ts";
import { toast } from "../../components/ui/toast.tsx";
import { Button } from "../../components/ui/button.tsx";
import { Card, CardContent } from "../../components/ui/card.tsx";
import { Spinner } from "../../components/ui/misc.tsx";

/**
 * Convite por link: /entrar/:CODE
 * - sessão iniciada → entra automaticamente na equipa e vai para /equipa
 * - anónimo → redirect para registo preservando o código (?join=CODE)
 */
export function JoinPage() {
  const { code = "" } = useParams();
  const { status, bootstrap, refreshMe } = useSession();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (status === "loading") void bootstrap();
  }, [status, bootstrap]);

  useEffect(() => {
    if (status !== "authed" || done || error) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await apiFetch<{ name: string }>("/api/teams/join", {
          method: "POST",
          body: { code: code.toUpperCase() },
        });
        if (cancelled) return;
        await refreshMe();
        setDone(true);
        toast.success(`Bem-vindo à equipa "${r.name}"! 🎓`);
        navigate("/equipa", { replace: true });
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, code, done, error, navigate, refreshMe]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <Spinner className="h-8 w-8" />
        <p className="text-sm text-muted-foreground">A validar o convite…</p>
      </div>
    );
  }

  if (status === "anon")
    return <Navigate to={`/register?join=${encodeURIComponent(code)}`} replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-3 py-10 text-center">
          {!error ? (
            <>
              <Spinner className="mx-auto h-8 w-8" />
              <p className="text-sm text-muted-foreground">
                A entrar na equipa com o código{" "}
                <b className="font-mono text-foreground">{code.toUpperCase()}</b>…
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl">⚠️</p>
              <p className="font-semibold">Não foi possível entrar na equipa</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Link to="/equipa">
                <Button variant="outline">Ir para a página Equipa</Button>
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
