import { MemoryRouter } from "react-router-dom";

import { DesktopAppShell } from "../shell/desktop-shell.tsx";

export function App() {
  return (
    <MemoryRouter initialEntries={["/"]}>
      <DesktopAppShell />
    </MemoryRouter>
  );
}
