"use client";

import React, { useState, useEffect } from "react";
import { Lock, Sliders, HardDrive, ShieldAlert, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState<boolean>(false);

  // Preference states (loaded from localStorage or default)
  const [prefAutoSave, setPrefAutoSave] = useState<boolean>(true);
  const [prefCompactMode, setPrefCompactMode] = useState<boolean>(false);
  const [prefLayoutMode, setPrefLayoutMode] = useState<string>("split");

  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load preferences on mount
  useEffect(() => {
    const savedAutoSave = localStorage.getItem("settings_pref_autosave");
    if (savedAutoSave !== null) setPrefAutoSave(savedAutoSave === "true");

    const savedCompact = localStorage.getItem("settings_pref_compact");
    if (savedCompact !== null) setPrefCompactMode(savedCompact === "true");

    const savedLayout = localStorage.getItem("settings_pref_layout");
    if (savedLayout !== null) setPrefLayoutMode(savedLayout);
  }, []);

  // Save specific preferences to localStorage
  const handleToggleAutoSave = (checked: boolean) => {
    setPrefAutoSave(checked);
    localStorage.setItem("settings_pref_autosave", checked.toString());
  };

  const handleToggleCompact = (checked: boolean) => {
    setPrefCompactMode(checked);
    localStorage.setItem("settings_pref_compact", checked.toString());
    // Dispatch event to components listening (like sidebar tree)
    window.dispatchEvent(new Event("settings-compact-toggle"));
  };

  const handleSelectLayout = (layout: string) => {
    setPrefLayoutMode(layout);
    localStorage.setItem("settings_pref_layout", layout);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsUpdatingPassword(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/v1/user/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      }).then((r) => r.json());

      if (res.success) {
        setStatusMsg({ type: "success", text: "Keycode security updated successfully! 🔒" });
        setPassword("");
      } else {
        setStatusMsg({ type: "error", text: res.message || "Failed to update password." });
      }
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: "error", text: "Network error during password update." });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-sans select-none text-slate-800">
      {/* Page Title */}
      <div className="mb-8 border-b border-dashed border-slate-350/60 pb-3">
        <h1 className="font-caveat text-4xl font-bold tracking-wide text-slate-850 m-0">
          Studio Preferences
        </h1>
        <p className="font-patrick text-sm text-slate-500 mt-1">
          Adjust writing attributes, default templates, and passcodes.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`mb-6 p-4 rounded-xl border text-xs font-patrick leading-relaxed animate-fade-in flex items-center gap-2 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 border-emerald-350 text-emerald-800"
              : "bg-rose-50 border-rose-350 text-rose-800"
          }`}
        >
          <ShieldAlert size={14} className={statusMsg.type === "success" ? "text-emerald-600" : "text-rose-600"} />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Grid panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Panel 1: Write Settings Preferences */}
        <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            <Sliders size={16} className="text-violet-500 shrink-0" />
            <h2 className="font-patrick text-[15px] font-bold text-slate-850 m-0">
              Writing Configurations
            </h2>
          </div>

          <div className="space-y-4">
            {/* Auto-save Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 font-patrick block">Auto-Save Timer</span>
                <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                  Debounces and auto-saves changes locally to backend DB.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefAutoSave}
                  onChange={(e) => handleToggleAutoSave(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            {/* Sidebar Compact Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 font-patrick block">Compact Sidebar list</span>
                <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
                  Reduces catalog list margins for small resolutions.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefCompactMode}
                  onChange={(e) => handleToggleCompact(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
              </label>
            </div>

            {/* Layout Mode Selector */}
            <div>
              <span className="text-xs font-bold text-slate-700 font-patrick block mb-1.5">
                Default Workspace layout
              </span>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg border border-slate-250 select-none">
                <button
                  onClick={() => handleSelectLayout("split")}
                  className={`py-1 text-center font-patrick text-xs rounded cursor-pointer transition-all ${
                    prefLayoutMode === "split"
                      ? "bg-white text-violet-700 font-bold shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Editor & Review
                </button>
                <button
                  onClick={() => handleSelectLayout("full")}
                  className={`py-1 text-center font-patrick text-xs rounded cursor-pointer transition-all ${
                    prefLayoutMode === "full"
                      ? "bg-white text-violet-700 font-bold shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Full Editor Sheets
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Security Keycode (Password) & Storage */}
        <div className="space-y-6">
          {/* Panel 2: Keycode Form */}
          <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-4">
              <Lock size={16} className="text-violet-500 shrink-0" />
              <h2 className="font-patrick text-[15px] font-bold text-slate-850 m-0">
                Keycode Security
              </h2>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter block">
                  New Password Keycode
                </span>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter security keycode..."
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-700 font-sans focus:outline-none focus:border-violet-500 pr-9"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    title={showPassword ? "Hide keycode" : "Show keycode"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-patrick text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                {isUpdatingPassword ? "Updating..." : "Update Security Keycode"}
              </button>
            </form>
          </div>

          {/* Panel 3: Storage details */}
          <div className="bg-white border border-slate-300 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <HardDrive size={16} className="text-violet-500 shrink-0" />
              <h2 className="font-patrick text-[15px] font-bold text-slate-850 m-0">
                Catalog Storage Capacity
              </h2>
            </div>

            <div className="space-y-2 font-patrick text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Notes & Folder DB:</span>
                <span>
                  <strong>1.4 KB</strong> of <strong>50 MB</strong> Used (0.003%)
                </span>
              </div>
              {/* Progress Bar container */}
              <div className="w-full h-2 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                {/* 1% mock progress bar */}
                <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full w-[2%]" />
              </div>
              <span className="text-[10px] text-slate-400 font-sans block mt-1">
                Local SQLite sandbox storage constraints. Backed up dynamically.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
