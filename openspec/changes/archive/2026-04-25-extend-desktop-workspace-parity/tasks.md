## 1. Desktop invite and join parity

- [x] 1.1 Add desktop UI sections and local state for creating a team invite from the active team workspace
- [x] 1.2 Add desktop UI for redeeming an invite code or link and surfacing success and failure states without exposing unauthorized team data
- [x] 1.3 Refresh desktop workspace selection after successful invite redemption so the joined team is available immediately

## 2. Desktop task-organization parity

- [x] 2.1 Extend the desktop task create and edit flows to support the shared optional `dueDate`
- [x] 2.2 Add desktop-local task filters for `all`, `active`, and `completed`
- [x] 2.3 Add desktop-local date views for `all tasks`, `due today`, and `upcoming`, excluding undated tasks
- [x] 2.4 Add lightweight selected-day inspection on desktop without implementing a full calendar

## 3. Verification

- [x] 3.1 Add automated coverage for desktop invite creation, invite redemption outcomes, and workspace refresh after joining
- [x] 3.2 Add automated coverage for desktop task filtering and `dueDate`-driven views, including exclusion of undated tasks from date-based slices
- [x] 3.3 Run `vp check`, `vp test`, `vp run desktop#check`, and `vp run desktop#build` after implementation changes land
