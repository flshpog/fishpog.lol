import { db } from "@/lib/db/database";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function apiFetch(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  return res;
}

/** Register a new account */
export async function register(
  email: string,
  password: string
): Promise<{ token: string; email: string }> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Registration failed");
  }
  return res.json();
}

/** Login to existing account */
export async function login(
  email: string,
  password: string
): Promise<{ token: string; email: string }> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Login failed");
  }
  return res.json();
}

/**
 * Push all user store data to the cloud.
 * Reads all yh-* keys from the Dexie kvStore and sends them as a batch.
 */
export async function pushData(token: string): Promise<void> {
  const allEntries = await db.kvStore.toArray();
  // Only sync user data stores, not auth itself
  const syncData: Record<string, string> = {};
  for (const entry of allEntries) {
    if (entry.key.startsWith("yh-") && entry.key !== "yh-auth") {
      syncData[entry.key] = entry.value;
    }
  }

  const res = await apiFetch("/sync", token, {
    method: "POST",
    body: JSON.stringify({ data: syncData }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Push failed");
  }
}

/**
 * Pull user store data from the cloud and write it to Dexie.
 * Returns true if data was updated, false if no cloud data exists.
 */
export async function pullData(token: string): Promise<boolean> {
  const res = await apiFetch("/sync", token);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Pull failed");
  }

  const { data } = await res.json();
  if (!data || Object.keys(data).length === 0) return false;

  // Write all store entries to Dexie kvStore
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === "string") {
      await db.kvStore.put({ key, value });
    }
  }

  return true;
}
