import type { ReactNode } from "react";
import clsx from "clsx";
import { Header } from "./Header";
import { Container } from "./Container";

export interface AppShellProps {
  children: ReactNode;
  /** Optional sidebar rendered to the left of main content */
  sidebar?: ReactNode;
  /** Replace the default Header with a custom element */
  header?: ReactNode;
  containerClassName?: string;
}

export function AppShell({
  children,
  sidebar,
  header,
  containerClassName,
}: AppShellProps) {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      {/* Header */}
      {header ?? <Header />}

      {/* Body */}
      <Container
        as="main"
        id="main-content"
        tabIndex={-1}
        className={clsx(
          "flex flex-1 gap-6 py-6 focus-visible:outline-none",
          containerClassName
        )}
      >
        {sidebar && (
          <aside
            className="hidden lg:flex w-56 shrink-0 flex-col gap-2"
            aria-label="Sidebar"
          >
            {sidebar}
          </aside>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {children}
        </div>
      </Container>
    </div>
  );
}
