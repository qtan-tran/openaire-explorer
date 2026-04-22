import { NavLink } from "react-router-dom";
import { Github, Search, BarChart2, GitCompareArrows, Info } from "lucide-react";
import clsx from "clsx";
import { ThemeToggle } from "../ui/ThemeToggle";
import { Container } from "./Container";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/search",   label: "Search",   icon: <Search     className="h-4 w-4" aria-hidden /> },
  { to: "/compare",  label: "Compare",  icon: <GitCompareArrows className="h-4 w-4" aria-hidden /> },
  { to: "/analytics",label: "Analytics",icon: <BarChart2  className="h-4 w-4" aria-hidden /> },
  { to: "/about",    label: "About",    icon: <Info       className="h-4 w-4" aria-hidden /> },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <Container>
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Brand */}
          <NavLink
            to="/"
            className="flex items-center gap-2 font-semibold text-foreground hover:text-accent transition-colors"
            aria-label="OpenAIRE Explorer home"
          >
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white text-xs font-bold"
              aria-hidden
            >
              OA
            </span>
            <span className="hidden sm:inline">OpenAIRE Explorer</span>
          </NavLink>

          {/* Primary navigation */}
          <nav aria-label="Main navigation">
            <ul className="flex items-center gap-1" role="list">
              {NAV_ITEMS.map(({ to, label, icon }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      clsx(
                        "flex items-center gap-1.5 rounded-lg px-3 py-2",
                        "text-sm font-medium transition-colors duration-150",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
                        isActive
                          ? "bg-accent/10 text-accent"
                          : "text-text-secondary hover:text-foreground hover:bg-bg-secondary"
                      )
                    }
                  >
                    {icon}
                    <span className="hidden md:inline">{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            <a
              href="https://github.com/qtan-tran/openaire-explorer"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View source on GitHub (opens in new tab)"
              className={clsx(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                "text-text-secondary hover:text-foreground hover:bg-bg-secondary",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              )}
            >
              <Github className="h-4 w-4" aria-hidden />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </Container>
    </header>
  );
}
