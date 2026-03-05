"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { FilterBar, type FilterOption } from "@/components/ui/FilterBar";
import { useAppStore } from "@/store/appStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useAuthStore } from "@/store/authStore";
import {
  register,
  login,
  pushData,
  pullData,
} from "@/lib/sync/syncService";

const HEMISPHERE_OPTIONS: FilterOption[] = [
  { label: "Northern", value: "northern" },
  { label: "Southern", value: "southern" },
];

const FRUIT_OPTIONS: FilterOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Orange", value: "orange" },
  { label: "Pear", value: "pear" },
  { label: "Peach", value: "peach" },
  { label: "Cherry", value: "cherry" },
];

const COMMON_TIMEZONES = [
  { label: "Eastern (ET)", value: "America/New_York" },
  { label: "Central (CT)", value: "America/Chicago" },
  { label: "Mountain (MT)", value: "America/Denver" },
  { label: "Pacific (PT)", value: "America/Los_Angeles" },
  { label: "Alaska (AKT)", value: "America/Anchorage" },
  { label: "Hawaii (HT)", value: "America/Honolulu" },
  { label: "GMT / UTC", value: "UTC" },
  { label: "London (GMT/BST)", value: "Europe/London" },
  { label: "Paris (CET)", value: "Europe/Paris" },
  { label: "Berlin (CET)", value: "Europe/Berlin" },
  { label: "Tokyo (JST)", value: "Asia/Tokyo" },
  { label: "Sydney (AEST)", value: "Australia/Sydney" },
  { label: "Auckland (NZST)", value: "Pacific/Auckland" },
];

export default function SettingsPage() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const hemisphere = useSettingsStore((s) => s.hemisphere);
  const setHemisphere = useSettingsStore((s) => s.setHemisphere);
  const nativeFruit = useSettingsStore((s) => s.nativeFruit);
  const setNativeFruit = useSettingsStore((s) => s.setNativeFruit);
  const timezone = useSettingsStore((s) => s.timezone);
  const setTimezone = useSettingsStore((s) => s.setTimezone);
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleExportData = async () => {
    try {
      const db = await import("@/lib/db/database").then((m) => m.db);
      const tables = db.tables;
      const exportData: Record<string, unknown[]> = {};

      for (const table of tables) {
        const records = await table.toArray();
        if (records.length > 0) {
          exportData[table.name] = records;
        }
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `your-horizon-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // IndexedDB export failed silently
    }
  };

  const handleReset = () => {
    if (resetConfirm) {
      indexedDB.deleteDatabase("YourHorizonDB");
      window.location.reload();
    } else {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-text-secondary mt-1">
          Configure your preferences for Your Horizon.
        </p>
      </div>

      {/* Account & Cloud Sync */}
      <AccountSection />

      <Card>
        <h2 className="text-base font-semibold text-text mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text">Dark Mode</p>
            <p className="text-xs text-text-muted">Switch between light and dark themes</p>
          </div>
          <Toggle checked={theme === "dark"} onChange={toggleTheme} />
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-text mb-4">Game Settings</h2>
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-text mb-2">Hemisphere</p>
            <FilterBar
              options={HEMISPHERE_OPTIONS}
              selected={hemisphere}
              onSelect={(v) => setHemisphere(v as "northern" | "southern")}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-text mb-2">Native Fruit</p>
            <FilterBar
              options={FRUIT_OPTIONS}
              selected={nativeFruit}
              onSelect={setNativeFruit}
            />
          </div>
          <div>
            <label
              htmlFor="timezone-select"
              className="text-sm font-medium text-text block mb-1.5"
            >
              Timezone
            </label>
            <select
              id="timezone-select"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full max-w-xs h-9 px-3 rounded-lg bg-bg border border-border text-sm text-text focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 transition-colors"
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-text-muted mt-1">
              Used for critter availability and event timing
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-text mb-4">Data Management</h2>
        <p className="text-sm text-text-secondary mb-4">
          Your data is stored locally in your browser using IndexedDB.
          Use cloud sync above to access your data on other devices.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-primary-100 text-primary-700 border border-primary-200 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors"
          >
            Export Data
          </button>
          <button
            onClick={handleReset}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              resetConfirm
                ? "bg-favorite text-white"
                : "bg-favorite/10 text-favorite border border-favorite/30 hover:bg-favorite/20"
            }`}
          >
            {resetConfirm ? "Confirm Reset" : "Reset All Data"}
          </button>
        </div>
        {resetConfirm && (
          <p className="text-xs text-favorite mt-2">
            Click again to confirm. This will clear all your tracked collections, favorites, and settings.
          </p>
        )}
      </Card>
    </div>
  );
}

