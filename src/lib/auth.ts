// Supabase client — only initialised when credentials are present (server-side)
let supabase: ReturnType<typeof createClientFn> | null = null;

function createClientFn(url: string, key: string) {
  const { createClient } = require("@supabase/supabase-js");
  return createClient(url, key);
}

if (typeof window === "undefined") {
  // Server-side only
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClientFn(supabaseUrl, supabaseAnonKey);
  }
}

export { supabase };

export interface SessionUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  role: "USER" | "ADMIN";
  credits: number;
}

// Fallback Mock Auth Store for testing without Supabase or database connections
const MOCK_USER_KEY = "sodia_mock_user";

export function getClientSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(MOCK_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as SessionUser;
  } catch (e) {
    return null;
  }
}

export function setClientSession(user: SessionUser | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(MOCK_USER_KEY);
  }
  // Notify listeners to update state (e.g. credits counter in sidebar)
  window.dispatchEvent(new Event("sodia_session_update"));
}
