import type { MouseEvent, ReactNode } from "react";

import { getWebsiteRouteHref, type WebsiteRoute } from "../routing/routes.ts";

interface RouteLinkProps {
  children: ReactNode;
  className?: string;
  onNavigate: (route: WebsiteRoute) => void;
  route: WebsiteRoute;
}

export function RouteLink({ children, className, onNavigate, route }: RouteLinkProps) {
  const href = getWebsiteRouteHref(route);

  return (
    <a
      className={className}
      href={href}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        event.preventDefault();
        onNavigate(route);
      }}
    >
      {children}
    </a>
  );
}
