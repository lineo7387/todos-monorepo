## Context

The current product model already supports team membership through invites, optional `dueDate`, status filters, and lightweight date views, but only the web client fully exposes those behaviors today. The mobile shell is still a simpler React Native surface with sign-in, workspace selection, and task CRUD. That makes mobile the next design pressure point: it needs stronger parity, but it should not inherit the web route hierarchy blindly.

This planning change exists to lock down the mobile approach before the repository grows another cross-cutting concern such as bilingual localization. Once i18n starts, any instability in screen structure, flow naming, or interaction boundaries will turn into repeated translation-key churn across React Native components.

## Goals / Non-Goals

**Goals:**

- Define how mobile should expose join team, create invite, create team, and workspace browsing using mobile-appropriate navigation.
- Define how optional `dueDate`, status filters, and lightweight date organization should appear on mobile without expanding into a full calendar planner.
- Keep mobile tied to the existing shared `todo-app` and `todo-data` model rather than introducing a mobile-only business layer.
- Produce an implementation-ready task breakdown that can begin after desktop parity work or in parallel with later i18n planning.

**Non-Goals:**

- Implement the mobile parity work in this change.
- Force mobile to mirror the exact page breakdown used on web.
- Introduce new backend contracts, additional roles, or richer scheduling features.
- Fully design the bilingual localization system; this change only protects mobile from becoming unstable before i18n.

## Decisions

### Use mobile-native navigation semantics instead of copying web routes

Mobile should express dashboard-like overview, my workspace, team browsing, join team, and create team through stack or tab navigation semantics that feel native to React Native. The outcome parity matters more than URL parity.

Alternatives considered:

- Mirror the web route tree exactly: rejected because it optimizes for implementation similarity over mobile usability.
- Keep the current single-screen mobile shell forever: rejected because it cannot cleanly absorb invite and date-organization flows.

### Keep core business state in shared packages and mobile UI state local

Join/invite mutations, workspace membership refresh, due-date validation, and task mutations should continue to run through the shared controller. Mobile-only concerns such as active tab, expanded cards, selected day, and transient sheet state should remain local to the React Native screen tree.

Alternatives considered:

- Add a separate mobile global state store for all UI concerns: rejected because it duplicates the shared controller and increases parity drift risk.
- Move mobile presentation choices into shared packages: rejected because web, desktop, and mobile interaction models differ too much.

### Stage mobile parity in two implementation slices

The future implementation should likely land in two slices: first invite/join plus stable workspace navigation, then due-date and lightweight task organization. This keeps the mobile UI scope manageable and allows i18n planning to target more stable screen shapes.

Alternatives considered:

- Deliver all mobile parity in one large change: rejected because it increases regression risk and makes validation harder.
- Delay mobile until after i18n implementation: rejected because localization on unstable mobile flows will create unnecessary churn.

### Keep date organization lightweight on mobile

Mobile should support the same underlying `dueDate`, `all / active / completed`, and `all tasks / due today / upcoming` concepts, but the UI may use chips, segmented controls, or bottom sheets rather than the web's panel layout. Selected-day inspection should remain a lightweight list-based view, not a full calendar surface.

Alternatives considered:

- Skip date organization on mobile entirely: rejected because parity would remain materially incomplete.
- Build a mobile calendar-first planner: rejected because it exceeds the current product scope.

## Risks / Trade-offs

- [Mobile parity becomes a web clone with awkward interaction patterns] -> Mitigation: design to shared outcomes, not identical layout.
- [Navigation decisions made too late will force i18n key rewrites] -> Mitigation: finish mobile planning before the bilingual localization change starts implementation.
- [Shared controller assumptions may not fit mobile interaction pacing] -> Mitigation: keep shared business rules, but isolate mobile presentation helpers where needed.
- [Join and invite UI could overcrowd smaller screens] -> Mitigation: stage the implementation and use dedicated mobile screens or sheets for secondary flows.

## Migration Plan

1. Capture the mobile parity contract in proposal, specs, design, and tasks.
2. Use this plan as the implementation blueprint after desktop parity stabilizes.
3. Reassess bilingual localization scope once mobile screen structure is settled enough for translation keys.
4. Roll back by leaving mobile on the current baseline shell; no backend migration is required because this planning change adds no code.

## Open Questions

- Should mobile expose a dashboard overview as a real first screen, or should the first parity pass keep users on a workspace-focused landing screen with secondary entry points?
- Should join team live as its own screen, a modal sheet, or an action nested under team browsing?
- Is invite creation on mobile important in the first implementation slice, or can it follow just after mobile join support if screen density becomes a concern?
