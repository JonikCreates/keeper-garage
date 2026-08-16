import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getAccountAccess } from "./access";
import {
  authRedirectUrl,
  getAuthCapabilities,
  hasSupabaseConfig,
  supabase,
  type AuthCapabilities,
  type AuthProvider,
} from "./supabase";

const initialCapabilities: AuthCapabilities = {
  anonymous: false,
  email: false,
  phone: false,
  google: false,
};

function oauthErrorFromUrl() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return params.get("error_description")?.slice(0, 300) ?? null;
}

export function useKeeperAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!hasSupabaseConfig);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(oauthErrorFromUrl);
  const [capabilities, setCapabilities] = useState(initialCapabilities);
  const [capabilitiesReady, setCapabilitiesReady] = useState(!hasSupabaseConfig);
  const [pendingPhone, setPendingPhone] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    const oauthParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const oauthError = oauthParams.get("error_description");
    if (oauthError) {
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#garage`);
    }
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      setSession(data.session);
      if (sessionError) setError(sessionError.message);
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

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void getAuthCapabilities()
      .then((nextCapabilities) => {
        if (active) setCapabilities(nextCapabilities);
      })
      .catch((capabilityError: unknown) => {
        if (active) setError(capabilityError instanceof Error ? capabilityError.message : "Authentication configuration is unavailable.");
      })
      .finally(() => {
        if (active) setCapabilitiesReady(true);
      });
    return () => {
      active = false;
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
    if (!capabilities.anonymous) {
      setError("Guest access is not enabled right now.");
      return false;
    }
    return run(async () => {
      const { error: authError } = await client.auth.signInAnonymously();
      if (!authError) setMessage("Guest garage ready. Save your F30 when you are happy with the configuration.");
      return { error: authError };
    });
  }, [capabilities.anonymous, run]);

  const sendMagicLink = useCallback(async (email: string) => {
    const client = supabase;
    if (!client) return false;
    return run(async () => {
      const { error: authError } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: authRedirectUrl("profile"), shouldCreateUser: true },
      });
      if (!authError) setMessage(`Check ${email} for your Keeper sign-in link.`);
      return { error: authError };
    });
  }, [run]);

  const signInWithProvider = useCallback(async (provider: AuthProvider) => {
    const client = supabase;
    if (!client) return false;
    if (!capabilities[provider]) {
      setError("Google sign-in is not connected yet.");
      return false;
    }
    return run(async () => {
      const { error: authError } = await client.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: authRedirectUrl("profile"),
          scopes: "openid email profile",
          queryParams: { prompt: "select_account" },
        },
      });
      return { error: authError };
    });
  }, [capabilities, run]);

  const linkProvider = useCallback(async (provider: AuthProvider) => {
    const client = supabase;
    if (!client) return false;
    if (!capabilities[provider]) {
      setError("Google account linking is not connected yet.");
      return false;
    }
    return run(async () => {
      const { error: authError } = await client.auth.linkIdentity({
        provider,
        options: {
          redirectTo: authRedirectUrl("security"),
          scopes: "openid email profile",
          queryParams: { prompt: "select_account" },
        },
      });
      return { error: authError };
    });
  }, [capabilities, run]);

  const secureGuest = useCallback(async (email: string) => {
    const client = supabase;
    if (!client) return false;
    return run(async () => {
      const { error: authError } = await client.auth.updateUser(
        { email },
        { emailRedirectTo: authRedirectUrl("security") },
      );
      if (!authError) setMessage(`Check ${email} to secure this guest garage.`);
      return { error: authError };
    });
  }, [run]);

  const changeEmail = useCallback(async (email: string) => {
    const client = supabase;
    if (!client) return false;
    return run(async () => {
      const { error: authError } = await client.auth.updateUser(
        { email },
        { emailRedirectTo: authRedirectUrl("security") },
      );
      if (!authError) setMessage(`Check ${email} to confirm your email address.`);
      return { error: authError };
    });
  }, [run]);

  const changePhone = useCallback(async (phone: string) => {
    const client = supabase;
    if (!client) return false;
    if (!capabilities.phone) {
      setError("Verified phone numbers are waiting for the Keeper SMS provider to be connected.");
      return false;
    }
    return run(async () => {
      const { error: authError } = await client.auth.updateUser({ phone });
      if (!authError) {
        setPendingPhone(phone);
        setMessage(`Enter the verification code sent to ${phone}.`);
      }
      return { error: authError };
    });
  }, [capabilities.phone, run]);

  const verifyPhone = useCallback(async (token: string) => {
    const client = supabase;
    if (!client || !pendingPhone) return false;
    return run(async () => {
      const { error: authError } = await client.auth.verifyOtp({
        phone: pendingPhone,
        token,
        type: "phone_change",
      });
      if (!authError) {
        setPendingPhone(null);
        setMessage("Phone number verified.");
      }
      return { error: authError };
    });
  }, [pendingPhone, run]);

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
  const access = useMemo(() => getAccountAccess(user), [user]);

  return useMemo(() => ({
    configured: hasSupabaseConfig,
    session,
    user,
    isGuest,
    access,
    linkedProviders: user?.identities?.map((identity) => identity.provider) ?? [],
    ready,
    busy,
    message,
    error,
    capabilities,
    capabilitiesReady,
    pendingPhone,
    continueAsGuest,
    sendMagicLink,
    signInWithProvider,
    linkProvider,
    secureGuest,
    changeEmail,
    changePhone,
    verifyPhone,
    signOut,
    clearStatus: () => {
      setMessage(null);
      setError(null);
    },
  }), [session, user, isGuest, access, ready, busy, message, error, capabilities, capabilitiesReady, pendingPhone, continueAsGuest, sendMagicLink, signInWithProvider, linkProvider, secureGuest, changeEmail, changePhone, verifyPhone, signOut]);
}
