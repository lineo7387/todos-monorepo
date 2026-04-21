## Why

The mobile client still exposes only the baseline shared workspace shell, while web has already added team invite flows and lightweight task organization and desktop now has a dedicated parity plan. If mobile is not planned before internationalization lands, we will end up translating screens that are still structurally incomplete and pay the i18n cost twice.

## What Changes

- Define the mobile-first interaction model for joining a team, creating an invite, and returning to joined workspaces without requiring the web route structure.
- Add a mobile capability plan for optional `dueDate`, status filters, and lightweight date-based task organization that fits React Native interaction patterns.
- Establish how mobile navigation should express dashboard-like entry points, workspace switching, create team, and join team flows using platform-appropriate navigation rather than direct web-style pages.
- Identify the mobile verification scope needed before or alongside future internationalization so translated strings do not have to be reworked around unstable flows.
- Keep implementation out of this planning change; the goal is to make the mobile parity work executable immediately after desktop parity stabilizes.

## Capabilities

### New Capabilities

- `mobile-workspace-parity`: Mobile-specific invite, join, and lightweight task-organization behavior aligned with the shared workspace model

### Modified Capabilities

- `multi-platform-clients`: Cross-client parity requirements expand so the mobile client must expose the same practical team-join and task-organization outcomes even when mobile navigation differs from web and desktop
- `task-management`: Task-management requirements expand to require mobile exposure of optional `dueDate` and a mobile-appropriate lightweight organization experience

## Impact

- Affects `apps/mobile/src/App.tsx`, mobile navigation structure, and any extracted React Native view helpers
- May require small shared helper extraction only where parity rules are presentation-agnostic, while keeping mobile interaction state local to the mobile client
- Establishes the recommended sequencing before the future bilingual i18n change so localization keys map onto stable mobile flows
