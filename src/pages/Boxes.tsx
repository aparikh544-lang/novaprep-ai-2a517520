import { useState } from "react";
import { Gift, Sparkles, Star, Gem, Zap, Box, PartyPopper } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { GlassCard } from "@/components/GlassCard";
import { useNova, BoxReward } from "@/lib/novaprep-store";
import { toast } from "@/hooks/use-toast";

const tierStyles = {
  common: "glass border-border",
  rare: "glass glass-cyan border-secondary/40",
  epic: "glass glass-purple border-primary/40",
  legendary: "glass border-warning/50 glow-purple",
} as const;

const tierLabels = { common: "Common", rare: "Rare", epic: "Epic", legendary: "Legendary" } as const;
const tierIcon = { common: Gift, rare: Sparkles, epic: Star, legendary: PartyPopper } as const;

const Boxes = () => {
  const boxes = useNova((s) => s.mysteryBoxes);
  const profile = useNova((s) => s.profile);
  const upgradeMysteryBox = useNova((s) => s.upgradeMysteryBox);
  const openMysteryBox = useNova((s) => s.openMysteryBox);
  const [revealing, setRevealing] = useState<string | null>(null);
  const [lastReward, setLastReward] = useState<BoxReward | null>(null);

  const onUpgrade = async (boxId: string) => {
    const result = await upgradeMysteryBox(boxId);
    if (!result) return;
    toast({ title: `${tierLabels[result.tier]} box`, description: `${3 - result.upgrade_clicks_used} upgrade taps left.` });
  };

  const onOpen = async (boxId: string) => {
    setRevealing(boxId);
    setLastReward(null);
    window.setTimeout(async () => {
      const reward = await openMysteryBox(boxId);
      setLastReward(reward);
      setRevealing(null);
      if (reward) toast({ title: "Reward unlocked", description: reward.label });
    }, 900);
  };

  return (
    <AppLayout>
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-secondary">Reward Bay</span>
          <h1 className="font-display text-4xl font-bold mt-1">Mystery Boxes</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">Tap up to 3 times to upgrade, then crack it open Starr Drop-style for SP or timed 2x XP.</p>
        </div>
        <div className="glass px-4 py-3 text-sm text-muted-foreground">{boxes.length} unlocked · {(profile?.sp ?? 0).toLocaleString()} SP</div>
      </div>

      {revealing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xl animate-fade-in">
          <div className="text-center">
            <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-[2rem] border border-primary/40 bg-gradient-to-br from-primary/25 to-secondary/25 glow-purple animate-[pulse_0.55s_ease-in-out_infinite]">
              <Box className="h-20 w-20 text-secondary" />
            </div>
            <p className="mt-6 font-display text-3xl font-bold text-gradient-nebula">Opening…</p>
          </div>
        </div>
      )}

      {lastReward && (
        <GlassCard variant="cyan" className="mb-5 flex items-center gap-4 animate-scale-in">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/30">
            {lastReward.type === "sp" ? <Gem className="h-6 w-6 text-secondary" /> : <Zap className="h-6 w-6 text-warning" />}
          </div>
          <div><h2 className="font-display text-xl font-semibold">You got {lastReward.label}</h2><p className="text-sm text-muted-foreground">Reward added to your profile.</p></div>
        </GlassCard>
      )}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {boxes.map((box) => {
          const remaining = Math.max(0, 3 - box.upgrade_clicks_used);
          const Icon = tierIcon[box.tier];
          const opened = Boolean(box.reward_payload || box.claimed_at);
          return (
            <GlassCard key={box.id} className={`overflow-hidden ${tierStyles[box.tier]}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-secondary">Level {box.level_number}</p>
                  <h2 className="font-display text-2xl font-semibold mt-2">{tierLabels[box.tier]} Drop</h2>
                  <p className="text-sm text-muted-foreground mt-2">{opened ? `Claimed: ${box.reward_payload?.label ?? "Reward"}` : box.reward_label ?? `Level ${box.level_number} reward crate`}</p>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-background/30 animate-float"><Icon className={box.tier === "legendary" ? "h-7 w-7 text-warning" : "h-7 w-7 text-secondary"} /></div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground"><span>{remaining} upgrade taps left</span><span>{opened ? "Opened" : tierLabels[box.tier]}</span></div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={() => onUpgrade(box.id)} disabled={remaining === 0 || opened} className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50">Upgrade</button>
                <button onClick={() => onOpen(box.id)} disabled={opened} className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">Open</button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </AppLayout>
  );
};

export default Boxes;