/* ─── Account & Cloud Sync ─────────────────────────────── */
function AccountSection() {
  const { token, email, lastSyncAt, setAuth, setLastSync, logout } =
    useAuthStore();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");

  const isLoggedIn = !!token;

  const handleAuth = async () => {
    setError("");
    setLoading(true);
    try {
      const fn = mode === "register" ? register : login;
      const result = await fn(emailInput, passwordInput);
      setAuth(result.token, result.email);
      setEmailInput("");
      setPasswordInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    if (!token) return;
    setSyncStatus("Saving...");
    try {
      await pushData(token);
      const now = new Date().toISOString();
      setLastSync(now);
      setSyncStatus("Saved to cloud!");
      setTimeout(() => setSyncStatus(""), 3000);
    } catch (err) {
      setSyncStatus(
        err instanceof Error ? err.message : "Save failed"
      );
    }
  };

  const handlePull = async () => {
    if (!token) return;
    setSyncStatus("Loading...");
    try {
      const hasData = await pullData(token);
      if (hasData) {
        const now = new Date().toISOString();
        setLastSync(now);
        setSyncStatus("Loaded! Reloading page...");
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setSyncStatus("No cloud data found. Save first!");
        setTimeout(() => setSyncStatus(""), 3000);
      }
    } catch (err) {
      setSyncStatus(
        err instanceof Error ? err.message : "Load failed"
      );
    }
  };

  return (
    <Card>
      <h2 className="text-base font-semibold text-text mb-4">
        Account & Cloud Sync
      </h2>

      {isLoggedIn ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text">
                Logged in as{" "}
                <span className="font-semibold">{email}</span>
              </p>
              {lastSyncAt && (
                <p className="text-xs text-text-muted">
                  Last synced: {new Date(lastSyncAt).toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={logout}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePush}
              disabled={!!syncStatus && syncStatus.endsWith("...")}
              className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              Save to Cloud
            </button>
            <button
              onClick={handlePull}
              disabled={!!syncStatus && syncStatus.endsWith("...")}
              className="px-4 py-2 rounded-lg bg-bg-hover text-text text-sm font-medium hover:bg-bg-input transition-colors border border-border disabled:opacity-50"
            >
              Load from Cloud
            </button>
          </div>

          {syncStatus && (
            <p
              className={`text-xs ${
                syncStatus.includes("failed") || syncStatus.includes("error")
                  ? "text-red-400"
                  : "text-primary-500"
              }`}
            >
              {syncStatus}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            Create an account to sync your data across devices.
          </p>

          <div className="flex gap-2">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  mode === m
                    ? "bg-primary-500 text-white"
                    : "bg-bg-hover text-text hover:bg-bg-input"
                }`}
              >
                {m === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Email"
              className="w-full max-w-xs px-3 py-2 rounded-lg bg-bg-input border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Password"
              onKeyDown={(e) => e.key === "Enter" && handleAuth()}
              className="w-full max-w-xs px-3 py-2 rounded-lg bg-bg-input border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleAuth}
              disabled={loading || !emailInput || !passwordInput}
              className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {loading
                ? "..."
                : mode === "login"
                ? "Login"
                : "Create Account"}
            </button>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </Card>
  );
}
