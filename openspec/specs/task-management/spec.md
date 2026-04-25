## Purpose

Define personal and team todo management behavior, including filtering and lightweight due-date task organization.

## Requirements

### Requirement: Users can manage personal todo items

The system SHALL allow an authenticated user to create, view, update, complete, uncomplete, and delete todo items associated with that user's personal workspace, including an optional `dueDate` used for lightweight time-based organization. Supported clients that expose advanced task organization, including the desktop client, SHALL let the user set or edit that optional due date through the client UI.

#### Scenario: User creates a todo item

- **WHEN** an authenticated user submits a valid new todo title
- **THEN** the system creates a new todo item owned by that user and displays it in the task list

#### Scenario: User updates a todo item

- **WHEN** an authenticated user edits the title, completion state, or optional due date of an existing todo item they own
- **THEN** the system persists the updated todo item and shows the new state in the interface

#### Scenario: User deletes a todo item

- **WHEN** an authenticated user deletes a todo item they own
- **THEN** the system removes the todo item from the user's task list and persistent storage

### Requirement: Users can manage team todo items

The system SHALL allow an authenticated team member to create, view, update, complete, uncomplete, and delete todo items associated with a team workspace they belong to, including an optional `dueDate` used for lightweight time-based organization. Supported clients that expose advanced task organization, including the desktop client, SHALL let the user set or edit that optional due date through the client UI.

#### Scenario: User creates a team todo item

- **WHEN** an authenticated user is viewing a team workspace they belong to and submits a valid new todo title
- **THEN** the system creates a new todo item for that team workspace and displays it in the team task list

#### Scenario: User updates a team todo item

- **WHEN** an authenticated team member edits the title, completion state, or optional due date of an existing todo item in that team workspace
- **THEN** the system persists the updated todo item and shows the new state in the interface

#### Scenario: User deletes a team todo item

- **WHEN** an authenticated team member deletes a todo item in a team workspace they belong to
- **THEN** the system removes the todo item from that team task list and persistent storage

### Requirement: Task views support status-based filtering

The system SHALL allow users to filter task lists within a workspace by all, active, and completed items. Clients that expose lightweight organization controls, including web and desktop, SHALL apply the selected filter consistently before rendering task counts, date-view counts, and selected-day inspection.

#### Scenario: User filters to active tasks

- **WHEN** an authenticated user selects the active filter in a personal or team workspace
- **THEN** the system shows only incomplete tasks for the current workspace

#### Scenario: User filters to completed tasks

- **WHEN** an authenticated user selects the completed filter in a personal or team workspace
- **THEN** the system shows only completed tasks for the current workspace

### Requirement: Time-based task views use optional due dates

The system SHALL treat `dueDate` as an optional task field and only include dated tasks in date-based views such as due today, upcoming, overdue, or calendar day inspection. Clients that expose lightweight date views, including web and desktop, SHALL exclude undated tasks from those date-based slices while keeping them visible in the standard workspace list.

#### Scenario: User views date-based tasks

- **WHEN** an authenticated user opens a date-based task view for the current workspace
- **THEN** the system shows only tasks in that workspace that have a due date matching the selected time criteria

#### Scenario: Task has no due date

- **WHEN** a task does not have a due date
- **THEN** the task remains visible in the standard workspace task list but is excluded from date-based task views

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
