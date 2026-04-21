## MODIFIED Requirements

### Requirement: Users can belong to multiple team workspaces

The system SHALL allow an authenticated user to belong to multiple team workspaces in addition to their personal workspace, whether the membership was created when they created the team or when they joined through a valid invite.

#### Scenario: User belongs to multiple teams

- **WHEN** an authenticated user has membership in more than one team workspace
- **THEN** the system exposes each team workspace as a selectable task context alongside the user's personal workspace

#### Scenario: Team creator becomes a member

- **WHEN** a new team workspace is created
- **THEN** the creating user is recorded as a member of that team workspace

#### Scenario: User joins a team through an invite

- **WHEN** an authenticated user successfully redeems a valid invite for a team workspace
- **THEN** the system records that user as a member of the invited team workspace and exposes that workspace as a selectable task context
