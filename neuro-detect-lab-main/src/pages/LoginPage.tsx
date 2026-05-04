import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Email is required"); return; }
    setLoading(true);
    try {
      await login(email, password);
      const stored = JSON.parse(localStorage.getItem("alz_user") || "{}");
      navigate(stored.role === "doctor" ? "/doctor" : "/patient");
      toast.success("Welcome back!");
    } catch {
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f5fbff_0%,#ebf5ff_44%,#f8fbff_100%)] px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(14,116,244,0.2),transparent_60%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center"
      >
        <div className="w-full rounded-[32px] border border-sky-100 bg-white/90 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-10">
          <div className="mb-8">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[0_10px_24px_rgba(37,99,235,0.12)]">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">Connexion</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Entre tes identifiants pour acceder a ton espace NeuroDetect Lab.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Adresse email</Label>
            <Input id="email" type="email" placeholder="nom@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-2xl border-border/80 bg-white px-4 shadow-sm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Mot de passe</Label>
            <div className="relative">
              <Input id="password" type={showPw ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl pr-10" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="h-12 w-full rounded-2xl bg-primary text-primary-foreground shadow-[0_16px_32px_rgba(37,99,235,0.22)] transition-transform hover:-translate-y-0.5 hover:bg-primary/95">
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">Creer un compte</Link>
        </p>

        <div className="mt-6 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
          La navigation t'oriente automatiquement vers l'espace patient ou medecin apres connexion.
        </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
