import type { AuthSession, AuthRepository, PasswordSignInInput } from "../../utils/src/index.ts";
import { validatePasswordSignInInput } from "../../utils/src/index.ts";
import type { AuthSession as SupabaseAuthSession } from "@supabase/supabase-js";

import type { TodoSupabaseClient } from "./types.ts";

export function mapSupabaseSession(session: SupabaseAuthSession | null): AuthSession | null {
  if (!session?.user) {
    return null;
  }

  return {
    userId: session.user.id,
    email: session.user.email,
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
  };
}

export class SupabaseAuthRepository implements AuthRepository {
  private readonly client: TodoSupabaseClient;

  constructor(client: TodoSupabaseClient) {
    this.client = client;
  }

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await this.client.auth.getSession();

    if (error) {
      throw error;
    }

    return mapSupabaseSession(data.session);
  }

  async signInWithPassword(input: PasswordSignInInput): Promise<AuthSession> {
    const validatedInput = validatePasswordSignInInput(input);

    if (!validatedInput.ok || !validatedInput.value) {
      throw new Error(validatedInput.error ?? "Email and password are required.");
    }

    const { data, error } = await this.client.auth.signInWithPassword(validatedInput.value);

    if (error) {
      throw error;
    }

    const session = mapSupabaseSession(data.session);

    if (!session) {
      throw new Error("Supabase sign-in did not return a session.");
    }

    return session;
  }

  async signUpWithPassword(input: PasswordSignInInput): Promise<AuthSession | null> {
    const validatedInput = validatePasswordSignInInput(input);

    if (!validatedInput.ok || !validatedInput.value) {
      throw new Error(validatedInput.error ?? "Email and password are required.");
    }

    const { data, error } = await this.client.auth.signUp(validatedInput.value);

    if (error) {
      throw error;
    }

    return mapSupabaseSession(data.session);
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();

    if (error) {
      throw error;
    }
  }
}

export function createSupabaseAuthRepository(client: TodoSupabaseClient): AuthRepository {
  return new SupabaseAuthRepository(client);
}
