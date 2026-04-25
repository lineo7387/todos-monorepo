## Purpose

Define team workspace membership, access boundaries, and team-scoped task visibility.

## Requirements

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

### Requirement: Team workspace access is limited to members

The system SHALL only expose a team workspace and its tasks to authenticated users who are members of that team.

#### Scenario: Team member opens shared workspace

- **WHEN** an authenticated team member selects a team workspace they belong to
- **THEN** the system loads the team metadata and tasks for that workspace

#### Scenario: Non-member attempts access

- **WHEN** an authenticated user attempts to access a team workspace they do not belong to
- **THEN** the system does not expose the team metadata or tasks and denies the request

### Requirement: Team members share the same task outcomes

The system SHALL persist team task changes at the workspace level so all members observe the same task state.

#### Scenario: Team member completes a task

- **WHEN** one member of a team workspace completes a team todo item
- **THEN** the completed state is persisted for that team workspace and becomes visible to other team members

#### Scenario: Team member deletes a task

- **WHEN** one member of a team workspace deletes a team todo item
- **THEN** the task is removed from the workspace for all members of that team
