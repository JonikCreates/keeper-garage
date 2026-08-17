import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getAccountAccess, isTemporaryGuest } from "./access";
import { PRIVACY_VERSION, TERMS_VERSION } from "./legal";
import {
  authRedirectUrl,
  getAuthCapabilities,
  hasSupabaseConfig,
  supabase,
  type AuthCapabilities,
  type AuthProvider,
  type KeeperAccountState,
} from "./supabase";

const initialCapabilities: AuthCapabilities = { email: false, google: false };
const pendingLegalKey = "keeper-pending-legal";

type LegalSource = "web" | "legacy_upgrade";

function oauthErrorFromUrl() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return params.get("error_description") ? "We couldn't complete that sign-in. Please try again." : null;
}

function rememberLegalAcceptance(source: LegalSource) {
  sessionStorage.setItem(pendingLegalKey, JSON.stringify({
    termsVersion: TERMS_VERSION,
    privacyVersion: PRIVACY_VERSION,
    source,
  }));
}

function pendingLegalAcceptance(): { termsVersion: string; privacyVersion: string; source: LegalSource } | null {
  try {
    const value = sessionStorage.getItem(pendingLegalKey);
    if (!value) return null;
    const parsed = JSON.parse(value) as Record<string, unknown>;
    if (parsed.termsVersion !== TERMS_VERSION || parsed.privacyVersion !== PRIVACY_VERSION) return null;
    if (parsed.source !== "web" && parsed.source !== "legacy_upgrade") return null;
    return parsed as { termsVersion: string; privacyVersion: string; source: LegalSource };
  } catch {
    return null;
  }
}

function authMessage(kind: "login" | "signup" | "recovery" | "update") {
  if (kind === "login") return "We couldn't sign you in. Check your email and password and try again.";
  if (kind === "signup") return "We couldn't create that Keeper Profile. Check the form and try again.";
  if (kind === "recovery") return "We couldn't complete that recovery request. Please wait and try again.";
  return "We couldn't update the account. Please try again.";
}

