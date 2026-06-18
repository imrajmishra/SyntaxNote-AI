"use client";
import React from "react";
import Link from "next/link";
import {  X  } from "lucide-react";

import { Mail, ArrowLeft } from "lucide-react";


interface CheckEmailProps {
  onClose?: () => void;
  onToggleView?: () => void;
}
export default function CheckEmailPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white-950/70 backdrop-blur-md select-none font-patrick">
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
            onClick={() => {
              window.location.href = "/";
            }}
            className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
          {/* Cute Envelope Mascot (Animated SVG) */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 animate-[bounce_3s_ease-in-out_infinite]">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Envelope Back/Flap Open Shadow */}
                <path
                  d="M15 35 L50 15 L85 35 L85 75 L15 75 Z"
                  fill="#fde68a"
                  stroke="#475569"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Letter Inside */}
                <rect
                  x="25"
                  y="20"
                  width="50"
                  height="40"
                  fill="#ffffff"
                  stroke="#475569"
                  strokeWidth="2"
                  rx="2"
                />
                {/* Letter text lines */}
                <line
                  x1="32"
                  y1="30"
                  x2="68"
                  y2="30"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="32"
                  y1="38"
                  x2="55"
                  y2="38"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="32"
                  y1="46"
                  x2="60"
                  y2="46"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* Envelope Front Body */}
                <path
                  d="M15 35 L50 60 L85 35 L85 75 L15 75 Z"
                  fill="#fbbf24"
                  stroke="#475569"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Envelope Bottom Flap */}
                <path
                  d="M15 75 L50 55 L85 75"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Happy Face */}
                <circle cx="43" cy="65" r="3" fill="#1e293b" />
                <circle cx="57" cy="65" r="3" fill="#1e293b" />
                <path
                  d="M46 72 Q50 76 54 72"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Little sparkles */}
                <path
                  d="M80 20 L85 25 M85 20 L80 25"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                <path
                  d="M20 25 L25 30 M25 25 L20 30"
                  stroke="#f43f5e"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="animate-pulse"
                />
              </svg>
            </div>

            <p className="font-caveat text-xl font-bold text-slate-650 mt-2 text-center">
              💌 We slipped a note under your door!
            </p>
          </div>

          <h2 className="text-center font-caveat text-4xl font-bold text-violet-750 tracking-wide mb-4 drop-shadow-sm">
            Check Your Inbox
          </h2>

          <div className="space-y-4 text-center">
            <div className="bg-white/70 border border-slate-200 rounded p-4 shadow-sm">
              <p className="text-slate-600 text-sm leading-relaxed mb-2">
                A verification link has been sent to your email address. Please
                click the link inside to validate your library card and stamp
                your entrance!
              </p>
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400 mt-3 uppercase tracking-wider">
                <Mail size={14} />
                <span>Don't forget the spam folder!</span>
              </div>
            </div>

            {/* Return Button */}
            <div className="pt-4">
              <Link href="/sign-in" className="block w-full">
                <button
                  type="button"
                  className="
                    flex items-center justify-center gap-2
                    relative px-8 py-2.5 bg-[#fee2e2]/95 hover:bg-[#fecaca] text-rose-800 border-x-4 border-dashed border-rose-400/50
                    font-patrick text-xl font-bold shadow-sm hover:shadow-md transition-all cursor-pointer rotate-1 w-full
                    before:content-[''] before:absolute before:-left-1 before:top-0 before:bottom-0 before:w-1.5 before:bg-[linear-gradient(45deg,#f43f5e_25%,transparent_25%),linear-gradient(-45deg,#f43f5e_25%,transparent_25%)] before:bg-size-[6px_6px]
                  "
                >
                  <ArrowLeft size={18} />
                  Return to Desk
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
