## Purpose

Define desktop dashboard parity expectations for signed-in workspace navigation and team-oriented destinations.

## Requirements

### Requirement: Desktop uses dashboard as the signed-in default entry

The system SHALL show `dashboard` as the default signed-in desktop destination instead of opening directly into a combined workspace-management screen.

#### Scenario: Signed-in desktop user opens the app

- **WHEN** an authenticated desktop user opens or restores the Electron client
- **THEN** the desktop shell lands on a dashboard destination with entry points to `my workspace`, joined teams, `join team`, and `create team`

### Requirement: Desktop provides dedicated dashboard-aligned destinations

The system SHALL provide dedicated desktop destinations for `dashboard`, `my workspace`, `team list`, `team detail`, `join team`, and `create team` while preserving the shared workspace-first model.

#### Scenario: Desktop user navigates between major destinations

- **WHEN** an authenticated desktop user moves between the major signed-in desktop destinations
- **THEN** the desktop shell updates the active destination without requiring sign-out or full app reload

#### Scenario: Desktop user opens a team detail destination

- **WHEN** an authenticated desktop user navigates to a joined team's detail destination
- **THEN** the desktop shell focuses that team workspace and shows its team-specific tasks and actions

### Requirement: Desktop signed-in page composition stays aligned with web

The system SHALL keep the major signed-in desktop pages structurally aligned with the current web client, so parity is defined by shared page composition and flow ordering, not only by matching destination names.

#### Scenario: Desktop user opens dashboard

- **WHEN** an authenticated desktop user opens the desktop dashboard
- **THEN** the page presents the same major content regions as web in desktop-appropriate form: dashboard intro, summary stats, destination entry cards, and joined-team quick links

#### Scenario: Desktop user opens join or create team

- **WHEN** an authenticated desktop user opens `join team` or `create team`
- **THEN** the corresponding form is the primary focus of its own dedicated page, with supporting navigation back to dashboard and the broader signed-in team flow

#### Scenario: Desktop user opens a workspace page

- **WHEN** an authenticated desktop user opens `my workspace` or a joined `team detail`
- **THEN** the page keeps a dedicated workspace-first layout with page intro, workspace-specific actions, task controls, and the task surface instead of falling back to a generic combined shell

### Requirement: Desktop dashboard structure preserves existing workspace actions

The system SHALL preserve the current desktop invite, join, todo-management, due-date, task-filter, and date-view actions after the shell is reorganized around dashboard-first navigation.

#### Scenario: Desktop user opens my workspace

- **WHEN** an authenticated desktop user navigates to `my workspace`
- **THEN** the desktop shell shows the personal workspace task surface with the same create, edit, complete, delete, due-date, and lightweight organization behavior already supported on desktop

#### Scenario: Desktop user opens a team detail destination

- **WHEN** an authenticated desktop user navigates to a team detail destination
- **THEN** the desktop shell shows the joined team workspace with its existing invite creation, join-derived membership state, and task-management behavior

### Requirement: Desktop destination guards protect unauthorized team access

The system SHALL prevent desktop users from viewing team-detail content for workspaces they do not belong to and redirect them to a safe desktop destination.

#### Scenario: Desktop user attempts to open an unavailable team

- **WHEN** an authenticated desktop user navigates to a team-detail destination for a team workspace that is not in their current memberships
- **THEN** the desktop shell does not expose that team's tasks or metadata and returns the user to a safe destination with explanatory feedback
