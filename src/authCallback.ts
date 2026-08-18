import { supabase } from "./supabase";
import { authResultUrl, isAuthCallbackLocation } from "./routing";

const authResultKey = "keeper-auth-result";
type AccountView = "profile" | "verify" | "recovery";

function accountViewFromUrl(): AccountView {
  const value = new URLSearchParams(window.location.search).get("account");
  return value === "verify" || value === "recovery" ? value : "profile";
}

export function takeAuthCallbackResult() {
  const result = sessionStorage.getItem(authResultKey);
  sessionStorage.removeItem(authResultKey);
  return result === "error" ? "error" : result === "success" ? "success" : null;
}

export async function completeAuthCallback() {
  if (!isAuthCallbackLocation()) return false;

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const accountView = accountViewFromUrl();
  const callbackPath = window.location.pathname.endsWith("/") ? window.location.pathname : `${window.location.pathname}/`;

  // REVIEW DECISION: capture the one-time code in memory, then remove every callback parameter before any network request or UI render.
  window.history.replaceState(null, "", callbackPath);

  let result: "success" | "error" = "error";
  if (supabase && code && !params.has("error")) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) result = "success";
    } catch {
      result = "error";
    }
  }

  sessionStorage.setItem(authResultKey, result);
  window.location.replace(authResultUrl(accountView));
  return true;
}
