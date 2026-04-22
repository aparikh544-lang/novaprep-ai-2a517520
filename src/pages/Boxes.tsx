import { Gift, Sparkles, Star } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useNova } from "@/lib/novaprep-store";
import { toast } from "@/hooks/use-toast";

const tierStyles = {
  common: "glass border-border",
  rare: "glass glass-cyan border-secondary/40",
  epic: "glass glass-purple border-primary/40",
  legendary: "glass border-warning/50",
} as const;

const tierLabels = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
} as const;

const Boxes = () => {
  const boxes = useNova((s) => s.mysteryBoxes);
  const upgradeMysteryBox = useNova((s) => s.upgradeMysteryBox);

  const onUpgrade = async (boxId: string) => {
    const result = await upgradeMysteryBox(boxId);
    if (!result) return;
    toast({
      title: `${tierLabels[result.tier]} box`,
      description: `${3 - result.upgrade_clicks_used} upgrade taps left.`,
    });
  };

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-secondary">Reward Bay</span>
          <h1 className="font-display text-4xl font-bold mt-1">Mystery Boxes</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Every level grants a new box. Each box gets 3 upgrade taps: 30% Common→Rare, 15% Rare→Epic, 5% Epic→Legendary.
          </p>
        </div>
        <div className="glass px-4 py-3 text-sm text-muted-foreground">
          {boxes.length} unlocked · newest first
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {boxes.map((box) => {
          const remaining = Math.max(0, 3 - box.upgrade_clicks_used);
          return (
            <GlassCard key={box.id} className={`overflow-hidden ${tierStyles[box.tier]}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-secondary">Level {box.level_number}</p>
                  <h2 className="font-display text-2xl font-semibold mt-2">{tierLabels[box.tier]} Box</h2>
                  <p className="text-sm text-muted-foreground mt-2">{box.reward_label ?? `Level ${box.level_number} reward crate`}</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-background/30">
                  {box.tier === "legendary" ? <Star className="h-6 w-6 text-warning" /> : box.tier === "epic" ? <Sparkles className="h-6 w-6 text-primary" /> : <Gift className="h-6 w-6 text-secondary" />}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
                <span>{remaining} upgrade taps left</span>
                <span>{tierLabels[box.tier]}</span>
              </div>

              <button
                onClick={() => onUpgrade(box.id)}
                disabled={remaining === 0}
                className="mt-4 w-full rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                {remaining === 0 ? "Fully opened" : "Tap to upgrade"}
              </button>
            </GlassCard>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Boxes;