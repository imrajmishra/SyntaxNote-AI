"use client";

import {
  FileText,
  CheckSquare,
  PenTool,
  Plus,
  Layers,
  Heart,
} from "lucide-react";

interface ServicesPageProps {
  onNavigate?: (href: string) => void;
}

export default function ServicesPage({ onNavigate }: ServicesPageProps) {
  const services = [
    {
      id: "markdown",
      title: "Markdown API Studio",
      description:
        "A full-featured Markdown editor with a simulated backend API. You can write, save, list, and compile your notes into clean HTML with real-time logger outputs.",
      icon: <FileText className="text-sky-600 w-8 h-8" />,
      cta: "Launch Editor 🎟️",
      href: "/md-notes",
      color: "bg-sky-50/60 border-sky-200 hover:border-sky-400 text-sky-900",
      tapeColor: "bg-sky-100/50",
    },
    {
      id: "grammar",
      title: "Rule-Based Grammar Engine",
      description:
        "Built-in real-time grammar checks that spot common spelling typos, capitalization errors, or repeated words. Features one-click auto-fixes directly in the editor.",
      icon: <CheckSquare className="text-emerald-600 w-8 h-8" />,
      cta: "Check Grammar ✏️",
      href: "/md-notes",
      color:
        "bg-emerald-50/60 border-emerald-200 hover:border-emerald-400 text-emerald-900",
      tapeColor: "bg-emerald-100/50",
    },
    {
      id: "doodle",
      title: "Creative Margin Canvas",
      description:
        "Feeling bored? Doodle, draw, or sketch directly on the margins of your ruled paper. Touch-friendly canvas supporting graphite gray, blue ink, and red markers.",
      icon: <PenTool className="text-violet-600 w-8 h-8" />,
      cta: "Sketch Doodles 🎨",
      href: "/desk",
      color:
        "bg-violet-50/60 border-violet-200 hover:border-violet-400 text-violet-900",
      tapeColor: "bg-violet-100/50",
    },
    {
      id: "sticky",
      title: "Draggable Sticky Notes",
      description:
        "Pin custom-colored post-it notes anywhere on the desk. You can drag them around, customize colors (yellow, pink, blue), and double-click to toss them away.",
      icon: <Plus className="text-rose-600 w-8 h-8" />,
      cta: "Pin A Note 📌",
      href: "/desk",
      color:
        "bg-rose-50/60 border-rose-200 hover:border-rose-400 text-rose-900",
      tapeColor: "bg-rose-100/50",
    },
    {
      id: "checklist",
      title: "Interactive Task Log",
      description:
        "Manage your daily workflows with interactive checkboxes. Checking off a task triggers a handwritten strike-through line animation.",
      icon: <Layers className="text-amber-600 w-8 h-8" />,
      cta: "Manage Checklist 📝",
      href: "/desk",
      color:
        "bg-amber-50/60 border-amber-200 hover:border-amber-400 text-amber-900",
      tapeColor: "bg-amber-100/50",
    },
  ];

  return (
    <div className="min-h-full flex flex-col justify-between select-none relative pt-4 pb-2 px-2">
      {/* Page Title */}
      <div className="text-center mb-6">
        <h2 className="font-caveat text-5xl font-bold text-slate-800 m-0 tracking-wide drop-shadow-sm flex items-center justify-center gap-2">
          📖 Library Services Catalog
        </h2>
        <p className="font-patrick text-xl text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
          Welcome to the SyntaxNote archives! Learn about the interactive tools
          and digital services tucked inside our notebook.
        </p>
        <div className="w-24 h-1px bg-slate-300 mx-auto mt-2.5" />
      </div>

      {/* Grid Layout of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 grow mb-6">
        {services.map((svc, idx) => {
          // Slight rotation for handwritten/taped index card feel
          const rotation =
            idx % 3 === 0
              ? "-rotate-[1deg]"
              : idx % 3 === 1
                ? "rotate-[1.5deg]"
                : "rotate-[-0.8deg]";
          return (
            <div
              key={svc.id}
              className={`
                relative p-5 rounded border-2 border-dashed flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 transform ${rotation} hover:rotate-0 hover:scale-[1.02] ${svc.color}
              `}
            >
              {/* Taped Edge Decal */}
              <div
                className={`absolute -top-2 left-1/2 -ml-8 w-16 h-4 border-x border-dashed border-slate-300/40 opacity-70 pointer-events-none transform rotate-1 ${svc.tapeColor}`}
              />

              <div>
                {/* Icon & Title */}
                <div className="flex items-center gap-2 mb-3 border-b border-slate-200/50 pb-2">
                  {svc.icon}
                  <h3 className="font-caveat text-2xl font-bold tracking-wide">
                    {svc.title}
                  </h3>
                </div>

                {/* Description */}
                <p className="font-patrick text-sm text-slate-600 leading-relaxed mb-4">
                  {svc.description}
                </p>
              </div>

              {/* Call to Action Button */}
              <button
                onClick={() => onNavigate?.(svc.href)}
                className="
                  relative px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded
                  font-patrick text-sm font-bold shadow-sm transition-all cursor-pointer text-center w-full hover:-translate-y-0.5 active:translate-y-0
                "
              >
                {svc.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Funny Footnote */}
      <div className="text-center border-t border-slate-200/70 pt-3 mt-auto flex items-center justify-center gap-1 text-[11px] text-slate-400 font-sans italic">
        <Heart size={10} className="text-rose-500" />
        <span>
          All catalog services are fully functional. No library fines will be
          charged for doodles.
        </span>
      </div>
    </div>
  );
}
