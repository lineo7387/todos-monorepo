export function AuthHeroPanel() {
  return (
    <section className="hero-panel">
      <p className="hero-panel__eyebrow">Cross-platform todos</p>
      <h1>Shared workspace flows for the web client.</h1>
      <p className="hero-panel__body">
        This browser shell is wired to the shared auth, sync, optimistic update, and workspace state
        flow from the monorepo packages.
      </p>

      <div className="hero-panel__highlights" role="list">
        <div role="listitem">
          <strong>Web parity</strong>
          <span>
            Sign-in, workspace switching, create team, and todo CRUD stay aligned with the desktop
            and mobile clients.
          </span>
        </div>
        <div role="listitem">
          <strong>Supabase-backed</strong>
          <span>
            Auth, persisted todos, and workspace membership all reuse the same shared adapters.
          </span>
        </div>
        <div role="listitem">
          <strong>Browser-ready</strong>
          <span>
            Session restore and route-driven workspace flows are available directly in the web
            shell.
          </span>
        </div>
      </div>
    </section>
  );
}
