## ADDED Requirements

### Requirement: Mobile users can join teams through a native-feeling flow

The system SHALL allow an authenticated mobile user to redeem a valid team invite and begin working in the joined workspace through a mobile-appropriate interaction flow.

#### Scenario: Mobile user joins a team

- **WHEN** an authenticated user submits a valid invite from the mobile client
- **THEN** the system redeems the invite, refreshes available workspaces, and makes the joined team immediately available in the mobile workspace experience

#### Scenario: Mobile user submits an invalid invite

- **WHEN** an authenticated user submits an invalid, expired, or revoked invite from the mobile client
- **THEN** the system reports the failure in the mobile UI and does not expose the target team's tasks or metadata

### Requirement: Mobile users can create team invites from a team workspace

The system SHALL allow an authenticated mobile user who is currently in a team workspace they belong to create a shareable invite through the mobile client.

#### Scenario: Mobile user creates an invite

- **WHEN** an authenticated mobile user creates an invite while viewing a team workspace they belong to
- **THEN** the system issues the invite through the shared backend path and returns a shareable invite code or link in the mobile client

#### Scenario: Mobile user is in personal workspace

- **WHEN** an authenticated mobile user is viewing their personal workspace
- **THEN** the mobile client does not expose team-invite creation for that workspace

### Requirement: Mobile users can browse shared workspace actions without web-style routing

The system SHALL expose mobile-appropriate entry points for my workspace, joined teams, create team, and join team actions without requiring the exact same route structure used on the web client.

#### Scenario: Mobile user switches between personal and team workspaces

- **WHEN** an authenticated user changes the active workspace in the mobile client
- **THEN** the mobile client loads the corresponding task scope and updates create, edit, complete, and delete actions to target that workspace

#### Scenario: Mobile user needs join and create entry points

- **WHEN** an authenticated mobile user opens the workspace-navigation area of the app
- **THEN** the mobile client presents discoverable entry points for join team and create team flows using mobile-appropriate navigation
