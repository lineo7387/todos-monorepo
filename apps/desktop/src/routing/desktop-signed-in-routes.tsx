import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";

export interface DesktopSignedInRoutesProps {
  createTeamPage: ReactNode;
  dashboardPage: ReactNode;
  joinTeamPage: ReactNode;
  personalWorkspacePage: ReactNode;
  teamListPage: ReactNode;
  teamWorkspacePage: ReactNode;
}

export function DesktopSignedInRoutes({
  createTeamPage,
  dashboardPage,
  joinTeamPage,
  personalWorkspacePage,
  teamListPage,
  teamWorkspacePage,
}: DesktopSignedInRoutesProps) {
  return (
    <Routes>
      <Route element={dashboardPage} path="/" />
      <Route element={personalWorkspacePage} path="/my-workspace" />
      <Route element={personalWorkspacePage} path="/my-workspace/tasks" />
      <Route element={personalWorkspacePage} path="/my-workspace/date" />
      <Route element={teamListPage} path="/teams" />
      <Route element={teamWorkspacePage} path="/teams/:teamId" />
      <Route element={teamWorkspacePage} path="/teams/:teamId/tasks" />
      <Route element={teamWorkspacePage} path="/teams/:teamId/date" />
      <Route element={teamWorkspacePage} path="/teams/:teamId/invite" />
      <Route element={joinTeamPage} path="/teams/join" />
      <Route element={createTeamPage} path="/teams/new" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
