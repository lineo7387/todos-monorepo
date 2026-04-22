import { BrowserRouter } from "react-router-dom";

import { WebsiteAppShell } from "../shell/website-shell.tsx";

export function App() {
  return (
    <BrowserRouter>
      <WebsiteAppShell />
    </BrowserRouter>
  );
}
