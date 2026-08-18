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
  type LegacyGarageClaim,
  type PreparedLegacyGarageClaim,
} from "./supabase";
import { takeAuthCallbackResult } from "./authCallback";

const initialCapabilities: AuthCapabilities = { email: false, google: false };
const pendingLegalKey = "keeper-pending-legal";
const pendingLegacyClaimKey = "keeper-pending-legacy-claim";
const initialAuthCallbackResult = takeAuthCallbackResult();

type LegalSource = "web" | "legacy_upgrade";
export type SignUpResult = "created" | "existing" | false;

type StoredLegacyClaim = PreparedLegacyGarageClaim;

function initialAuthError() {
  return initialAuthCallbackResult === "error" ? "We couldn't complete that sign-in. Please try again." : null;
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

function storedLegacyClaim(): StoredLegacyClaim | null {
  try {
    const value = sessionStorage.getItem(pendingLegacyClaimKey);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<StoredLegacyClaim>;
    if (!parsed.claim_id || !parsed.claim_secret || !parsed.expires_at) return null;
    return parsed as StoredLegacyClaim;
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
  const [error, setError] = useState<string | null>(initialAuthError);
  const [capabilities, setCapabilities] = useState(initialCapabilities);
  const [capabilitiesReady, setCapabilitiesReady] = useState(!hasSupabaseConfig);
  const [entitlements, setEntitlements] = useState<Set<string>>(new Set());
  const [accountStateReady, setAccountStateReady] = useState(!hasSupabaseConfig);
  const [legacyClaim, setLegacyClaim] = useState<LegacyGarageClaim | null>(null);
  const [dataVersion, setDataVersion] = useState(0);
  const [recoveryMode, setRecoveryMode] = useState(new URLSearchParams(window.location.search).get("account") === "recovery");

  const loadAccountState = useCallback(async (nextSession: Session | null) => {
    const client = supabase;
    setEntitlements(new Set());
    setLegacyClaim(null);
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

    const pendingClaim = storedLegacyClaim();
    if (pendingClaim) {
      const { data: claimData, error: claimError } = await client.rpc("get_legacy_garage_claim_summary", {
        p_claim_id: pendingClaim.claim_id,
        p_claim_secret: pendingClaim.claim_secret,
      });
      if (claimError) {
        sessionStorage.removeItem(pendingLegacyClaimKey);
        setMessage("The existing-garage import request expired. No records were changed.");
      } else {
        const claim = claimData as LegacyGarageClaim;
        if (claim.already_imported) sessionStorage.removeItem(pendingLegacyClaimKey);
        else setLegacyClaim(claim);
      }
    }
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
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") setDataVersion((version) => version + 1);
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

  const prepareLegacyGarageClaim = useCallback(async () => {
    if (!supabase || !isTemporaryGuest(session?.user ?? null)) return true;
    const { data, error: claimError } = await supabase.rpc("prepare_legacy_garage_claim");
    if (claimError || !data) {
      setError("Keeper couldn't prepare the existing garage for a secure import. Please try again.");
      return false;
    }
    sessionStorage.setItem(pendingLegacyClaimKey, JSON.stringify(data as PreparedLegacyGarageClaim));
    return true;
  }, [session?.user]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return false;
    begin();
    if (!await prepareLegacyGarageClaim()) {
      setBusy(false);
      return false;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(authMessage("login"));
      return false;
    }
    setMessage("Welcome back. Your garage is loading.");
    return true;
  }, [begin, prepareLegacyGarageClaim]);

  const signUp = useCallback(async (displayName: string, email: string, password: string): Promise<SignUpResult> => {
    if (!supabase) return false;
    begin();
    if (!await prepareLegacyGarageClaim()) {
      setBusy(false);
      return false;
    }
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
      if (/already|registered|exists/i.test(signUpError.message)) {
        setError(null);
        return "existing";
      }
      setError(authMessage("signup"));
      return false;
    }
    if (data.user && (data.user.identities?.length ?? 0) === 0) {
      sessionStorage.removeItem(pendingLegalKey);
      return "existing";
    }
    if (!data.session) setMessage("Check your email to verify your Keeper Profile, then return here to sign in.");
    else setMessage("Keeper Profile created. Your garage is ready.");
    return "created";
  }, [begin, prepareLegacyGarageClaim]);

  const signInWithProvider = useCallback(async (provider: AuthProvider, acceptedLegal = false) => {
    if (!supabase) return false;
    if (!capabilities[provider]) {
      setError("Google sign-in is not connected right now.");
      return false;
    }
    begin();
    if (!await prepareLegacyGarageClaim()) {
      setBusy(false);
      return false;
    }
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
  }, [begin, capabilities, prepareLegacyGarageClaim]);

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

  const claimLegacyGarage = useCallback(async () => {
    if (!supabase || !session?.user || !legacyClaim) return false;
    const pendingClaim = storedLegacyClaim();
    if (!pendingClaim || pendingClaim.claim_id !== legacyClaim.claim_id) {
      setError("The existing-garage import request is no longer available.");
      return false;
    }
    begin();
    const { data, error: claimError } = await supabase.rpc("claim_legacy_garage", {
      p_claim_id: pendingClaim.claim_id,
      p_claim_secret: pendingClaim.claim_secret,
    });
    setBusy(false);
    if (claimError || !data) {
      setError("Keeper couldn't import that existing garage. No records were changed.");
      return false;
    }
    sessionStorage.removeItem(pendingLegacyClaimKey);
    setLegacyClaim(null);
    setDataVersion((version) => version + 1);
    setMessage("Existing garage imported into your Keeper Profile.");
    return true;
  }, [begin, legacyClaim, session?.user]);

  const dismissLegacyClaim = useCallback(() => {
    setLegacyClaim(null);
    setMessage("The existing garage was left unchanged. You can return to this import on a later visit from this browser.");
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return false;
    begin();
    const { error: globalSignOutError } = await supabase.auth.signOut({ scope: "global" });
    const { error: localSignOutError } = globalSignOutError
      ? await supabase.auth.signOut({ scope: "local" })
      : { error: null };
    setEntitlements(new Set());
    setLegacyClaim(null);
    setSession(null);
    setDataVersion((version) => version + 1);
    setBusy(false);
    if (localSignOutError) {
      setError("We couldn't clear this browser session. Close this tab before another person uses this device.");
      return false;
    }
    if (globalSignOutError) setError("You are signed out on this device, but Keeper could not revoke every other session. Change your password if the account may be at risk.");
    else setMessage(null);
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
    legacyClaim,
    dataVersion,
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
    acceptLegal,
    requestPasswordReset,
    resendVerification,
    updatePassword,
    changeEmail,
    requestAccountDeletion,
    claimLegacyGarage,
    dismissLegacyClaim,
    signOut,
    clearStatus: () => {
      setMessage(null);
      setError(null);
    },
  }), [session, user, dataUser, isLegacyGuest, access, entitlements, legacyClaim, dataVersion, ready, accountStateReady, busy, message, error, capabilities, capabilitiesReady, recoveryMode, signIn, signUp, signInWithProvider, linkProvider, acceptLegal, requestPasswordReset, resendVerification, updatePassword, changeEmail, requestAccountDeletion, claimLegacyGarage, dismissLegacyClaim, signOut]);
}
