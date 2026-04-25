## Purpose

Define team invite creation and redemption behavior for authenticated users and team workspaces.

## Requirements

### Requirement: Team members can generate team invites

The system SHALL allow an authenticated member of a team workspace to generate a valid invite that can be used by another authenticated user to join that team.

#### Scenario: Team member creates an invite

- **WHEN** an authenticated user creates an invite for a team workspace they belong to
- **THEN** the system issues an active invite associated with that team and returns a shareable invite token or link

#### Scenario: Non-member attempts to create an invite

- **WHEN** an authenticated user attempts to create an invite for a team workspace they do not belong to
- **THEN** the system denies the request and does not create an invite

### Requirement: Authenticated users can accept valid team invites

The system SHALL allow an authenticated user to redeem a valid team invite and become a member of the target team workspace.

#### Scenario: User accepts a valid invite

- **WHEN** an authenticated user submits a valid active invite for a team they do not already belong to
- **THEN** the system creates a membership for that user in the target team workspace

#### Scenario: Existing member reuses invite

- **WHEN** an authenticated user submits a valid active invite for a team they already belong to
- **THEN** the system does not create a duplicate membership and keeps the team available in that user's workspace list

### Requirement: Invalid invites are rejected safely

The system SHALL reject invite redemption attempts when the invite is invalid, expired, or revoked without exposing protected team workspace data.

#### Scenario: User submits an expired invite

- **WHEN** an authenticated user submits an invite that has expired
- **THEN** the system rejects the join attempt and reports that the invite is no longer valid

#### Scenario: User submits a revoked invite

- **WHEN** an authenticated user submits an invite that has been revoked
- **THEN** the system rejects the join attempt and does not create a team membership

#### Scenario: User submits an unknown invite

- **WHEN** an authenticated user submits an invite that does not match an active stored invite
- **THEN** the system rejects the join attempt and does not expose the target team's metadata or tasks
