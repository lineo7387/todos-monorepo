import type { SupabaseClient, SupabaseClientOptions } from "@supabase/supabase-js";

export type TodoClientRuntime = "web" | "mobile" | "desktop";

export interface TodoSupabaseEnv {
  url: string;
  anonKey: string;
  sessionStorageKey: string;
}

export interface TodoSessionStorageAdapter {
  getItem(key: string): Promise<string | null> | string | null;
  setItem(key: string, value: string): Promise<void> | void;
  removeItem(key: string): Promise<void> | void;
}

export interface TodoWebStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface TodoRecordRow {
  id: string;
  user_id: string | null;
  owner_user_id: string | null;
  team_id: string | null;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface TeamRecordRow {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMemberRecordRow {
  team_id: string;
  user_id: string;
  created_at: string;
}

export interface TeamMemberWorkspaceRow extends TeamMemberRecordRow {
  team: TeamRecordRow | TeamRecordRow[] | null;
}

export interface TeamInviteRecordRow {
  id: string;
  team_id: string;
  created_by: string;
  token: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TodoDatabase {
  public: {
    Tables: {
      todos: {
        Row: TodoRecordRow;
        Insert: {
          id?: string;
          user_id?: string | null;
          owner_user_id?: string | null;
          team_id?: string | null;
          title: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          owner_user_id?: string | null;
          team_id?: string | null;
          title?: string;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: TeamRecordRow;
        Insert: {
          id?: string;
          name: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      team_members: {
        Row: TeamMemberRecordRow;
        Insert: {
          team_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          team_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      team_invites: {
        Row: TeamInviteRecordRow;
        Insert: {
          id?: string;
          team_id: string;
          created_by: string;
          token: string;
          expires_at: string;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          created_by?: string;
          token?: string;
          expires_at?: string;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      create_team_invite: {
        Args: {
          target_team_id: string;
          target_expires_at?: string | null;
        };
        Returns: TeamInviteRecordRow;
      };
      redeem_team_invite: {
        Args: {
          target_token: string;
        };
        Returns: TeamMemberRecordRow;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type TodoSupabaseClient = SupabaseClient<TodoDatabase, "public">;

type TodoSupabaseClientOptions = SupabaseClientOptions<"public">;
type BaseSupabaseOptions = Omit<TodoSupabaseClientOptions, "auth" | "global">;

export interface TodoSupabaseOptions {
  env: TodoSupabaseEnv;
  runtime: TodoClientRuntime;
  persistSession?: boolean;
  autoRefreshToken?: boolean;
  detectSessionInUrl?: boolean;
  sessionStorage?: TodoSessionStorageAdapter;
  userStorage?: TodoSessionStorageAdapter;
  global?: TodoSupabaseClientOptions["global"];
  auth?: TodoSupabaseClientOptions["auth"];
  options?: BaseSupabaseOptions;
}
