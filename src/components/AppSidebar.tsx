import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  CalendarDays,
  Sparkles,
  Bookmark,
  BarChart3,
  Rocket,
} from "lucide-react";
import { useNova } from "@/lib/novaprep-store";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/practice", label: "Practice", icon: Target },
  { to: "/plan", label: "Daily Plan", icon: CalendarDays },
  { to: "/coach", label: "AI Coach", icon: Sparkles },
  { to: "/mistakes", label: "Mistake Bank", icon: Bookmark },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const xp = useNova((s) => s.xp);
  const info = useNova((s) => s.rankInfo());
  const pct =
    info.ceiling === info.floor
      ? 100
      : Math.min(100, ((xp - info.floor) / (info.ceiling - info.floor)) * 100);

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col bg-sidebar/60 backdrop-blur-xl border-r border-sidebar-border relative z-10">
      <div className="px-6 pt-6 pb-8">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[var(--glow-purple)]">
            <Rocket className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-none tracking-tight">
              NovaPrep
            </div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
              Adaptive · SAT
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            end={it.to === "/"}
            className={({ isActive }) =>
              [
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.4)]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              ].join(" ")
            }
          >
            {({ isActive }) => (
              <>
                <it.icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-secondary"
                  }`}
                />
                <span className="font-medium">{it.label}</span>
                {isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary))]" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <div className="glass glass-purple p-4">
          <div className="flex items-center justify-between text-xs uppercase tracking-widest text-muted-foreground">
            <span>Rank</span>
            <span className="font-mono text-secondary">{xp.toLocaleString()} XP</span>
          </div>
          <div className="mt-2 font-display font-semibold text-lg text-gradient-nebula">
            {info.rank}
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Next: <span className="text-foreground/80">{info.next}</span>
          </div>
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground/70 px-1">
          Independent practice platform; not affiliated with College Board.
        </p>
      </div>
    </aside>
  );
}
