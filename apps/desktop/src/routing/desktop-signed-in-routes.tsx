import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import type { WorkspaceShellPageId } from "workspace-shell";

import { getDesktopSignedInRoutePatterns } from "./desktop-route-adapter.ts";

export type DesktopSignedInPageElements = Record<WorkspaceShellPageId, ReactNode>;

export interface DesktopSignedInRoutesProps {
  pages: DesktopSignedInPageElements;
}

const desktopSignedInRoutePatterns = getDesktopSignedInRoutePatterns();

export function DesktopSignedInRoutes({ pages }: DesktopSignedInRoutesProps) {
  return (
    <Routes>
      {desktopSignedInRoutePatterns.map((routePattern) => (
        <Route
          element={pages[routePattern.pageId]}
          key={routePattern.key}
          path={routePattern.path}
        />
      ))}
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
