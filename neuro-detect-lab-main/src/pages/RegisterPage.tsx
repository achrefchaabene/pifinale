import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("user");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) { toast.error("All fields required"); return; }
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate(role === "doctor" ? "/doctor" : "/patient");
      toast.success("Account created!");
    } catch {
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center gradient-hero px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elevated"
      >
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-medical">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">Create Account</h1>
          <p className="text-xs text-muted-foreground">Join the AlzDetectAI platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Full Name</Label>
            <Input placeholder="Dr. Sarah Mitchell" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Email</Label>
            <Input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">Password</Label>
            <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-foreground">I am a…</Label>
            <div className="grid grid-cols-2 gap-3">
              {(["user", "doctor"] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`rounded-xl border p-3 text-xs font-medium transition-all ${
                    role === r
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {r === "doctor" ? "🩺 Medical Professional" : "👤 Patient / Family"}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full rounded-xl gradient-medical text-primary-foreground">
            {loading ? "Creating…" : "Create Account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
