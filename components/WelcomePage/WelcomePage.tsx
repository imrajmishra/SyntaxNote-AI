"use client";

import React from "react";
import NotebookPage from "@/components/background/NoteBookBg";

interface StickyNote {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
  rotate: string;
  page: "front" | "back";
}

interface WelcomePageProps {
  handleFlip: () => void;
  stickyNotes: StickyNote[];
  handleNoteStartDrag: (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    noteId: number,
  ) => void;
  deleteStickyNote: (id: number) => void;
}

export default function WelcomePage({
  handleFlip,
  stickyNotes,
  handleNoteStartDrag,
  deleteStickyNote,
}: WelcomePageProps) {
  return (
    <NotebookPage showTornEdge={false}>
      <div className="h-full flex flex-col justify-between relative">
        {/* Hand-drawn purple ink stamp */}
        <div className="self-end mr-4">
          <div className="stamp-effect uppercase tracking-wider px-3 py-1 rounded border-2 text-[12px] font-bold">
            100% Raw CSS
          </div>
        </div>

        {/* Handwriting Headings */}
        <div className="my-30 text-center pr-8">
          <h1 className="font-caveat text-7xl font-bold tracking-tight text-slate-800 m-0 leading-none drop-shadow-[0_1px_1px_rgba(255,255,255,0.9)]">
            Welcome to SyntaxNote
          </h1>

          <p className="font-indie text-2xl text-violet-600 my-12 font-semibold drop-shadow-sm">
            Authentic paper layout, fully digital capabilities.
          </p>

          <p className="font-patrick text-xl text-slate-650 max-w-md mx-auto mt-2 leading-relaxed">
            A full-screen ruled sheet styled with organic paper
            texture, a red margin line, and smooth page flip
            transitions.
          </p>
        </div>

        {/* Washi Tape style CTA button */}
        <div className="text-center relative pr-8">
          <button
            onClick={handleFlip}
            className="
              relative px-10 py-2 bg-[#e0f2fe]/95 hover:bg-[#bae6fd] text-sky-850 border-x-4 border-dashed border-sky-400/50
              font-patrick text-2xl font-bold shadow-md hover:shadow-lg transition-all cursor-pointer -rotate-1
              before:content-[''] before:absolute before:-left-1 before:top-0 before:bottom-0 before:w-1.5 before:bg-[linear-gradient(45deg,#38bdf8_25%,transparent_25%),linear-gradient(-45deg,#38bdf8_25%,transparent_25%)] before:bg-size-[6px_6px]
            "
          >
            Flip Page to Enter
          </button>
        </div>

        {/* Feature Sticky Notes scattered in the margins of the card */}
        {stickyNotes
          .filter((note) => note.page === "front")
          .map((note) => (
            <div
              key={note.id}
              onMouseDown={(e) => handleNoteStartDrag(e, note.id)}
              onTouchStart={(e) => handleNoteStartDrag(e, note.id)}
              onDoubleClick={() => deleteStickyNote(note.id)}
              className={`
                absolute w-41.25 p-2.5 rounded shadow-md border text-[12px] leading-tight font-gochi
                cursor-grab active:cursor-grabbing transition-shadow active:shadow-lg select-none z-30
                ${note.color}
              `}
              style={{
                left: `${note.x}px`,
                top: `${note.y}px`,
                transform: `rotate(${note.rotate})`,
              }}
            >
              {/* Pin marker */}
              <div className="absolute -top-1.5 left-1/2 -ml-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm animate-pulse" />
              <p className="m-0 select-none pointer-events-none">
                {note.text}
              </p>
            </div>
          ))}

        {/* Dog-ear corner trigger */}
        <div
          onClick={handleFlip}
          className="absolute bottom-0 right-0 w-16 h-16 cursor-pointer group z-50 select-none"
          title="Flip page"
        >
          {/* Page fold triangle */}
          <div className="absolute bottom-0 right-0 w-0 h-0 border-t-32 border-l-32 border-r-0 border-b-0 border-t-slate-300 border-l-transparent group-hover:border-t-slate-400 transition-all duration-300 shadow-[-2px_-2px_4px_rgba(0,0,0,0.15)]" />
          <div
            className="absolute bottom-0 right-0 w-8 h-8 bg-neutral-200/50 group-hover:bg-neutral-300/60 transition-all duration-300"
            style={{
              clipPath: "polygon(100% 0, 0 100%, 100% 100%)",
            }}
          />
        </div>
      </div>
    </NotebookPage>
  );
}
