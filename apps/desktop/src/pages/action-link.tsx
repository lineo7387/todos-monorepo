import type { ReactNode } from "react";

import type { DesktopRoute } from "../routing/routes.ts";

interface DesktopActionLinkProps {
  children: ReactNode;
  className?: string;
  onNavigate: (route: DesktopRoute) => void;
  route: DesktopRoute;
}

export function DesktopActionLink({
  children,
  className,
  onNavigate,
  route,
}: DesktopActionLinkProps) {
  return (
    <button className={className} onClick={() => onNavigate(route)} type="button">
      {children}
    </button>
  );
}
