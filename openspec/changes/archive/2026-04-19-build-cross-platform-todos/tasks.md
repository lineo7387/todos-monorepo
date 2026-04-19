## 1. Workspace and shared foundation

- [x] 1.1 Extend the existing monorepo by adding app targets for React Native and Electron and identifying the shared package layout for todo features
- [x] 1.2 Define shared todo domain types, validation rules, and repository interfaces for auth and task data
- [x] 1.3 Add environment configuration patterns for Supabase URL, anon key, and platform-specific session storage needs

## 2. Supabase backend integration

- [x] 2.1 Provision the Supabase project schema for user-scoped todo items and document required auth settings
- [x] 2.2 Implement a shared Supabase client adapter and auth/session abstractions usable by all supported clients
- [x] 2.3 Implement shared task queries and mutations for create, update, complete, uncomplete, delete, and refresh flows

## 3. Core user experience

- [x] 3.1 Build the shared application state flow for authenticated task loading, optimistic updates, and mutation error recovery
- [x] 3.2 Implement sign-in, sign-out, empty state, and task list interactions against the shared domain layer
- [x] 3.3 Add validation and user feedback for failed sync, invalid task input, and loading states

## 4. Platform clients

- [x] 4.1 Implement the React web client shell and screens for authentication and todo management
- [x] 4.2 Implement the React Native client shell and screens for authentication and todo management
- [x] 4.3 Implement the Electron desktop shell and screens for authentication and todo management

## 5. Verification and release readiness

- [x] 5.1 Validate feature parity for sign-in and core todo workflows across web, mobile, and desktop clients
- [x] 5.2 Test cross-device persistence and sync behavior using the same authenticated account across multiple clients
- [x] 5.3 Document setup, local development steps, and known first-release limitations for the multi-platform todo system

## 6. Personal and team workspace expansion

- [x] 6.1 Extend the Supabase schema from personal-only todos to scope-aware todos with `teams`, `team_members`, and workspace-aware RLS policies
- [x] 6.2 Update shared domain types, repositories, and application state to support workspace selection plus personal and team-scoped task CRUD
- [x] 6.3 Implement workspace switching and team todo flows on the web client while preserving the current personal todo experience
- [x] 6.4 Implement workspace switching and team todo flows on the React Native client while preserving the current personal todo experience
- [x] 6.5 Implement workspace switching and team todo flows on the Electron client while preserving the current personal todo experience
- [x] 6.6 Validate cross-client parity for personal and team workspaces and document the first-release team collaboration limitations
