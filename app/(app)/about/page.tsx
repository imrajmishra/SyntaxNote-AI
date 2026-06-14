"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export default function AboutPage() {
  const [guestStamps, setGuestStamps] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("syntaxnote_guest_stamps");
    if (saved) {
      setGuestStamps(JSON.parse(saved));
    }
  }, []);

  const [doodleFines, setDoodleFines] = useState(0);

  // Random stamp quotes/types
  const stampQuotes = [
    "APPROVED INK ✏️",
    "VISITED CATALOG 🎟️",
    "NO FINES CHARGED 💸",
    "SCHOLAR CHECK-IN 📖",
    "RAW CSS STAMPED 🎨",
    "DRAFT APPROVED ✍️",
  ];

  const handleAddStamp = () => {
    if (guestStamps.length >= 6) {
      alert(
        "🎟️ Your library check-in card is completely full! Thanks for visiting so many times.",
      );
      return;
    }
    const randQuote =
      stampQuotes[Math.floor(Math.random() * stampQuotes.length)];
    const dateStr = new Date().toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
    const fullStamp = `${randQuote} • ${dateStr}`;
    const updated = [...guestStamps, fullStamp];
    setGuestStamps(updated);
    localStorage.setItem("syntaxnote_guest_stamps", JSON.stringify(updated));
  };

  const clearStamps = () => {
    setGuestStamps([]);
    localStorage.removeItem("syntaxnote_guest_stamps");
  };

  // Simulate doodle fine calculation on mount/interaction
  useEffect(() => {
    // Generate a funny random fine for doodling
    const randFine = (Math.random() * 1.5).toFixed(2);
    setDoodleFines(parseFloat(randFine));
  }, []);

  return (
    <div className="min-h-full flex flex-col justify-between select-none relative pt-4 pb-2 px-2 font-patrick text-slate-800">
      {/* Page Title */}
      <div className="text-center mb-6">
        <h2 className="font-caveat text-5xl font-bold text-slate-800 m-0 tracking-wide">
          📜 The SyntaxNote Chronicles
        </h2>
        <p className="font-patrick text-xl text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
          The story of a full-screen, responsive React workspace designed with
          vintage textures and premium micro-interactions.
        </p>
        <div className="w-24 h-px bg-slate-300 mx-auto mt-2" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8 grow">
        {/* LEFT COLUMN: Scrapbook Story */}
        <div className="w-full lg:w-[60%] space-y-5 pr-2 border-r border-slate-300/40">
          {/* Section 1: The Vision */}
          <div className="relative p-5 rounded border border-dashed border-slate-300 bg-white/40 shadow-sm rotate-[-0.5deg]">
            <div className="absolute -top-2 left-6 px-2 py-0.5 bg-yellow-100/80 text-yellow-800 rounded border border-yellow-200 text-xs font-bold uppercase tracking-wider">
              The Vision 💡
            </div>
            <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">
              SyntaxNote was born from a simple realization:{" "}
              <strong>modern digital note-taking is too sterile.</strong> We
              missed the scratchy feedback of a graphite pencil, the coffee-ring
              stains of late-night study sessions, and the absolute freedom of
              sketching doodles on the ruled margins of an open notebook.
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
              We blended the comforting warmth of traditional stationery with
              full digital capabilities—including on-the-fly markdown
              compilations, syntax grammar parsing, and simulated server log
              outputs.
            </p>
          </div>

          {/* Section 2: Craftsmanship */}
          <div className="relative p-5 rounded border border-dashed border-slate-300 bg-white/40 shadow-sm rotate-[0.8deg]">
            <div className="absolute -top-2 left-6 px-2 py-0.5 bg-violet-100/80 text-violet-850 rounded border border-violet-200 text-xs font-bold uppercase tracking-wider">
              Hand-Crafted Details 🎨
            </div>
            <ul className="mt-1.5 space-y-1.5 text-[14.5px] text-slate-650 list-disc pl-4">
              <li>
                <strong>Torn Paper Edges</strong>: Meticulously cut out using
                mathematically jagged CSS polygon clipping bounds.
              </li>
              <li>
                <strong>Pencil-stroke Circle Underlines</strong>: Link selection
                loops animated using SVG dash offsets.
              </li>
              <li>
                <strong>Eyeball mascot Peeking</strong>: Mascot covering eyes to
                protect password secrets.
              </li>
              <li>
                <strong>Washi Tape CTA Decals</strong>: Anchored using dashed
                border-x decals.
              </li>
            </ul>
          </div>

          {/* Section 3: Library Rules */}
          <div className="relative p-5 rounded border border-dashed border-slate-300 bg-white/40 shadow-sm rotate-[-0.3deg]">
            <div className="absolute -top-2 left-6 px-2 py-0.5 bg-rose-100/80 text-rose-800 rounded border border-rose-200 text-xs font-bold uppercase tracking-wider">
              Library Rules 📜
            </div>
            <div className="mt-1.5 space-y-1 text-slate-650 text-[14.5px]">
              <div className="flex items-center gap-1.5">
                ✓ Doodling and margin sketching is highly encouraged.
              </div>
              <div className="flex items-center gap-1.5">
                ✓ Do not spill hot digital coffee on the text areas.
              </div>
              <div className="flex items-center gap-1.5">
                ✓ Passwords must be stronger than wet tracing paper.
              </div>
              <div className="flex items-center gap-1.5">
                ❌ No tearing out sheets (we ran out of virtual adhesive glue).
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Guestbook Stamp & Fine log */}
        <div className="w-full lg:w-[40%] flex flex-col justify-between gap-6 pl-2">
          {/* Guestbook Stamp Card */}
          <div className="relative p-5 rounded border border-dashed border-slate-300 bg-amber-50/45 shadow-sm rotate-[1.2deg] flex flex-col justify-between grow">
            <div className="absolute -top-2 left-6 px-2 py-0.5 bg-amber-100/80 text-amber-800 rounded border border-amber-200 text-xs font-bold uppercase tracking-wider">
              Visitor Log Stamp Card 🎟
            </div>

            <div>
              <p className="mt-1.5 text-xs text-slate-500 leading-normal mb-3">
                Check in at our virtual library front desk! Click below to stamp
                your vintage catalog library card with custom ink markers.
              </p>

              {/* Grid of Stamp slots (6 slots max) */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {[0, 1, 2, 3, 4, 5].map((idx) => {
                  const stamp = guestStamps[idx];
                  return (
                    <div
                      key={idx}
                      className="h-14 border border-dashed border-slate-300 rounded bg-white/60 flex items-center justify-center p-1 text-center relative overflow-hidden select-none"
                    >
                      {stamp ? (
                        <span
                          className="font-caveat font-bold text-xs uppercase text-violet-700 tracking-tighter leading-tight rotate-[-8deg] break-all"
                          style={{
                            textShadow: "0 0.5px 0.5px rgba(255,255,255,0.7)",
                          }}
                        >
                          {stamp}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">
                          Empty slot
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddStamp}
                className="
                  grow px-4 py-1.5 bg-[#e0f2fe]/95 hover:bg-[#bae6fd] text-sky-850 border border-slate-300 rounded
                  font-patrick text-sm font-bold shadow-sm transition-all cursor-pointer text-center
                "
              >
                Stamp Visit Card 🎟️
              </button>
              {guestStamps.length > 0 && (
                <button
                  onClick={clearStamps}
                  className="px-2 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded text-xs cursor-pointer font-bold"
                >
                  Clear Card
                </button>
              )}
            </div>
          </div>

          {/* Library Fine Calculator */}
          <div className="relative p-5 rounded border border-dashed border-slate-300 bg-rose-50/20 shadow-sm -rotate-1">
            <div className="absolute -top-2 left-6 px-2 py-0.5 bg-rose-100/80 text-rose-850 rounded border border-rose-200 text-xs font-bold uppercase tracking-wider">
              Catalog Fines Ledger 💸
            </div>

            <div className="mt-1.5 space-y-1">
              <div className="flex justify-between text-xs text-slate-500 border-b border-dashed border-slate-200 pb-1">
                <span>Margin Doodle Fine:</span>
                <span className="font-bold text-rose-700">
                  ${doodleFines.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500 border-b border-dashed border-slate-200 pb-1 pt-1">
                <span>Coffee Stain Penalty:</span>
                <span className="font-bold text-rose-750">$0.50</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-750 pt-1.5">
                <span>Total Catalog Due:</span>
                <span className="text-emerald-700">$0.00 (Waived!)</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 select-text leading-tight">
              *All canvas doodles are fully sponsored. No actual library fees
              will ever be collected. Keep sketching!
            </p>
          </div>
        </div>
      </div>

      {/* Footer stamp quote */}
      <div className="text-center border-t border-slate-200/70 pt-3 mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 italic">
        <Heart size={10} className="text-rose-500" />
        <span>Written in ink and code. Hand-crafted with passion in 2026.</span>
      </div>
    </div>
  );
}
