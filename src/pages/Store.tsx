import { Gem, Zap, Sparkles, ShoppingBag, Snowflake, Forward, Gift } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useNova, StoreItem } from "@/lib/novaprep-store";
import { toast } from "@/hooks/use-toast";

const items: (StoreItem & { icon: any; tagline: string; tier: "common" | "rare" | "epic" })[] = [
  {
    id: "xp2x_15",
    kind: "xp_2x",
    label: "2x XP · 15 min",
    description: "Doubles XP earned for 15 minutes. Great for short drills.",
    cost: 25,
    minutes: 15,
    icon: Zap,
    tagline: "Quick boost",
    tier: "common",
  },
  {
    id: "xp2x_60",
    kind: "xp_2x",
    label: "2x XP · 1 hour",
    description: "Doubles XP for a full hour of practice or focus time.",
    cost: 80,
    minutes: 60,
    icon: Zap,
    tagline: "Long session",
    tier: "rare",
  },
  {
    id: "xp3x_30",
    kind: "xp_3x",
    label: "3x XP · 30 min",
    description: "Triple XP for 30 minutes. Stack with other boosts for max gain.",
    cost: 120,
    minutes: 30,
    icon: Sparkles,
    tagline: "Premium",
    tier: "epic",
  },
  {
    id: "streak_freeze",
    kind: "streak_freeze",
    label: "Streak Freeze · 24h",
    description: "Protect your daily streak for 24 hours if you miss a day.",
    cost: 60,
    minutes: 60 * 24,
    icon: Snowflake,
    tagline: "Insurance",
    tier: "rare",
  },
  {
    id: "skip_token",
    kind: "skip_token",
    label: "Skip Token · 1 hour",
    description: "Allows skipping one hard question per drill without a penalty.",
    cost: 40,
    minutes: 60,
    icon: Forward,
    tagline: "Tactical",
    tier: "common",
  },
  {
    id: "sp2x_30",
    kind: "sp_2x",
    label: "2x SP · 30 min",
    description: "Double Study Points earned from drills for 30 minutes.",
    cost: 75,
    minutes: 30,
    icon: Gem,
    tagline: "Currency multiplier",
    tier: "rare",
  },
  {
    id: "streak_freeze_7d",
    kind: "streak_freeze",
    label: "Streak Shield · 7 days",
    description: "Week-long insurance — your streak survives any missed day.",
    cost: 200,
    minutes: 60 * 24 * 7,
    icon: Snowflake,
    tagline: "Long-term insurance",
    tier: "epic",
  },
  {
    id: "skip_token_day",
    kind: "skip_token",
    label: "Skip Pass · 24h",
    description: "Skip up to one hard question per drill for a full day, no penalty.",
    cost: 90,
    minutes: 60 * 24,
    icon: Forward,
    tagline: "Tactical pass",
    tier: "rare",
  },
];

const tierStyle: Record<string, string> = {
  common: "border-border",
  rare: "border-secondary/40 glass-cyan",
  epic: "border-primary/40 glass-purple glow-purple",
};

const Store = () => {
  const profile = useNova((s) => s.profile);
  const buy = useNova((s) => s.buyStoreItem);
  const sp = profile?.sp ?? 0;

  const purchase = async (item: StoreItem) => {
    const ok = await buy(item);
    toast(
      ok
        ? {
            title: "Added to inventory",
            description: `${item.label} is ready to activate from your Rewards tab.`,
          }
        : {
            title: "Not enough SP",
            description: `You need ${item.cost} SP for ${item.label}.`,
            variant: "destructive",
          },
    );
  };

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-secondary">Supply Depot</span>
          <h1 className="font-display text-4xl font-bold mt-1">Store</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Spend Study Points on boosts and tools. Purchases land in your Rewards inventory — activate
            them when you're ready.
          </p>
        </div>
        <div className="glass px-4 py-3 text-sm text-muted-foreground inline-flex items-center gap-2">
          <Gem className="h-4 w-4 text-secondary" /> {sp.toLocaleString()} SP
        </div>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {items.map((item) => {
          const Icon = item.icon;
          const affordable = sp >= item.cost;
          return (
            <GlassCard key={item.id} className={`overflow-hidden ${tierStyle[item.tier]}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-secondary">
                    {item.tagline}
                  </span>
                  <h2 className="font-display text-xl font-semibold mt-2">{item.label}</h2>
                  <p className="text-sm text-muted-foreground mt-2">{item.description}</p>
                </div>
                <div className="h-14 w-14 rounded-2xl border border-primary/30 bg-primary/15 flex items-center justify-center shrink-0">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between rounded-lg border border-border bg-background/40 px-3 py-2 text-sm">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Gift className="h-4 w-4" /> Stock
                </span>
                <span className="font-mono text-secondary">{item.cost} SP</span>
              </div>
              <button
                onClick={() => purchase(item)}
                disabled={!affordable}
                className="mt-4 w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingBag className="h-4 w-4" /> {affordable ? "Buy" : "Need more SP"}
              </button>
            </GlassCard>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Store;
