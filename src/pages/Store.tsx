import { Gem, Zap, Sparkles, ShoppingBag, Snowflake, Forward, Gift, Eye, Lightbulb, RefreshCw, Heart, Compass } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useNova, StoreItem } from "@/lib/novaprep-store";
import { toast } from "@/hooks/use-toast";

const items: (StoreItem & { icon: any; tagline: string; tier: "common" | "rare" | "epic" })[] = [
  { id: "xp2x_30", kind: "xp_2x", label: "2x XP · 30 min", description: "Doubles XP for 30 minutes of practice.", cost: 50, minutes: 30, icon: Zap, tagline: "XP boost", tier: "common" },
  { id: "xp3x_30", kind: "xp_3x", label: "3x XP · 30 min", description: "Triple XP for 30 minutes. Stack with other boosts.", cost: 120, minutes: 30, icon: Sparkles, tagline: "Premium XP", tier: "epic" },
  { id: "streak_freeze", kind: "streak_freeze", label: "Streak Freeze · 24h", description: "Protect your daily streak for 24 hours.", cost: 60, minutes: 60 * 24, icon: Snowflake, tagline: "Insurance", tier: "rare" },
  { id: "skip_token", kind: "skip_token", label: "Skip Token · 1 hr", description: "Skip one hard question per drill without penalty.", cost: 40, minutes: 60, icon: Forward, tagline: "Tactical", tier: "common" },
  // 5 unique non-XP rewards
  { id: "hint_pack", kind: "hint", label: "Hint Pack · 3 hints", description: "Reveals one helpful hint per question for the next 3 questions you answer.", cost: 55, icon: Lightbulb, tagline: "Coach assist", tier: "common" },
  { id: "fifty_fifty", kind: "fifty_fifty", label: "50/50 · 1 use", description: "Removes two wrong answers from one multiple-choice question of your choice.", cost: 70, icon: Eye, tagline: "Elimination", tier: "rare" },
  { id: "retry_token", kind: "retry", label: "Retry Token · 1 use", description: "Re-attempt one missed question after a drill without it counting against accuracy.", cost: 90, icon: RefreshCw, tagline: "Second chance", tier: "rare" },
  { id: "extra_life", kind: "extra_life", label: "Extra Life · 24h", description: "Your first wrong answer in a drill today doesn't add a mistake to your Vault.", cost: 80, minutes: 60 * 24, icon: Heart, tagline: "Forgiveness", tier: "rare" },
  { id: "topic_radar", kind: "topic_radar", label: "Topic Radar · 24h", description: "Highlights which weak topic each question targets before you answer.", cost: 65, minutes: 60 * 24, icon: Compass, tagline: "Insight", tier: "common" },
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
