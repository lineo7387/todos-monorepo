## Why

Teams and individual users increasingly expect the same todo workflow to follow them across browser, mobile, and desktop without losing data or context. Extending the existing monorepo into a multi-platform todo system lets us define a shared product contract early, avoid platform drift, and establish a backend model that supports real-time sync and account-based access.

The initial implementation focused on personal todos owned by a single authenticated user. Product requirements have now expanded: the same application must also support team-owned todo spaces where multiple members can view and manage the same shared task list. Capturing that scope in OpenSpec before continuing implementation keeps the database model, RLS rules, and cross-platform clients aligned.

## What Changes

- Introduce a new todo product that supports creating, editing, completing, and organizing both personal tasks and team-shared tasks.
- Define a shared multi-platform experience delivered through React for web, React Native for mobile apps, and Electron for desktop.
- Add Supabase-backed authentication, persistent storage, and cross-device synchronization for user data.
- Add shared workspace concepts for teams, team membership, and task ownership scope so client applications can switch between personal and team task views.
- Establish shared product and architecture requirements so client applications can reuse domain models, API contracts, and interaction patterns within the existing monorepo workspace.

## Capabilities

### New Capabilities

- `task-management`: Users can create, update, complete, uncomplete, and delete todo items in either personal or team scopes, with task state persisted through Supabase.
- `multi-platform-clients`: Users can access the todo experience from web, mobile, and desktop clients with consistent core behavior and navigation expectations.
- `account-sync`: Users can sign in and have their todo data stored and synchronized through Supabase across supported clients.
- `team-workspaces`: Users can belong to multiple teams and access shared team todo spaces in addition to their personal task list.

### Modified Capabilities

- None.

## Impact

- Affected code includes extending the current monorepo with new frontend apps for React Native mobile and Electron desktop, evolving the existing web app, and adding shared packages for domain logic and UI conventions.
- Adds Supabase as the primary backend dependency for authentication, database access, and sync-oriented data flows.
- Expands the data model to include teams, team membership, and scope-aware task ownership plus new RLS policies for shared workspaces.
- Requires application shell updates so each client can present a workspace switcher and preserve feature parity between personal and team task flows.
