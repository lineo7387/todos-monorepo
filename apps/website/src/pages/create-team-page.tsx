import type { FormEvent } from "react";
import { WorkspaceShellCreateTeamPage } from "workspace-shell";

import type { WebsiteRoute } from "../routing/routes.ts";
import { RouteLink } from "./route-link.tsx";

export interface CreateTeamPageProps {
  canManageTodos: boolean;
  draftTeamName: string;
  onDraftTeamNameChange: (value: string) => void;
  onNavigate: (route: WebsiteRoute) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function CreateTeamPage({
  canManageTodos,
  draftTeamName,
  onDraftTeamNameChange,
  onNavigate,
  onSubmit,
}: CreateTeamPageProps) {
  return (
    <WorkspaceShellCreateTeamPage
      canManageTodos={canManageTodos}
      draftTeamName={draftTeamName}
      onDraftTeamNameChange={onDraftTeamNameChange}
      onSubmit={onSubmit}
      renderNavigationAction={({ className, label, route }) => (
        <RouteLink className={className} onNavigate={onNavigate} route={route as WebsiteRoute}>
          {label}
        </RouteLink>
      )}
    />
  );
}