export function useKeeperAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!hasSupabaseConfig);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(oauthErrorFromUrl);
  const [capabilities, setCapabilities] = useState(initialCapabilities);
  const [capabilitiesReady, setCapabilitiesReady] = useState(!hasSupabaseConfig);
  const [entitlements, setEntitlements] = useState<Set<string>>(new Set());
  const [accountStateReady, setAccountStateReady] = useState(!hasSupabaseConfig);
  const [recoveryMode, setRecoveryMode] = useState(new URLSearchParams(window.location.search).get("account") === "recovery");

  const loadAccountState = useCallback(async (nextSession: Session | null) => {
    const client = supabase;
    setEntitlements(new Set());
    if (!client || !nextSession?.user) {
      setAccountStateReady(true);
      return;
    }
    if (isTemporaryGuest(nextSession.user)) {
      setAccountStateReady(true);
      return;
    }

    setAccountStateReady(false);
    const pending = pendingLegalAcceptance();
    if (pending) {
      const { error: acceptanceError } = await client.rpc("accept_keeper_legal", {
        p_terms_version: pending.termsVersion,
        p_privacy_version: pending.privacyVersion,
        p_source: pending.source,
      });
      if (!acceptanceError) sessionStorage.removeItem(pendingLegalKey);
    }

    const { data, error: stateError } = await client.rpc("get_keeper_account_state");
    if (stateError) {
      setError("Keeper couldn't verify this account's access. Please try again.");
      setAccountStateReady(true);
      return;
    }
    const accountState = data as KeeperAccountState | null;
    setEntitlements(new Set(accountState?.entitlements ?? []));
    setAccountStateReady(true);
  }, []);

  useEffect(() => {
    if (!supabase) return;

    const client = supabase;
    let active = true;
    void client.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      let currentSession = data.session;
      if (currentSession) {
        const { data: userData } = await client.auth.getUser();
        if (userData.user) currentSession = { ...currentSession, user: userData.user };
      }
      if (!active) return;
      setSession(currentSession);
      setReady(true);
      await loadAccountState(currentSession);
    });

    const { data } = client.auth.onAuthStateChange((event: AuthChangeEvent, nextSession) => {
      if (!active) return;
      setEntitlements(new Set());
      setAccountStateReady(false);
      setSession(nextSession);
      setReady(true);
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
        setMessage("Choose a new password for your Keeper Profile.");
      }
      window.setTimeout(() => {
        if (active) void loadAccountState(nextSession);
      }, 0);
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [loadAccountState]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void getAuthCapabilities()
      .then((nextCapabilities) => {
        if (active) setCapabilities(nextCapabilities);
      })
      .catch(() => {
        if (active) setError("Keeper couldn't verify its sign-in configuration.");
      })
      .finally(() => {
        if (active) setCapabilitiesReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const begin = useCallback(() => {
    setBusy(true);
    setError(null);
    setMessage(null);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return false;
    begin();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(authMessage("login"));
      return false;
    }
    setMessage("Welcome back. Your garage is loading.");
    return true;
  }, [begin]);

  const signUp = useCallback(async (displayName: string, email: string, password: string) => {
    if (!supabase) return false;
    begin();
    rememberLegalAcceptance("web");
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: authRedirectUrl("verify"),
        data: { display_name: displayName.trim() },
      },
    });
    setBusy(false);
    if (signUpError) {
      sessionStorage.removeItem(pendingLegalKey);
      setError(authMessage("signup"));
      return false;
    }
    if (!data.session) setMessage("Check your email to verify your Keeper Profile, then return here to sign in.");
    else setMessage("Keeper Profile created. Your garage is ready.");
    return true;
  }, [begin]);

  const signInWithProvider = useCallback(async (provider: AuthProvider, acceptedLegal = false) => {
    if (!supabase) return false;
    if (!capabilities[provider]) {
      setError("Google sign-in is not connected right now.");
      return false;
    }
    begin();
    if (acceptedLegal) rememberLegalAcceptance("web");
    const { error: providerError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: authRedirectUrl("profile"),
        scopes: "openid email profile",
        queryParams: { prompt: "select_account" },
      },
    });
    setBusy(false);
    if (providerError) {
      if (acceptedLegal) sessionStorage.removeItem(pendingLegalKey);
      setError("We couldn't start Google sign-in. Please try again.");
      return false;
    }
    return true;
  }, [begin, capabilities]);

  const linkProvider = useCallback(async (provider: AuthProvider) => {
    if (!supabase) return false;
    if (!capabilities[provider]) {
      setError("Google account linking is not connected right now.");
      return false;
    }
    begin();
    if (isTemporaryGuest(session?.user ?? null)) rememberLegalAcceptance("legacy_upgrade");
    const { error: providerError } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: authRedirectUrl("profile"),
        scopes: "openid email profile",
        queryParams: { prompt: "select_account" },
      },
    });
    setBusy(false);
    if (providerError) {
      sessionStorage.removeItem(pendingLegalKey);
      setError("We couldn't connect that Google account. Please try again.");
      return false;
    }
    return true;
  }, [begin, capabilities, session?.user]);

  const beginLegacyEmailUpgrade = useCallback(async (displayName: string, email: string) => {
    if (!supabase || !isTemporaryGuest(session?.user ?? null)) return false;
    begin();
    rememberLegalAcceptance("legacy_upgrade");
    const { error: updateError } = await supabase.auth.updateUser(
      { email, data: { display_name: displayName.trim() } },
      { emailRedirectTo: authRedirectUrl("legacy-password") },
    );
    setBusy(false);
    if (updateError) {
      sessionStorage.removeItem(pendingLegalKey);
      setError("We couldn't start that garage upgrade. If this email already has a Keeper Profile, sign in to that account instead.");
      return false;
    }
    setMessage("Check your email to verify the address. Your existing garage will remain attached to the same owner ID.");
    return true;
  }, [begin, session?.user]);

  const acceptLegal = useCallback(async () => {
    if (!supabase || !session?.user || isTemporaryGuest(session.user)) return false;
    begin();
    const { error: acceptanceError } = await supabase.rpc("accept_keeper_legal", {
      p_terms_version: TERMS_VERSION,
      p_privacy_version: PRIVACY_VERSION,
      p_source: "web",
    });
    setBusy(false);
    if (acceptanceError) {
      setError("Keeper couldn't record that acceptance. Please try again.");
      return false;
    }
    await loadAccountState(session);
    setMessage("Keeper Profile activated.");
    return true;
  }, [begin, loadAccountState, session]);

  const requestPasswordReset = useCallback(async (email: string) => {
    if (!supabase) return false;
    begin();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: authRedirectUrl("recovery") });
    setBusy(false);
    if (resetError) {
      setError(authMessage("recovery"));
      return false;
    }
    setMessage("If that address can receive a Keeper reset email, a secure link is on its way.");
    return true;
  }, [begin]);

  const resendVerification = useCallback(async (email: string) => {
    if (!supabase) return false;
    begin();
    const { error: resendError } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: authRedirectUrl("verify") } });
    setBusy(false);
    if (resendError) {
      setError("We couldn't resend that verification message right now.");
      return false;
    }
    setMessage("If verification is pending for that address, a new message is on its way.");
    return true;
  }, [begin]);

  const updatePassword = useCallback(async (password: string, currentPassword?: string) => {
    if (!supabase || !session?.user) return false;
    begin();
    const attributes = currentPassword ? { password, current_password: currentPassword } : { password };
    const { error: passwordError } = await supabase.auth.updateUser(attributes);
    setBusy(false);
    if (passwordError) {
      setError("We couldn't update the password. Check the current password and requirements, then try again.");
      return false;
    }
    setRecoveryMode(false);
    setMessage("Password updated.");
    return true;
  }, [begin, session?.user]);

  const changeEmail = useCallback(async (email: string) => {
    if (!supabase || !session?.user) return false;
    begin();
    const { error: changeError } = await supabase.auth.updateUser({ email }, { emailRedirectTo: authRedirectUrl("profile") });
    setBusy(false);
    if (changeError) {
      setError(authMessage("update"));
      return false;
    }
    setMessage("Check the confirmation messages required to finish changing your email.");
    return true;
  }, [begin, session?.user]);

  const requestAccountDeletion = useCallback(async () => {
    if (!supabase || !session?.user) return false;
    begin();
    const { error: deletionError } = await supabase.rpc("request_keeper_account_deletion");
    setBusy(false);
    if (deletionError) {
      setError("Keeper couldn't record the deletion request. Please try again.");
      return false;
    }
    setMessage("Account deletion request recorded. Your garage has not been deleted yet.");
    return true;
  }, [begin, session?.user]);

  const signOut = useCallback(async () => {
    if (!supabase) return false;
    begin();
    const { error: signOutError } = await supabase.auth.signOut();
    setEntitlements(new Set());
    setSession(null);
    setBusy(false);
    if (signOutError) {
      setError("We couldn't finish signing out. Please try again.");
      return false;
    }
    setMessage(null);
    return true;
  }, [begin]);

  const user = session?.user ?? null;
  const isLegacyGuest = isTemporaryGuest(user);
  const access = useMemo(() => getAccountAccess(user, entitlements), [entitlements, user]);
  const dataUser = access.kind === "account" || access.kind === "legacy" ? user : null;

  return useMemo(() => ({
    configured: hasSupabaseConfig,
    session,
    user,
    dataUser,
    isGuest: !user,
    isLegacyGuest,
    access,
    entitlements,
    linkedProviders: user?.identities?.map((identity) => identity.provider) ?? [],
    ready: ready && accountStateReady,
    busy,
    message,
    error,
    capabilities,
    capabilitiesReady,
    recoveryMode,
    signIn,
    signUp,
    signInWithProvider,
    linkProvider,
    beginLegacyEmailUpgrade,
    acceptLegal,
    requestPasswordReset,
    resendVerification,
    updatePassword,
    changeEmail,
    requestAccountDeletion,
    signOut,
    clearStatus: () => {
      setMessage(null);
      setError(null);
    },
  }), [session, user, dataUser, isLegacyGuest, access, entitlements, ready, accountStateReady, busy, message, error, capabilities, capabilitiesReady, recoveryMode, signIn, signUp, signInWithProvider, linkProvider, beginLegacyEmailUpgrade, acceptLegal, requestPasswordReset, resendVerification, updatePassword, changeEmail, requestAccountDeletion, signOut]);
}
