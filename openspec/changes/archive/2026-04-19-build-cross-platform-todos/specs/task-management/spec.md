## ADDED Requirements

### Requirement: Users can manage personal todo items

The system SHALL allow an authenticated user to create, view, update, complete, uncomplete, and delete todo items associated with that user's personal workspace.

#### Scenario: User creates a todo item

- **WHEN** an authenticated user submits a valid new todo title
- **THEN** the system creates a new todo item owned by that user and displays it in the task list

#### Scenario: User updates a todo item

- **WHEN** an authenticated user edits the title or completion state of an existing todo item they own
- **THEN** the system persists the updated todo item and shows the new state in the interface

#### Scenario: User deletes a todo item

- **WHEN** an authenticated user deletes a todo item they own
- **THEN** the system removes the todo item from the user's task list and persistent storage

### Requirement: Users can manage team todo items

The system SHALL allow an authenticated team member to create, view, update, complete, uncomplete, and delete todo items associated with a team workspace they belong to.

#### Scenario: User creates a team todo item

- **WHEN** an authenticated user is viewing a team workspace they belong to and submits a valid new todo title
- **THEN** the system creates a new todo item for that team workspace and displays it in the team task list

#### Scenario: User updates a team todo item

- **WHEN** an authenticated team member edits the title or completion state of an existing todo item in that team workspace
- **THEN** the system persists the updated todo item and shows the new state in the interface

#### Scenario: User deletes a team todo item

- **WHEN** an authenticated team member deletes a todo item in a team workspace they belong to
- **THEN** the system removes the todo item from that team task list and persistent storage

### Requirement: Task views reflect persisted state

The system SHALL render task lists from persisted workspace data so that personal and team todo state remains consistent across app restarts and device changes.

#### Scenario: User reopens the application

- **WHEN** an authenticated user opens any supported client after previously creating or modifying todo items
- **THEN** the system loads and displays the persisted todo items for the currently selected workspace

#### Scenario: Empty state for new user

- **WHEN** an authenticated user has no todo items
- **THEN** the system shows an empty task list state with an affordance to create the first todo item

#### Scenario: Empty state for team workspace

- **WHEN** an authenticated user opens a team workspace that has no todo items
- **THEN** the system shows an empty task list state with an affordance to create the first team todo item
