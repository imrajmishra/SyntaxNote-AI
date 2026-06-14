"use client"
import React, { useState } from "react";
import { User, Lock, X, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

interface SignInProps {
  onAuthSuccess?: (username: string) => void;
  onClose?: () => void;
  onToggleView?: () => void;
}

export default function SignIn({
  onAuthSuccess,
}: SignInProps) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showForgotMsg, setShowForgotMsg] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!username.trim()) {
      newErrors.username = "⚠️ This field is emptier than my desk coffee cup.";
    } else if (
      username.toLowerCase() === "admin" ||
      username.toLowerCase() === "god"
    ) {
      newErrors.username =
        "⚠️ Too much power! Pick a username with less divine responsibility.";
    }

    if (!password) {
      newErrors.password =
        "⚠️ Please enter a password. Empty spaces don't lock notebooks.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    localStorage.setItem("username", username);
    localStorage.setItem("syntaxnote_user", username);
    if (onAuthSuccess) {
      onAuthSuccess(username);
    }
    // Redirect to the desk page
    window.location.href = "/home";
  };

  return (
    
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md select-none font-patrick">
      <div className="relative w-full max-w-md p-6 mx-4">
        {/* Washi Decals on the Corners */}
        <div className="absolute top-2 left-6 w-16 h-5 bg-yellow-200/40 border-x border-dashed border-yellow-400/30 transform -rotate-12 pointer-events-none z-10" />
        <div className="absolute top-2 right-6 w-16 h-5 bg-yellow-200/40 border-x border-dashed border-yellow-400/30 transform rotate-12 pointer-events-none z-10" />

        {/* Outer Index Card Wrapper */}
        <div className="relative bg-[#fbfbf8] border-2 border-neutral-300 rounded shadow-2xl p-8 pt-10 text-slate-800 border-dashed">
          {/* Top red header ruled line of index card */}
          <div className="absolute top-8 left-0 right-0 h-[1.5px] bg-red-400/50" />

          {/* Close button */}
          <button
            onClick={() => {window.location.href = "/"}}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>

          {/* Eye-Covering Pencil Mascot (animated SVG) */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Pencil Yellow Body */}
                <path
                  d="M35 15 L65 15 L65 70 L35 70 Z"
                  fill="#fbbf24"
                  stroke="#475569"
                  strokeWidth="2.5"
                />
                {/* Pencil Tip (Wood) */}
                <path
                  d="M35 70 L50 90 L65 70 Z"
                  fill="#fef3c7"
                  stroke="#475569"
                  strokeWidth="2.5"
                />
                {/* Lead Tip */}
                <path d="M45 83 L50 90 L55 83 Z" fill="#475569" />
                {/* Pink Eraser */}
                <path
                  d="M35 15 C35 5, 65 5, 65 15 Z"
                  fill="#f43f5e"
                  stroke="#475569"
                  strokeWidth="2.5"
                />

                {!isPasswordFocused ? (
                  <>
                    <circle cx="43" cy="40" r="3.5" fill="#1e293b" />
                    <circle cx="57" cy="40" r="3.5" fill="#1e293b" />
                    <path
                      d="M45 52 Q50 56 55 52"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </>
                ) : (
                  <>
                    <path
                      d="M40 40 Q43 43 46 40"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M54 40 Q57 43 60 40"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="50" cy="52" r="2.5" fill="#1e293b" />
                  </>
                )}

                <path
                  d={
                    isPasswordFocused
                      ? "M20 45 C30 45, 38 40, 42 38"
                      : "M20 45 Q30 50 35 48"
                  }
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d={
                    isPasswordFocused
                      ? "M80 45 C70 45, 62 40, 58 38"
                      : "M80 45 Q70 50 65 48"
                  }
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {isPasswordFocused && (
                  <>
                    <circle
                      cx="42"
                      cy="38"
                      r="5"
                      fill="#fbbf24"
                      stroke="#475569"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="58"
                      cy="38"
                      r="5"
                      fill="#fbbf24"
                      stroke="#475569"
                      strokeWidth="1.5"
                    />
                  </>
                )}
              </svg>
            </div>

            <p className="font-caveat text-xl font-bold text-slate-650 mt-1">
              {isPasswordFocused
                ? "🙈 Shhh... I'm not looking at your password!"
                : "✏️ Welcome, scholar! Log your details below."}
            </p>
          </div>

          <h2 className="text-center font-caveat text-4xl font-bold text-violet-750 tracking-wide mb-1 drop-shadow-sm">
            NoteBook Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                <User size={12} />
                <span>Cardholder Name</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errors.username)
                    setErrors((prev) => ({ ...prev, username: "" }));
                }}
                className="w-full px-3 py-1.5 bg-white/70 border border-slate-300 rounded font-patrick text-md text-slate-800 focus:outline-none focus:border-violet-500 transition-colors shadow-sm"
                placeholder="Type your username..."
                maxLength={20}
              />
              {errors.username && (
                <p className="text-[11px] text-red-500 mt-0.5">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1 flex items-center gap-1">
                <Lock size={12} />
                <span>Access Keycode</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: "" }));
                }}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className="w-full px-3 py-1.5 bg-white/70 border border-slate-300 rounded font-patrick text-md text-slate-800 focus:outline-none focus:border-violet-500 transition-colors shadow-sm"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-[11px] text-red-500 mt-0.5">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot password section */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowForgotMsg(true)}
                className="text-xs text-violet-600 hover:text-violet-850 hover:underline cursor-pointer"
              >
                Forgot Keycode?
              </button>
              {showForgotMsg && (
                <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded text-[11px] text-left text-slate-700 select-text leading-tight flex items-start gap-1.5">
                  <ShieldAlert
                    size={12}
                    className="text-amber-500 shrink-0 mt-0.5"
                  />
                  <div>
                    Oops! Forgot it? No biggie. Since this notebook is virtual,
                    we set your keycode to{" "}
                    <strong className="text-emerald-700">"syntaxnote"</strong>.
                    (Or write a new one!)
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center pt-2">
              <button
                type="submit"
                className="
                  relative px-8 py-2 bg-[#fee2e2]/95 hover:bg-[#fecaca] text-rose-800 border-x-4 border-dashed border-rose-400/50
                  font-patrick text-xl font-bold shadow-sm hover:shadow-md transition-all cursor-pointer -rotate-1 w-full
                  before:content-[''] before:absolute before:-left-1 before:top-0 before:bottom-0 before:w-1.5 before:bg-[linear-gradient(45deg,#f43f5e_25%,transparent_25%),linear-gradient(-45deg,#f43f5e_25%,transparent_25%)] before:bg-size-[6px_6px]
                "
              >
                Stamp Entrance 🎟️
              </button>
            </div>
          </form>

          {/* Toggle Link */}
          <div className="text-center mt-4 pt-3 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              Don't have a library card?
            </span>
            <button
              type="button"
              onClick={() => {window.location.href = "/sign-up"}}
              className="text-xs text-violet-600 hover:text-violet-850 font-bold hover:underline cursor-pointer ml-1"
            >
              Register Card
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
