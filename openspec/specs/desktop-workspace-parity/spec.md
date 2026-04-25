# desktop-workspace-parity Specification

## Purpose

TBD - created by archiving change extend-desktop-workspace-parity. Update Purpose after archive.

## Requirements

### Requirement: Desktop users can create and share team invites

The system SHALL allow an authenticated desktop user who is viewing a team workspace they belong to create a reusable team invite from the Electron client.

#### Scenario: Desktop user creates a team invite

- **WHEN** an authenticated desktop user creates an invite while viewing a team workspace they belong to
- **THEN** the system creates the invite through the shared backend path and shows a shareable invite code or link in the desktop shell

#### Scenario: Desktop user is not in a team workspace

- **WHEN** an authenticated desktop user is viewing their personal workspace
- **THEN** the desktop shell does not expose team-invite creation for that workspace

### Requirement: Desktop users can redeem valid team invites

The system SHALL allow an authenticated desktop user to redeem a valid invite from the Electron client and immediately work in the joined team workspace.

#### Scenario: Desktop user redeems a valid invite

- **WHEN** an authenticated desktop user submits a valid invite from the desktop shell
- **THEN** the system creates or reuses the membership, refreshes the available workspaces, and focuses the joined team workspace in the desktop client

#### Scenario: Desktop user redeems an invalid invite

- **WHEN** an authenticated desktop user submits an invalid, expired, or revoked invite from the desktop shell
- **THEN** the system reports the failure in the desktop client and does not expose the target team's tasks or metadata

### Requirement: Desktop workspace organization matches current shared outcomes

The system SHALL expose lightweight workspace-organization affordances on desktop so users can find and manage joined-team work without needing the web shell.

#### Scenario: Desktop user joins a new team

- **WHEN** an authenticated desktop user successfully redeems an invite
- **THEN** the joined team becomes available in the desktop workspace controls without requiring sign-out or restart

#### Scenario: Desktop user returns to a joined team

- **WHEN** an authenticated desktop user switches between their personal workspace and a joined team workspace
- **THEN** the desktop client scopes create, edit, complete, and delete actions to the currently selected workspace
