"use client";

import React, { useState, useEffect, useTransition } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/(app)/api/v1/auth/signOut/route";

export interface NavigationSection {
  title: string;
  href: string;
}

const navigationData: NavigationSection[] = [
  {
    title: "Home",
    href: "/home",
  },
  {
    title: "Dashboard",
    href: "/dashboard",
  },
  {
    title: "Services",
    href: "/service",
  },
];

interface HeadderProps {
  onNavigate?: (href: string) => void;
  activeHref?: string;
  user?: string | null;
}

export default function Headder({
  onNavigate,
  activeHref = "",
  user = null,
}: HeadderProps) {
  const pathname = usePathname();
  const currentPath = activeHref || pathname || "";

  // We use useTransition to prevent the UI from freezing while the server action runs
  const [isPending, startTransition] = useTransition();
  const [showHeader, setShowHeader] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);


  const handleSignOutInternal = () => {
    startTransition(async () => {
      await signOut();
    });
  };

  
  useEffect(() => {
    let timeoutId: number;

    const startHideTimeout = () => {
      timeoutId = window.setTimeout(() => {
        setShowHeader(false);
      }, 2500); // Keep it visible for 2.5s of inactivity
    };

    const handleMouseMoveGlobal = () => {
      setShowHeader(true);
      clearTimeout(timeoutId);
      if (!isHovered) {
        startHideTimeout();
      }
    };

    window.addEventListener("mousemove", handleMouseMoveGlobal);
    window.addEventListener("touchstart", handleMouseMoveGlobal);

    // If hover ends, start timeout immediately
    if (!isHovered && showHeader) {
      startHideTimeout();
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMoveGlobal);
      window.removeEventListener("touchstart", handleMouseMoveGlobal);
      clearTimeout(timeoutId);
    };
  }, [isHovered, showHeader]);

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault(); // Good practice for custom routing
    if (onNavigate) {
      onNavigate(href);
    } else {
      window.location.href = `${process.env.NEXT_PUBLIC_SITE_URL}/${href}`;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 max-w-3xl transition-all duration-300 transform ${
        showHeader
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
      }`}
    >
      {/* Visual Washi Tape elements holding the header note */}
      {/* Left Tape */}
      <div
        className="absolute -top-1.5 left-12 w-10 h-4 bg-yellow-100/60 border-x border-yellow-200/40 shadow-[0_1px_2px_rgba(0,0,0,0.05)] opacity-80 pointer-events-none transform -rotate-12 z-30"
        style={{
          clipPath: "polygon(5% 0, 95% 0, 100% 100%, 0 100%)",
          backdropFilter: "blur(0.5px)",
        }}
      />
      {/* Right Tape */}
      <div
        className="absolute -top-1.5 right-12 w-10 h-4 bg-yellow-100/60 border-x border-yellow-200/40 shadow-[0_1px_2px_rgba(0,0,0,0.05)] opacity-80 pointer-events-none transform rotate-12 z-30"
        style={{
          clipPath: "polygon(5% 0, 95% 0, 100% 100%, 0 100%)",
          backdropFilter: "blur(0.5px)",
        }}
      />

      {/* Main Torn Paper Strip Header */}
      <header
        className="relative w-full h-15 paper-texture flex items-center justify-between pl-10 pr-6 pb-2 select-none border-x border-neutral-300/30"
        style={{
          clipPath:
            "polygon(0 0, 100% 0, 100% 86%, 97% 81%, 94% 86%, 91% 81%, 88% 86%, 85% 81%, 82% 86%, 79% 81%, 76% 86%, 73% 81%, 70% 86%, 67% 81%, 64% 86%, 61% 81%, 58% 86%, 55% 81%, 52% 86%, 49% 81%, 46% 86%, 43% 81%, 40% 86%, 37% 81%, 34% 86%, 31% 81%, 28% 86%, 25% 81%, 22% 86%, 19% 81%, 16% 86%, 13% 81%, 10% 86%, 7% 81%, 4% 86%, 0 81%)",
          backgroundColor: "var(--color-paper)",
        }}
      >
        {/* Ruled Horizontal Lines */}
        <div
          className="absolute inset-0 ruled-lines opacity-65 pointer-events-none"
          style={{ backgroundSize: "100% 20px" }}
        />

        {/* Red Margin Line */}
        <div
          className="absolute top-0 bottom-0 w-[1.5px] bg-red-400/50 pointer-events-none"
          style={{ left: "32px" }}
        />

        {/* Brand name */}
        <a
          href="/"
          className="z-10 flex items-center select-none mr-5 pt-1 cursor-pointer"
        >
          <span className="font-caveat font-bold text-2xl text-slate-800 tracking-wide drop-shadow-[0_0.5px_0.5px_rgba(255,255,255,0.9)]">
            SyntaxNote
          </span>
        </a>

        {/* Navigation Links */}
        <nav className="flex items-center gap-2 z-10 pt-1">
          {navigationData.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <a
                key={item.title}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`relative font-patrick text-[15px] transition-all px-2.5 py-0.5 rounded ${
                  isActive
                    ? "text-violet-600 font-bold"
                    : "text-slate-650 hover:text-slate-900"
                }`}
              >
                {item.title}

                {/* Hand-drawn pencil circle animation under the active link */}
                {isActive && (
                  <svg
                    className="absolute -bottom-1.5 left-0 w-full h-2 pointer-events-none"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 2,10 Q 50,18 98,9 Q 50,13 2,11"
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      className="animate-draw-pencil"
                    />
                  </svg>
                )}
              </a>
            );
          })}

          {/* User Auth Section */}
          <div className="h-4 w-px bg-slate-300 mx-2" />

          {user ? (
            <div className="flex items-center gap-2">
              <span
                className="font-caveat font-bold text-violet-700 text-sm px-1.5 py-0.5 rounded border border-purple-300 bg-purple-50/50 -rotate-1 shadow-[0_1px_1px_rgba(0,0,0,0.05)]"
                style={{ textShadow: "0 0.5px 0.5px rgba(255,255,255,0.9)" }}
              >
                ✏️ {user}
              </span>
              <button
                onClick={handleSignOutInternal}
                disabled={isPending}
                className="font-patrick text-[13px] text-rose-700 hover:text-rose-900 cursor-pointer hover:underline disabled:opacity-50"
              >
                {isPending ? "[Leaving...]" : "[Sign Out]"}
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                window.location.href = "/sign-in";
              }}
              className="
                relative px-3 py-0.5 bg-[#e0f2fe]/90 hover:bg-[#bae6fd] text-sky-800 border-x-2 border-dashed border-sky-400/40
                font-patrick text-[13px] font-bold shadow-sm transition-all cursor-pointer -rotate-1
              "
            >
              Start Building
            </button>
          )}
        </nav>
      </header>
    </div>
  );
}
