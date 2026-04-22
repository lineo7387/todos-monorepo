import type { FormEvent } from "react";
import type { TodoAppState } from "todo-app";

export interface AuthPageProps {
  authMode: "sign-in" | "sign-up";
  email: string;
  password: string;
  fieldErrors: TodoAppState["signInFieldErrors"];
  isLoading: boolean;
  onAuthModeChange: (mode: "sign-in" | "sign-up") => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function AuthPage({
  authMode,
  email,
  password,
  fieldErrors,
  isLoading,
  onAuthModeChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AuthPageProps) {
  return (
    <section className="auth-panel auth-panel--page">
      <div>
        <p className="auth-panel__eyebrow">Sign in</p>
        <h3>
          {authMode === "sign-up"
            ? "Create an account for synced todos."
            : "Authenticate before accessing your tasks."}
        </h3>
        <p className="auth-panel__body">
          {authMode === "sign-up"
            ? "Create a Supabase-backed account with email and password. If email confirmation is enabled, confirm first and then sign in."
            : "Use a Supabase account configured for this project. Session restore will keep you signed in on reload."}
        </p>
      </div>

      <div className="auth-mode-toggle">
        <button
          className={authMode === "sign-in" ? "is-active" : ""}
          onClick={() => onAuthModeChange("sign-in")}
          type="button"
        >
          Sign in
        </button>
        <button
          className={authMode === "sign-up" ? "is-active" : ""}
          onClick={() => onAuthModeChange("sign-up")}
          type="button"
        >
          Create account
        </button>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <label>
          <span>Email</span>
          <input
            autoComplete="email"
            onChange={(event) => onEmailChange(event.currentTarget.value)}
            placeholder="user@example.com"
            type="email"
            value={email}
          />
          {fieldErrors.email ? <small className="field-error">{fieldErrors.email}</small> : null}
        </label>

        <label>
          <span>Password</span>
          <input
            autoComplete="current-password"
            onChange={(event) => onPasswordChange(event.currentTarget.value)}
            placeholder="Enter your password"
            type="password"
            value={password}
          />
          {fieldErrors.password ? (
            <small className="field-error">{fieldErrors.password}</small>
          ) : null}
        </label>

        <button disabled={isLoading} type="submit">
          {isLoading
            ? authMode === "sign-up"
              ? "Creating account..."
              : "Signing in..."
            : authMode === "sign-up"
              ? "Create account"
              : "Sign in"}
        </button>
      </form>
    </section>
  );
}
