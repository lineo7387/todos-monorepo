## ADDED Requirements

### Requirement: Users authenticate before accessing workspace task data

The system SHALL require users to authenticate through Supabase before they can access or mutate persisted personal or team todo data.

#### Scenario: Unauthenticated user opens application

- **WHEN** a user is not signed in and opens a supported client
- **THEN** the system prompts the user to authenticate before showing persisted todo data

#### Scenario: Authenticated user session restored

- **WHEN** a previously authenticated user returns with a valid session
- **THEN** the system restores the session and loads that user's persisted todo data

### Requirement: Task data synchronizes through Supabase across clients

The system SHALL store todo items and team membership state in Supabase and make the latest persisted personal or team workspace state available across supported clients for the authenticated user.

#### Scenario: User adds a personal task on one client

- **WHEN** an authenticated user creates a new personal todo item on one supported client
- **THEN** the new todo item is persisted in Supabase and becomes available when the same user opens another supported client

#### Scenario: User adds a team task on one client

- **WHEN** an authenticated user creates a new team todo item on one supported client while viewing a team they belong to
- **THEN** the new todo item is persisted in Supabase and becomes available when that user or another member of the same team opens another supported client

#### Scenario: User accepts a valid team invite

- **WHEN** an authenticated user successfully redeems a valid team invite on one supported client
- **THEN** the resulting team membership is persisted in Supabase and the joined team workspace becomes available when that user opens another supported client

#### Scenario: User accesses a team they do not belong to

- **WHEN** an authenticated user attempts to query or mutate a team workspace they are not a member of
- **THEN** the system denies access and does not expose that team's tasks

#### Scenario: Invalid invite redemption fails

- **WHEN** an authenticated user attempts to redeem an invalid, expired, or revoked team invite
- **THEN** the system reports the failure and does not persist a new team membership

#### Scenario: Mutation conflict or failure

- **WHEN** a task mutation cannot be persisted successfully
- **THEN** the system informs the user that synchronization failed and restores or refreshes task state from the latest persisted data
