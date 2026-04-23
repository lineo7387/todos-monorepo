import type { ReactNode } from "react";

export interface WorkspaceShellRouteCardProps {
  body: string;
  children?: ReactNode;
  eyebrow: string;
  title: string;
}

export function WorkspaceShellRouteCard({
  body,
  children,
  eyebrow,
  title,
}: WorkspaceShellRouteCardProps) {
  return (
    <>
      <p className="page-eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <p>{body}</p>
      {children}
    </>
  );
}
