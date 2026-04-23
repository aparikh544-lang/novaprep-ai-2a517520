import { Gem, Zap, Infinity, ShoppingBag } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useNova } from "@/lib/novaprep-store";
import { toast } from "@/hooks/use-toast";

const Store = () => {
  const profile = useNova((s) => s.profile);
  const buyXPBoost = useNova((s) => s.buyXPBoost);
  const sp = profile?.sp ?? 0;
  const boostActive = profile?.xp_boost_until && new Date(profile.xp_boost_until).getTime() > Date.now();

  const purchase = async () => {
    const ok = await buyXPBoost();
    toast(ok ? { title: "Boost activated", description: "2x XP added for 15 minutes." } : { title: "Not enough SP", description: "You need 25 SP to buy this boost.", variant: "destructive" });
  };

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-secondary">Supply Depot</span>
          <h1 className="font-display text-4xl font-bold mt-1">Store</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">Spend StudyPoints on boosts that accelerate your next practice sessions.</p>
        </div>
        <div className="glass px-4 py-3 text-sm text-muted-foreground inline-flex items-center gap-2"><Gem className="h-4 w-4 text-secondary" /> {sp.toLocaleString()} SP</div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        <GlassCard variant="purple" className="overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest text-secondary">Unlimited stock</span>
              <h2 className="font-display text-2xl font-semibold mt-2">2x XP Boost</h2>
              <p className="text-sm text-muted-foreground mt-2">Doubles XP earned from questions for 15 minutes. Purchases stack onto your active timer.</p>
            </div>
            <div className="h-14 w-14 rounded-2xl border border-primary/30 bg-primary/15 flex items-center justify-center"><Zap className="h-7 w-7 text-primary" /></div>
          </div>
          <div className="mt-6 flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground"><Infinity className="h-4 w-4" /> Stock</span>
            <span className="font-mono text-secondary">25 SP</span>
          </div>
          {boostActive && <div className="mt-3 text-xs text-success">Boost active until {new Date(profile!.xp_boost_until!).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</div>}
          <button onClick={purchase} className="mt-5 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground inline-flex items-center justify-center gap-2"><ShoppingBag className="h-4 w-4" /> Buy boost</button>
        </GlassCard>
      </div>
    </AppLayout>
  );
};

export default Store;
