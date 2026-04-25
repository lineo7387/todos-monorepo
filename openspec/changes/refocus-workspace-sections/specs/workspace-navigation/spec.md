## MODIFIED Requirements

### Requirement: Authenticated users can navigate workspaces through dedicated pages

The system SHALL provide dedicated signed-in destinations for dashboard, personal workspace, team list, team detail, join team, and create team flows instead of relying solely on a single combined workspace screen. Web and desktop SHALL consume the same canonical destination vocabulary and explicit route structure, while mobile SHALL expose the same destinations through platform-appropriate navigation semantics. Personal workspace and team detail destinations SHALL expose focused task and date sections, and team detail destinations SHALL also expose an invite section for team-specific sharing actions.

#### Scenario: Signed-in user opens the app

- **WHEN** an authenticated user opens a supported client with page navigation
- **THEN** the system shows a dashboard entry point with navigation to the user's personal workspace, joined teams, and team join/create actions

#### Scenario: User opens a team detail page

- **WHEN** an authenticated user navigates to a team workspace they belong to
- **THEN** the system loads that team workspace as a dedicated detail page with focused sections for tasks, date-based task inspection, and team-specific invite actions

#### Scenario: User opens a personal workspace task section

- **WHEN** an authenticated user navigates to the personal workspace task section
- **THEN** the system shows task creation, status filtering, and the task list without also exposing date-inspection panels as primary content

#### Scenario: User opens a workspace date section

- **WHEN** an authenticated user navigates to a personal or team workspace date section
- **THEN** the system shows date selection, date-oriented summaries, and selected-date tasks for that workspace without replacing the standard task list behavior

#### Scenario: User switches between supported clients

- **WHEN** an authenticated user moves between web, desktop, and mobile while signed in
- **THEN** all supported clients present the same destination vocabulary and practical flow order for dashboard, my workspace, joined teams, join team, create team, and workspace task/date/invite sections, even if the navigation chrome differs by platform
