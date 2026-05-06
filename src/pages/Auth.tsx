import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Auth = () => {
  const nav = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [targetScore, setTargetScore] = useState("1500");
  const [testDate, setTestDate] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) nav("/", { replace: true });
  }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        // Update profile with target score / test date
        if (data.user) {
          await supabase
            .from("profiles")
            .update({
              display_name: displayName || email.split("@")[0],
              target_score: targetScore ? parseInt(targetScore) : null,
              test_date: testDate || null,
            })
            .eq("id", data.user.id);
        }
        toast({ title: "Welcome aboard, Cadet", description: "Your mission begins now." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast({
        title: "Authentication failed",
        description: err.message ?? "Try again",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="starfield" />
      <div className="glass glass-purple p-8 max-w-md w-full relative z-10 animate-scale-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center glow-purple">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-xl leading-none">NovaPrep AI</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
              {mode === "signup" ? "Create your mission" : "Resume your mission"}
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <>
              <Field label="Display name">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Cadet Nova"
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Target score">
                  <input
                    type="number"
                    min={400}
                    max={1600}
                    value={targetScore}
                    onChange={(e) => setTargetScore(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Test date">
                  <input
                    type="date"
                    value={testDate}
                    onChange={(e) => setTestDate(e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </>
          )}
          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-2 px-4 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-primary-foreground font-semibold disabled:opacity-50"
          >
            {busy ? "…" : mode === "signup" ? "Launch" : "Sign in"}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-muted-foreground">
          {mode === "signup" ? "Already a Cadet?" : "New to NovaPrep AI?"}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="text-secondary hover:text-secondary-glow"
          >
            {mode === "signup" ? "Sign in" : "Create an account"}
          </button>
        </div>

        <p className="mt-6 text-[10px] leading-relaxed text-muted-foreground/70 text-center">
          Independent practice platform; not affiliated with College Board.
        </p>
      </div>
    </div>
  );
};

const inputClass =
  "w-full px-3 py-2.5 rounded-lg bg-background/60 border border-border focus:border-primary/60 focus:outline-none text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default Auth;
