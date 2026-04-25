## MODIFIED Requirements

### Requirement: Task views support status-based filtering

The system SHALL allow users to filter task lists within a workspace by all, active, and completed items. Clients that expose lightweight organization controls SHALL keep status filtering available in the focused task section and SHALL apply the selected filter consistently before rendering task counts, date-view counts, and selected-day inspection.

#### Scenario: User filters to active tasks

- **WHEN** an authenticated user selects the active filter in a personal or team workspace task section
- **THEN** the system shows only incomplete tasks for the current workspace

#### Scenario: User filters to completed tasks

- **WHEN** an authenticated user selects the completed filter in a personal or team workspace task section
- **THEN** the system shows only completed tasks for the current workspace

#### Scenario: User opens the task section

- **WHEN** an authenticated user opens the focused task section for a personal or team workspace
- **THEN** the system shows task creation, status filters, and the filtered task list without requiring the user to review date-specific controls first

### Requirement: Time-based task views use optional due dates

The system SHALL treat `dueDate` as an optional task field and only include dated tasks in date-based views such as due today, upcoming, overdue, or calendar day inspection. Clients that expose lightweight date views SHALL render those controls in a dedicated date section while keeping undated tasks visible in the standard workspace task list.

#### Scenario: User views date-based tasks

- **WHEN** an authenticated user opens a date-based task view for the current workspace
- **THEN** the system shows only tasks in that workspace that have a due date matching the selected time criteria

#### Scenario: Task has no due date

- **WHEN** a task does not have a due date
- **THEN** the task remains visible in the standard workspace task list but is excluded from date-based task views

#### Scenario: User selects a calendar date

- **WHEN** an authenticated user selects a date in the workspace date section
- **THEN** the system shows the tasks in that workspace whose optional due date matches the selected calendar day

#### Scenario: User reviews date summaries

- **WHEN** an authenticated user opens the workspace date section on a client that supports visual summaries
- **THEN** the system shows lightweight due-date summary information without introducing full calendar-event scheduling behavior
