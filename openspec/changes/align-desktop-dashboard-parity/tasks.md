## 1. Desktop route and page structure

- [x] 1.1 Add typed desktop route state and route-effect helpers for `dashboard`, `my workspace`, `team list`, `team detail`, `join team`, and `create team`
- [x] 1.2 Refactor the signed-in desktop shell so `dashboard` is the default entry and navigation is expressed through page-level destinations instead of one combined screen
- [x] 1.3 Add desktop dashboard summaries and navigation entry points for `my workspace`, joined teams, `join team`, and `create team`

## 2. Workspace flow relocation

- [x] 2.1 Move the existing personal workspace task surface into a dedicated `my workspace` desktop destination without regressing `dueDate`, filters, or date views
- [x] 2.2 Move the existing team workspace task surface and invite creation UI into a dedicated desktop `team detail` destination
- [x] 2.3 Move desktop invite redemption and team creation into dedicated `join team` and `create team` destinations while preserving the shared workspace-first behavior
- [ ] 2.4 Add safe desktop handling for unavailable team-detail destinations so unauthorized teams do not expose task or team metadata

## 3. Verification

- [ ] 3.1 Add automated coverage for desktop route resolution, dashboard default-entry behavior, and safe team-detail handling
- [ ] 3.2 Run `vp check`, `vp test`, `vp run desktop#check`, and `vp run desktop#build` after implementation changes land
