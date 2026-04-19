# Desktop App Target

This workspace hosts the Electron client for the cross-platform todos project.

Current responsibilities:

- Host the desktop shell for authentication and task management.
- Reuse `todo-data` and `todo-app` so personal and team workspace flows stay aligned with web and mobile.
- Load the Vite renderer through Electron and preserve shared todo CRUD behavior.

## Development

- `vp run desktop#dev` starts the Vite renderer.
- `vp run desktop#start` launches Electron against the built renderer in `dist/`.
- Set `DESKTOP_DEV_SERVER_URL` before `vp run desktop#start` if you want Electron to point at a live renderer during local development.
