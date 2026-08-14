import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { authRedirectUrl, hasSupabaseConfig, supabase } from "./supabase";

export function useKeeperAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!hasSupabaseConfig);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      setSession(data.session);
      setError(sessionError?.message ?? null);
      setReady(true);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setSession(nextSession);
        setReady(true);
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const run = useCallback(async (operation: () => Promise<{ error: { message: string } | null }>) => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await operation();
      if (result.error) setError(result.error.message);
      return !result.error;
    } finally {
      setBusy(false);
    }
  }, []);

  const continueAsGuest = useCallback(async () => {
    const client = supabase;
    if (!client) return false;
    return run(async () => {
      const { error: authError } = await client.auth.signInAnonymously();
      if (!authError) setMessage("Guest garage ready. Save your F30 when you are happy with the configuration.");
      return { error: authError };
    });
  }, [run]);

  const sendMagicLink = useCallback(async (email: string) => {
    const client = supabase;
    if (!client) return false;
    return run(async () => {
      const { error: authError } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: authRedirectUrl(), shouldCreateUser: true },
      });
      if (!authError) setMessage(`Check ${email} for your Keeper sign-in link.`);
      return { error: authError };
    });
  }, [run]);

  const secureGuest = useCallback(async (email: string) => {
    const client = supabase;
    if (!client) return false;
    return run(async () => {
      const { error: authError } = await client.auth.updateUser(
        { email },
        { emailRedirectTo: authRedirectUrl() },
      );
      if (!authError) setMessage(`Check ${email} to secure this guest garage.`);
      return { error: authError };
    });
  }, [run]);

  const signOut = useCallback(async () => {
    const client = supabase;
    if (!client) return false;
    return run(async () => {
      const { error: authError } = await client.auth.signOut();
      return { error: authError };
    });
  }, [run]);

  const user = session?.user ?? null;
  const isGuest = Boolean(user?.is_anonymous);

  return useMemo(() => ({
    configured: hasSupabaseConfig,
    session,
    user,
    isGuest,
    ready,
    busy,
    message,
    error,
    continueAsGuest,
    sendMagicLink,
    secureGuest,
    signOut,
    clearStatus: () => {
      setMessage(null);
      setError(null);
    },
  }), [session, user, isGuest, ready, busy, message, error, continueAsGuest, sendMagicLink, secureGuest, signOut]);
}
