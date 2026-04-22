import type { FormEvent } from "react";
import { WorkspaceShellCreateTeamPage } from "workspace-shell";

import type { DesktopRoute } from "../routing/routes.ts";
import { DesktopActionLink } from "./action-link.tsx";

export interface DesktopCreateTeamPageProps {
  canManageTodos: boolean;
  draftTeamName: string;
  onDraftTeamNameChange: (value: string) => void;
  onNavigate: (route: DesktopRoute) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function DesktopCreateTeamPage({
  canManageTodos,
  draftTeamName,
  onDraftTeamNameChange,
  onNavigate,
  onSubmit,
}: DesktopCreateTeamPageProps) {
  return (
    <WorkspaceShellCreateTeamPage
      canManageTodos={canManageTodos}
      draftTeamName={draftTeamName}
      onDraftTeamNameChange={onDraftTeamNameChange}
      onSubmit={onSubmit}
      renderNavigationAction={({ className, label, route }) => (
        <DesktopActionLink
          className={className}
          onNavigate={onNavigate}
          route={route as DesktopRoute}
        >
          {label}
        </DesktopActionLink>
      )}
    />
  );
}
