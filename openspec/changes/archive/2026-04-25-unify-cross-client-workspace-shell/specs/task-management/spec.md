## MODIFIED Requirements

### Requirement: Task views support status-based filtering

The system SHALL allow users to filter task lists within a workspace by all, active, and completed items on every supported client.

#### Scenario: User filters to active tasks

- **WHEN** an authenticated user selects the active filter in a personal or team workspace
- **THEN** the system shows only incomplete tasks for the current workspace

#### Scenario: User filters to completed tasks

- **WHEN** an authenticated user selects the completed filter in a personal or team workspace
- **THEN** the system shows only completed tasks for the current workspace

#### Scenario: Mobile user filters workspace tasks

- **WHEN** an authenticated mobile user changes the task-status filter for the current workspace
- **THEN** the mobile client applies the same all, active, and completed semantics already supported on web and desktop

### Requirement: Time-based task views use optional due dates

The system SHALL treat `dueDate` as an optional task field and only include dated tasks in date-based views such as due today, upcoming, overdue, or calendar day inspection. Every supported client SHALL expose lightweight due-date-aware task organization without expanding into a full calendar planner.

#### Scenario: User views date-based tasks

- **WHEN** an authenticated user opens a date-based task view for the current workspace
- **THEN** the system shows only tasks in that workspace that have a due date matching the selected time criteria

#### Scenario: Task has no due date

- **WHEN** a task does not have a due date
- **THEN** the task remains visible in the standard workspace task list but is excluded from date-based task views

#### Scenario: Mobile user inspects dated tasks

- **WHEN** an authenticated mobile user opens due-today, upcoming, or selected-day task inspection for the current workspace
- **THEN** the mobile client applies the same due-date inclusion rules used by web and desktop while keeping the interaction lightweight rather than providing a full calendar product
