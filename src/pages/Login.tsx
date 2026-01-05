import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail, user } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate("/app", { replace: true });
  }, [user, navigate]);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const cleanEmail = email.trim();
      if (mode === "login") {
        await signInWithEmail(cleanEmail, password);
      } else {
        await signUpWithEmail(cleanEmail, password);
      }
      navigate("/app", { replace: true });
    } catch (e: any) {
      setError(e?.message ?? "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-xl font-bold">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Acesse sua dashboard de treinos
          </p>
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm">Senha</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading || !email || !password}
          >
            {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Cadastrar"}
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            disabled={loading}
          >
            {mode === "login"
              ? "Não tenho conta, quero me cadastrar"
              : "Já tenho conta, quero entrar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
