## Context

The shared workspace shell already defines personal and team workspace sections, and the desktop client already uses sectioned routes for task, date, and team invite views. Web still behaves more like a combined workspace page, while mobile presents task creation, status filters, date filters, selected-date inspection, and team invite controls in one long workspace screen.

The product model remains a lightweight todo workspace. Tasks have an optional `dueDate`; they are not calendar events with start times, end times, drag scheduling, recurrence, or resource allocation. The design must improve focus without accidentally turning the app into a full calendar planner.

All dependency and validation work must go through Vite+. Dependencies are added with `vp add`, installation uses `vp install`, static validation uses `vp check`, and tests use `vp test`.

## Goals / Non-Goals

**Goals:**

- Give web, desktop, and mobile the same practical workspace section model: tasks, date, and team invite where applicable.
- Make the task section the default focused workspace surface for task creation and list management.
- Move date browsing, date summaries, and selected-day task inspection into a dedicated date section.
- Use established UI libraries for calendars, charts, and mobile advanced controls where they reduce brittle hand-written interaction code.
- Keep all existing task CRUD, completion, status filtering, due-date editing, workspace switching, and team invite behavior.
- Preserve cross-client localization and route vocabulary through the shared workspace-shell package.

**Non-Goals:**

- Do not introduce full calendar-event data, time-of-day scheduling, drag-and-drop rescheduling, recurrence, reminders, or external calendar sync in the first implementation.
- Do not replace the shared controller or persisted todo data model.
- Do not require pixel-identical layouts across web, desktop, and mobile.
- Do not add package-manager-specific commands; use Vite+ for dependency and lifecycle work.

## Decisions

### Use sections as the primary focus mechanism

Workspace pages will be organized around `tasks`, `date`, and, for team workspaces, `invite`. Desktop already proves the route shape, so web should adopt section-aware routing and mobile should expose the same destination outcomes through platform-appropriate state/navigation.

Alternative considered: keep a combined workspace page and hide some panels behind accordions. This reduces route work but keeps the same information hierarchy problem and makes mobile harder to simplify.

### Keep task status filtering in the task section

The `all / active / completed` status filter remains on the task section because it directly shapes the task list. Date-specific controls move to the date section. The date section can still respect the current status filter when showing date counts and selected-day tasks, but it should not force all date controls into the task flow.

Alternative considered: move every filter into an advanced filter drawer. That would declutter the page, but status filtering is frequent enough to deserve first-level access.

### Use lightweight calendar libraries before full calendar planners

Web and desktop date sections will use `react-day-picker` for month/day selection. Mobile will use `react-native-calendars` for native-friendly marked dates. FullCalendar is deferred until the product introduces richer event semantics.

Alternative considered: hand-write calendars. This would avoid dependencies but shifts accessibility, date-grid, keyboard, and localization complexity into application code.

### Use Recharts only for lightweight date summaries

Web and desktop can use `recharts` to show task distribution across simple buckets such as today, upcoming, overdue, and unscheduled. The charts are supportive summaries, not the source of truth or the main interaction surface.

Alternative considered: no charts in the first date section. That is simpler, but the date page benefits from an at-a-glance overview once date controls are separated from the task list.

### Use mobile bottom sheets for secondary controls

Mobile should keep the current section's primary actions visible and move lower-frequency filters or advanced options into `@gorhom/bottom-sheet`. This avoids stacked filter cards while preserving access to equivalent outcomes.

Alternative considered: add all controls as horizontal chips. This works for the task status filter but becomes cramped once date and future filter dimensions are added.

## Risks / Trade-offs

- Route expansion can create cross-client drift -> Keep route helpers, section labels, and tests in `workspace-shell`, then adapt each client from the shared contract.
- Calendar dependencies can make the UI feel heavier than the data model -> Limit first use to day selection and date markers; do not add drag scheduling or time-grid views.
- Charts can distract from tasks -> Treat charts as compact summaries and keep selected-date task lists actionable.
- Mobile bottom sheets add gesture and layout complexity -> Use them only for secondary controls and keep task status chips directly visible.
- Existing uncommitted workspace changes may overlap with implementation -> Read current diffs before applying the change and preserve unrelated edits.

## Migration Plan

1. Add dependencies with Vite+: `vp add react-day-picker recharts react-native-calendars @gorhom/bottom-sheet`.
2. Update shared workspace-shell section contracts, labels, and tests first.
3. Move web to section-aware workspace routes and render task/date/invite sections separately.
4. Refine desktop date and invite sections while preserving existing route behavior.
5. Rework mobile workspace screens around section navigation and mobile date/bottom-sheet controls.
6. Run `vp install`, `vp check`, and `vp test`.
7. If a dependency creates platform-specific issues, keep the section architecture and temporarily fall back to a simpler list-based date section while the dependency issue is resolved.

## Open Questions

- Should the first date summary include an overdue bucket immediately, or only today/upcoming/unscheduled until overdue copy is added?
- Should mobile expose section navigation as top tabs within the workspace screen or as a compact segmented control beneath the workspace header?
- Should selected status filter reset when moving between task and date sections, or persist within the workspace session?

## Deferred Follow-Ups

- FullCalendar remains deferred until tasks gain richer calendar-event semantics such as start/end times, recurrence, drag scheduling, or external calendar sync.
- Date charts should stay lightweight for the first pass; weekly or monthly completion trends can be added later once the basic date summary proves useful.
- Additional task organization such as overdue, unscheduled, this week, labels, members, and priority should be treated as advanced filters rather than primary task-page controls.
- `@shopify/flash-list` should only be reassessed if mobile task-list volume or rendering performance shows a real need for virtualized list optimization.
