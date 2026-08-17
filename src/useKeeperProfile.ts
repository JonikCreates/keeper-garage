import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { friendlyGarageError } from "./keeperApi";
import { supabase } from "./supabase";

function metadataName(user: User | null) {
  if (!user) return "";
  const metadata = user.user_metadata;
  return String(metadata.display_name ?? metadata.full_name ?? metadata.name ?? "");
}

export function useKeeperProfile(user: User | null) {
  const [displayName, setDisplayName] = useState(() => metadataName(user));
  const [ownerId, setOwnerId] = useState<string | null>(user?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const visibleDisplayName = user && ownerId === user.id ? displayName : metadataName(user);

  useEffect(() => {
    if (!supabase || !user) {
      queueMicrotask(() => {
        setDisplayName("");
        setOwnerId(null);
        setMessage(null);
        setError(null);
      });
      return;
    }

    const client = supabase;
    const currentUser = user;
    let active = true;
    queueMicrotask(() => {
      if (active) {
        setOwnerId(currentUser.id);
        setLoading(true);
      }
    });
    void client
      .from("profiles")
      .select("display_name")
      .eq("user_id", currentUser.id)
      .maybeSingle<{ display_name: string | null }>()
      .then(({ data, error: profileError }) => {
        if (!active) return;
        setDisplayName(data?.display_name ?? metadataName(currentUser));
        setError(profileError ? friendlyGarageError() : null);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const save = useCallback(async () => {
    if (!supabase || !user) return false;
    const normalizedName = visibleDisplayName.trim();
    if (!normalizedName) {
      setError("Enter a display name.");
      return false;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ user_id: user.id, display_name: normalizedName }, { onConflict: "user_id" });
    setSaving(false);
    if (profileError) {
      setError(friendlyGarageError());
      return false;
    }
    setDisplayName(normalizedName);
    setOwnerId(user.id);
    setMessage("Profile saved.");
    return true;
  }, [user, visibleDisplayName]);

  return {
    displayName: visibleDisplayName,
    setDisplayName: (value: string) => {
      setDisplayName(value);
      setOwnerId(user?.id ?? null);
      setMessage(null);
      setError(null);
    },
    loading,
    saving,
    message,
    error,
    save,
  };
}
