"use client";

import React, { useState, useEffect, useRef } from "react";
import { Trash2, CheckSquare, PenTool, Plus, Heart } from "lucide-react";
import NotebookPage from "@/components/background/NoteBookBg";
import { useRouter } from "next/navigation";

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface StickyNote {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
  rotate: string;
  page: "front" | "back";
}

interface DeskPageProps {
  handleFlip: () => void;
}

export default function DeskPage({
  handleFlip,
}: DeskPageProps) {
  const router = useRouter();
  const scale = 1;

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

  // Local storage keys
  const TASKS_KEY = "syntaxnote_tasks";
  const NOTES_KEY = "syntaxnote_sticky_notes";
  const CANVAS_KEY = "syntaxnote_canvas";

  // Checklist state
  const [tasks, setTasks] = useState<Task[]>([]);

  // Sticky Notes state
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>([]);
  const [newNoteText, setNewNoteText] = useState<string>("");
  const [newNoteColor, setNewNoteColor] = useState<string>("yellow");

  // Dragging states
  const [draggingNoteId, setDraggingNoteId] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Canvas / Doodle States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bookContainerRef = useRef<HTMLDivElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushColor, setBrushColor] = useState<string>("#4b5563"); // Graphite gray
  const [lastX, setLastX] = useState<number>(0);
  const [lastY, setLastY] = useState<number>(0);

  // Initialize data on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("syntaxnote_user");
    if (!savedUser) {
      router.push("/");
      return;
    }

    // 1. Load tasks
    const savedTasks = localStorage.getItem(TASKS_KEY);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      setTasks([
        { id: 1, text: "Try the 3D page-flip animation", completed: true },
        { id: 2, text: "Sketch a quick doodle on the canvas", completed: false },
        { id: 3, text: "Drag a sticky note to a new spot", completed: false },
        { id: 4, text: "Check off a task to scratch it out", completed: false },
      ]);
    }

    // 2. Load sticky notes
    const savedNotes = localStorage.getItem(NOTES_KEY);
    if (savedNotes) {
      setStickyNotes(JSON.parse(savedNotes));
    } else {
      setStickyNotes([
        {
          id: 1,
          text: "Pinned: Double-click a note to toss it!",
          color: "bg-yellow-100 border-yellow-300 text-yellow-800",
          x: 100,
          y: 340,
          rotate: "-2.5deg",
          page: "back",
        },
        {
          id: 2,
          text: "Draft: Code looks super clean.",
          color: "bg-blue-100 border-blue-300 text-blue-800",
          x: 520,
          y: 355,
          rotate: "2deg",
          page: "back",
        },
      ]);
    }
  }, []);

  // Initialize Canvas and load saved drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.lineCap = "round";
        ctx.lineWidth = 2.5;

        // Load saved doodle
        const savedDoodle = localStorage.getItem(CANVAS_KEY);
        if (savedDoodle) {
          const img = new Image();
          img.src = savedDoodle;
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
        }
      }
    }
  }, []);

  // Sync state helpers
  const saveTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    localStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));
  };

  const saveStickyNotes = (newNotes: StickyNote[]) => {
    setStickyNotes(newNotes);
    localStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
  };

  // Coordinates helper
  const getCoordinates = (
    e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent,
  ) => {
    if ("touches" in e && e.touches.length > 0) {
      return {
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
      };
    }
    const mouseEvent = e as MouseEvent | React.MouseEvent;
    return {
      clientX: mouseEvent.clientX,
      clientY: mouseEvent.clientY,
    };
  };

  // Drawing Actions
  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const coords = getCoordinates(e);

    const x = (coords.clientX - rect.left) / scale;
    const y = (coords.clientY - rect.top) / scale;

    setIsDrawing(true);
    setLastX(x);
    setLastY(y);
  };

  const draw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const coords = getCoordinates(e);

    const x = (coords.clientX - rect.left) / scale;
    const y = (coords.clientY - rect.top) / scale;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushColor === "#ffffff" ? 20 : 2.5;
      ctx.stroke();
    }

    setLastX(x);
    setLastY(y);

    // Complete sketch task
    if (tasks.length > 1 && !tasks[1].completed) {
      toggleTask(2);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    // Save drawing to localStorage
    const canvas = canvasRef.current;
    if (canvas) {
      localStorage.setItem(CANVAS_KEY, canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      localStorage.removeItem(CANVAS_KEY);
    }
  };

  // Tasks Checklist Actions
  const toggleTask = (id: number) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasks(updated);
  };

  // Auto task log solver triggers confetti or logs
  useEffect(() => {
    if (tasks.length > 0) {
      const allChecked = tasks.filter((t) => t.id !== 4).every((t) => t.completed);
      if (allChecked && !tasks[3].completed) {
        toggleTask(4);
      }
    }
  }, [tasks]);

  // Sticky Notes actions
  const addStickyNote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    let colorClass = "bg-yellow-100 border-yellow-300 text-yellow-800";
    if (newNoteColor === "pink")
      colorClass = "bg-pink-100 border-pink-300 text-pink-800";
    else if (newNoteColor === "blue")
      colorClass = "bg-blue-100 border-blue-300 text-blue-800";

    const angles = ["-3deg", "-1.5deg", "1.5deg", "3deg", "-2deg", "2deg"];
    const randomAngle = angles[Math.floor(Math.random() * angles.length)];

    const newNote: StickyNote = {
      id: Date.now(),
      text: newNoteText,
      color: colorClass,
      x: 250 + Math.random() * 80,
      y: 280 + Math.random() * 50,
      rotate: randomAngle,
      page: "back",
    };

    saveStickyNotes([...stickyNotes, newNote]);
    setNewNoteText("");
  };

  const deleteStickyNote = (id: number) => {
    const updated = stickyNotes.filter((note) => note.id !== id);
    saveStickyNotes(updated);
  };

  // Draggable Actions for Sticky Notes
  const handleNoteStartDrag = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    noteId: number,
  ) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    const note = stickyNotes.find((n) => n.id === noteId);
    if (!note) return;

    setDraggingNoteId(noteId);
    setDragOffset({
      x: coords.clientX - note.x * scale,
      y: coords.clientY - note.y * scale,
    });
  };

  const handleNoteDrag = (
    e: React.MouseEvent | React.TouchEvent | TouchEvent | MouseEvent,
  ) => {
    if (draggingNoteId === null) return;
    const coords = getCoordinates(e);

    const updatedX = (coords.clientX - dragOffset.x) / scale;
    const updatedY = (coords.clientY - dragOffset.y) / scale;

    const note = stickyNotes.find((n) => n.id === draggingNoteId);
    if (!note) return;

    const rect = bookContainerRef.current
      ? bookContainerRef.current.getBoundingClientRect()
      : { width: window.innerWidth, height: window.innerHeight };

    const constrainedX = Math.max(10, Math.min(rect.width - 160, updatedX));
    const constrainedY = Math.max(10, Math.min(rect.height - 130, updatedY));

    const updatedNotes = stickyNotes.map((n) =>
      n.id === draggingNoteId ? { ...n, x: constrainedX, y: constrainedY } : n
    );

    setStickyNotes(updatedNotes);

    // Complete drag task
    if (tasks.length > 2 && !tasks[2].completed) {
      toggleTask(3);
    }
  };

  const handleNoteEndDrag = () => {
    if (draggingNoteId !== null) {
      saveStickyNotes(stickyNotes);
      setDraggingNoteId(null);
    }
  };

  // Flip back to cover page handler
  const handleGoBack = () => {
    // Navigate back to the cover page root `/`
    router.push("/");
  };

  return (
    <div
      ref={bookContainerRef}
      className="min-h-full w-full flex flex-col select-none relative bg-slate-900 text-slate-100 "
      onMouseMove={handleNoteDrag}
      onTouchMove={handleNoteDrag}
      onMouseUp={handleNoteEndDrag}
      onTouchEnd={handleNoteEndDrag}
    >
      <div className="w-full max-h-full mx-auto  flex flex-col">
        <NotebookPage showTornEdge={false}>
          {/* Page Title */}
          <div className="text-center mb-6">
            <h2 className="font-caveat text-5xl pt-15 font-bold text-slate-800 m-0 tracking-wide">
              The SyntaxNote Chronicles
            </h2>
            <p className="font-patrick text-xl  text-slate-500 mt-5 max-w-md mx-auto leading-relaxed">
              The story of a full-screen, responsive React workspace designed
              with vintage textures and premium micro-interactions.
            </p>
            <div className="w-24 h-px bg-slate-300 mx-auto mt-2" />
          </div>

          <div className="flex flex-col lg:flex-row gap-8 grow">
            {/* LEFT COLUMN: Scrapbook Story */}
            <div className="w-full lg:w-[60%] space-y-5 pr-2 border-r border-slate-300/40">
              {/* Section 1: The Vision */}
              <div className="relative p-5 rounded border border-dashed border-slate-300 bg-white shadow-sm ">
                <div className="absolute -top-2 left-6 px-2 py-0.5 bg-yellow-100/80 text-yellow-800 rounded border border-yellow-200 text-xs font-bold uppercase tracking-wider">
                  The Vision 💡
                </div>
                <p className="mt-1.5 text-[15px] leading-relaxed text-slate-700">
                  SyntaxNote was born from a simple realization:{" "}
                  <strong>modern digital note-taking is too sterile.</strong> We
                  missed the scratchy feedback of a graphite pencil, the
                  coffee-ring stains of late-night study sessions, and the
                  absolute freedom of sketching doodles on the ruled margins of
                  an open notebook.
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-700">
                  We blended the comforting warmth of traditional stationery
                  with full digital capabilities—including on-the-fly markdown
                  compilations, syntax grammar parsing, and simulated server log
                  outputs.
                </p>
              </div>

              {/* Section 2: Craftsmanship */}
              <div className="relative p-5 rounded border border-dashed border-slate-300 bg-white shadow-sm ">
                <div className="absolute -top-2 left-6 px-2 py-0.5 bg-violet-100/80 text-violet-850 rounded border border-violet-200 text-xs font-bold uppercase tracking-wider">
                  Hand-Crafted Details
                </div>
                <ul className="mt-1.5 space-y-1.5 text-[14.5px] text-slate-650 list-disc pl-4">
                  <li>
                    <strong>Torn Paper Edges</strong>: Meticulously cut out
                    using mathematically jagged CSS polygon clipping bounds.
                  </li>
                  <li>
                    <strong>Pencil-stroke Circle Underlines</strong>: Link
                    selection loops animated using SVG dash offsets.
                  </li>
                  <li>
                    <strong>Eyeball mascot Peeking</strong>: Mascot covering
                    eyes to protect password secrets.
                  </li>
                  <li>
                    <strong>Washi Tape CTA Decals</strong>: Anchored using
                    dashed border-x decals.
                  </li>
                </ul>
              </div>

              {/* Section 3: Library Rules */}
              <div className="relative p-5 rounded border border-dashed border-slate-300 bg-white shadow-sm ">
                <div className="absolute -top-2 left-6 px-2 py-0.5 bg-rose-100/80 text-rose-800 rounded border border-rose-200 text-xs font-bold uppercase tracking-wider">
                  MarkDown Rules
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
                    ❌ No tearing out sheets (we ran out of virtual adhesive
                    glue).
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Checklist & note creator */}
              <div className="w-[55%] h-full flex flex-col justify-between pl-3">
                {/* Tasks header */}
                <div>
                  <div className="flex items-center gap-2 text-slate-800 mb-2 border-b-2 border-dashed border-slate-300 pb-1.5">
                    <CheckSquare size={16} className="text-violet-600" />
                    <h3 className="font-patrick text-lg font-bold">
                      Interactive Task Log
                    </h3>
                  </div>

                  {/* Wavy check lists */}
                  <ul className="space-y-1 font-patrick text-[16px] text-slate-700 handwritten-list m-0 p-0">
                    {tasks.map((t) => (
                      <li
                        key={t.id}
                        onClick={() => toggleTask(t.id)}
                        className={`cursor-pointer transition-all hover:translate-x-0.5 hover:text-slate-900 ${
                          t.completed
                            ? "line-through decoration-red-500/80 decoration-wavy decoration-2 text-slate-400"
                            : ""
                        }`}
                      >
                        {t.text}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Go back to cover button */}
                <div className="my-4 text-center relative z-40">
                  <button
                    onClick={handleFlip}
                    className="
                            relative px-8 py-2.5 bg-[#fee2e2]/95 hover:bg-[#fecaca] text-rose-800 border-x-4 border-dashed border-rose-400/50
                            font-patrick text-xl font-bold shadow-sm hover:shadow-md transition-all cursor-pointer -rotate-1
                            before:content-[''] before:absolute before:-left-1 before:top-0 before:bottom-0 before:w-1.5 before:bg-[linear-gradient(45deg,#f43f5e_25%,transparent_25%),linear-gradient(-45deg,#f43f5e_25%,transparent_25%)] before:bg-size-[6px_6px]
                          "
                  >
                    Go Back to Cover
                  </button>
                </div>

                {/* Sticky note creator */}
                <div className="mt-6 border-t border-slate-300 pt-3 z-40">
                  <h4 className="font-patrick text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Pin a Sticky Note
                  </h4>
                  <form
                    onSubmit={addStickyNote}
                    className="flex gap-2 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Type a quick note..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="grow px-2 py-1 bg-white/70 border border-slate-300 rounded font-patrick text-xs text-slate-800 focus:outline-none focus:border-violet-500"
                      maxLength={35}
                    />

                    {/* Color selectors */}
                    <div className="flex gap-1.5">
                      {["yellow", "pink", "blue"].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewNoteColor(color)}
                          className={`w-4 h-4 rounded-full border cursor-pointer ${
                            color === "yellow"
                              ? "bg-yellow-100 border-yellow-300"
                              : color === "pink"
                                ? "bg-pink-100 border-pink-300"
                                : "bg-blue-100 border-blue-300"
                          } ${newNoteColor === color ? "ring-2 ring-violet-500 ring-offset-1 scale-110" : ""}`}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="p-1 bg-violet-600 text-white rounded hover:bg-violet-700 cursor-pointer shadow-sm flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </NotebookPage>
      </div>

      {/* Draggable Sticky Notes (overlaying the entire page content) */}
      {stickyNotes
        .filter((note) => note.page === "back")
        .map((note) => (
          <div
            key={note.id}
            onMouseDown={(e) => handleNoteStartDrag(e, note.id)}
            onTouchStart={(e) => handleNoteStartDrag(e, note.id)}
            onDoubleClick={() => deleteStickyNote(note.id)}
            className={`
              absolute w-44 p-2.5 rounded shadow-md border text-[11.5px] leading-tight font-gochi
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
            <div className="absolute -top-1.5 left-1/2 -ml-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm" />
            <p className="m-0 select-none pointer-events-none">{note.text}</p>
          </div>
        ))}
    </div>
  );
}
