import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  CalendarDays,
  Sparkles,
  Bookmark,
  BarChart3,
  UserCircle,
  Gift,
  Rocket,
  Menu,
  X,
} from "lucide-react";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/practice", label: "Practice", icon: Target },
  { to: "/plan", label: "Daily Plan", icon: CalendarDays },
  { to: "/coach", label: "AI Coach", icon: Sparkles },
  { to: "/mistakes", label: "Mistake Bank", icon: Bookmark },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "Profile", icon: UserCircle },
  { to: "/boxes", label: "Boxes", icon: Gift },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 bg-background/70 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Rocket className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-bold tracking-tight">NovaPrep</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-2 rounded-lg hover:bg-muted"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-background/90 backdrop-blur-xl animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-72 bg-sidebar border-l border-sidebar-border p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end">
              <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-4 space-y-1">
              {items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50",
                    ].join(" ")
                  }
                >
                  <it.icon className="h-4 w-4" />
                  <span className="font-medium">{it.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
