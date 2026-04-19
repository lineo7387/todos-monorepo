# Mobile App Target

This workspace reserves the React Native client for the cross-platform todos project.

Current responsibilities:

- Host the mobile shell and navigation for authentication and task management.
- Read Supabase configuration from `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- During local development, Expo also falls back to the monorepo root `.env.local` or `.env` and maps `VITE_SUPABASE_*` values into the Expo public env names.
- Depend on `todo-domain`, `todo-data`, and `todo-app` so business rules stay aligned with web and desktop.
- Start through Expo with `vp run mobile#start`.

Run checks with `vp run mobile#check`.
