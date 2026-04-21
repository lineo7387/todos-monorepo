## MODIFIED Requirements

### Requirement: Authenticated users can navigate workspaces through dedicated pages

The system SHALL provide dedicated signed-in destinations for dashboard, personal workspace, team list, team detail, join team, and create team flows instead of relying solely on a single combined workspace screen. Web SHALL use URL-backed routes for these destinations, and desktop SHALL expose the same destination model through explicit local route state.

#### Scenario: Signed-in user opens the app

- **WHEN** an authenticated user opens a supported client with page navigation
- **THEN** the system shows a dashboard entry point with navigation to the user's personal workspace, joined teams, and team join/create actions

#### Scenario: User opens a team detail page

- **WHEN** an authenticated user navigates to a team workspace they belong to
- **THEN** the system loads that team workspace as a dedicated detail page with its task list and team-specific actions

### Requirement: Team list navigation reflects current memberships

The system SHALL provide a team list view that shows the team workspaces the authenticated user currently belongs to.

#### Scenario: User views joined teams

- **WHEN** an authenticated user opens the team list page
- **THEN** the system shows the team workspaces currently associated with that user's memberships

#### Scenario: User joins a new team

- **WHEN** an authenticated user successfully joins a team through a valid invite
- **THEN** the joined team appears in the team list and can be opened as a dedicated team detail page

### Requirement: Navigation routes enforce workspace access rules

The system SHALL preserve existing membership-based access controls when users navigate directly to personal or team pages. Web SHALL enforce this through URL route handling, and desktop SHALL enforce the same rule through local destination resolution.

#### Scenario: User opens personal workspace page

- **WHEN** an authenticated user navigates to the personal workspace page
- **THEN** the system loads that user's personal workspace tasks

#### Scenario: User opens an unauthorized team page

- **WHEN** an authenticated user navigates directly to a team page for a workspace they do not belong to
- **THEN** the system denies access, does not expose the team's tasks, and returns the user to a safe navigation state
