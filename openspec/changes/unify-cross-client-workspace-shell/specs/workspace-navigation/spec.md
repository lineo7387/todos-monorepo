## MODIFIED Requirements

### Requirement: Authenticated users can navigate workspaces through dedicated pages

The system SHALL provide dedicated signed-in destinations for dashboard, personal workspace, team list, team detail, join team, and create team flows instead of relying solely on a single combined workspace screen. Web and desktop SHALL consume the same canonical destination vocabulary and explicit route structure, while mobile SHALL expose the same destinations through platform-appropriate navigation semantics.

#### Scenario: Signed-in user opens the app

- **WHEN** an authenticated user opens a supported client with page navigation
- **THEN** the system shows a dashboard entry point with navigation to the user's personal workspace, joined teams, and team join/create actions

#### Scenario: User opens a team detail page

- **WHEN** an authenticated user navigates to a team workspace they belong to
- **THEN** the system loads that team workspace as a dedicated detail page with its task list and team-specific actions

#### Scenario: User switches between supported clients

- **WHEN** an authenticated user moves between web, desktop, and mobile while signed in
- **THEN** all supported clients present the same destination vocabulary and practical flow order for dashboard, my workspace, joined teams, join team, and create team, even if the navigation chrome differs by platform

### Requirement: Navigation routes enforce workspace access rules

The system SHALL preserve existing membership-based access controls when users navigate directly to personal or team pages. Web and desktop SHALL enforce this through explicit route handling, and mobile SHALL enforce the same rules through its navigation state resolution.

#### Scenario: User opens personal workspace page

- **WHEN** an authenticated user navigates to the personal workspace page
- **THEN** the system loads that user's personal workspace tasks

#### Scenario: User opens an unauthorized team page

- **WHEN** an authenticated user navigates to a team page or equivalent team-detail destination for a workspace they do not belong to
- **THEN** the system denies access, does not expose that team's tasks or metadata, and returns the user to a safe navigation state
