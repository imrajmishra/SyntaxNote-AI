"use client";

import React from "react";
import { Pencil } from "lucide-react";

interface PencilLoaderProps {
  text?: string;
  subtitle?: string;
  className?: string;
}

export default function PencilLoader({
  text = "Inking notebook lines...",
  subtitle = "Preparing light parchment wood desk...",
  className = "fixed inset-0 z-50",
}: PencilLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center bg-[#fbfbf8] select-none font-patrick ${className}`}>
      {/* Animated Pencil Sketching SVG */}
      <div className="w-48 h-48 relative flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Ruled lines inside outline */}
          <line x1="25" y1="40" x2="75" y2="40" stroke="#a3c5f5" strokeWidth="1.5" className="animate-draw-line" style={{ animationDelay: "0.2s" }} />
          <line x1="25" y1="50" x2="75" y2="50" stroke="#a3c5f5" strokeWidth="1.5" className="animate-draw-line" style={{ animationDelay: "0.4s" }} />
          <line x1="25" y1="60" x2="75" y2="60" stroke="#a3c5f5" strokeWidth="1.5" className="animate-draw-line" style={{ animationDelay: "0.6s" }} />
          <line x1="25" y1="70" x2="75" y2="70" stroke="#a3c5f5" strokeWidth="1.5" className="animate-draw-line" style={{ animationDelay: "0.8s" }} />

          {/* Red Margin */}
          <line x1="38" y1="25" x2="38" y2="75" stroke="#ff8ca3" strokeWidth="1.5" className="animate-draw-line" style={{ animationDelay: "0.3s" }} />

          {/* Page Outline */}
          <rect
            x="20"
            y="20"
            width="60"
            height="60"
            rx="4"
            fill="none"
            stroke="#4b5563"
            strokeWidth="2.5"
            className="animate-draw-line"
          />

        </svg>

        {/* Lucide Pencil Icon */}
        <div className="absolute top-0 left-0 w-8 h-8 animate-pencil-move text-slate-700 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">
          <Pencil className="w-full h-full stroke-2" />
        </div>
      </div>

      <h2 className="font-caveat text-3xl font-bold text-slate-700 m-0 mt-4 animate-pulse">
        {text}
      </h2>
      {subtitle && (
        <p className="font-patrick text-sm text-slate-400 mt-1.5 italic">
          {subtitle}
        </p>
      )}

      {/* CSS Animations defined inside a standard style block for maximum portability */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes draw-line-loader {
          to {
            stroke-dashoffset: 0;
          }
        }
        .animate-draw-line {
          stroke-dasharray: 240;
          stroke-dashoffset: 240;
          animation: draw-line-loader 1.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes pencil-move-loader {
          0% { transform: translate(29px, 29px); }
          20% { transform: translate(125px, 38px); }
          40% { transform: translate(58px, 86px); }
          60% { transform: translate(125px, 106px); }
          80% { transform: translate(48px, 134px); }
          100% { transform: translate(96px, 96px); }
        }
        .animate-pencil-move {
          animation: pencil-move-loader 1.8s ease-in-out forwards;
        }
      `}} />
    </div>
  );
}
