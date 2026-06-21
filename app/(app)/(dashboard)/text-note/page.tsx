"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  FileText,
  Check,
  Trash2,
  Save,
  BookOpen,
  FileCode,
  AlertCircle,
  CornerDownRight,
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Heading1,
  Heading2,
  Code,
  List,
  Copy,
  Download,
  CheckCircle2,
  Pin,
  Heart,
  Tag,
  FolderOpen,
} from "lucide-react";
import { Folder, Note } from "@/lib/db";

interface GrammarSuggestion {
  offset: number;
  length: number;
  text: string;
  suggestion: string;
  message: string;
}

// Local regex grammar checker
const localGrammarChecker = {
  checkGrammar: async (text: string): Promise<GrammarSuggestion[]> => {
    await new Promise((r) => setTimeout(r, 200));
    const suggestions: GrammarSuggestion[] = [];

    const iMatches = [...text.matchAll(/(?:\b)(i)(?:\b)/g)];
    iMatches.forEach((match) => {
      if (match.index !== undefined) {
        suggestions.push({
          offset: match.index,
          length: 1,
          text: "i",
          suggestion: "I",
          message: 'The pronoun "I" should always be capitalized.',
        });
      }
    });

    const recieveMatches = [
      ...text.matchAll(/\b(recieve|recieved|recieving)\b/gi),
    ];
    recieveMatches.forEach((match) => {
      if (match.index !== undefined) {
        const val = match[1].toLowerCase();
        let sug = "receive";
        if (val === "recieved") sug = "received";
        if (val === "recieving") sug = "receiving";
        suggestions.push({
          offset: match.index,
          length: val.length,
          text: match[1],
          suggestion: sug,
          message: 'Spelling mistake: "i" before "e" except after "c".',
        });
      }
    });

    const tehMatches = [...text.matchAll(/\b(teh)\b/gi)];
    tehMatches.forEach((match) => {
      if (match.index !== undefined) {
        suggestions.push({
          offset: match.index,
          length: 3,
          text: match[1],
          suggestion: match[1][0] === "T" ? "The" : "the",
          message: 'Spelling typo. Did you mean "the"?',
        });
      }
    });

    const doubleWords = [...text.matchAll(/\b(\w+)\s+\1\b/gi)];
    doubleWords.forEach((match) => {
      if (match.index !== undefined) {
        suggestions.push({
          offset: match.index,
          length: match[0].length,
          text: match[0],
          suggestion: match[1],
          message: `Repeated word: "${match[1]}"`,
        });
      }
    });

    return suggestions;
  },
};

function TextNoteStudioInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeNoteId = searchParams.get("id");

  const [noteId, setNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("Welcome Note");
  const [content, setContent] = useState<string>("");
  const [folderId, setFolderId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  const [allFolders, setAllFolders] = useState<Folder[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  
  const [grammarSuggestions, setGrammarSuggestions] = useState<GrammarSuggestion[]>([]);

  // Right-hand pane tab state: 'preview' | 'organization' | 'files'
  const [activeRightTab, setActiveRightTab] = useState<"preview" | "organization" | "files">("preview");

  // Loading states
  const [checkingGrammar, setCheckingGrammar] = useState<boolean>(false);
  const [savingNote, setSavingNote] = useState<boolean>(false);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [isAutoSaved, setIsAutoSaved] = useState<boolean>(true);
  const [newTagName, setNewTagName] = useState("");

  // Initialize TipTap Rich Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      setIsAutoSaved(false);
    },
    editorProps: {
      attributes: {
        class:
          "w-full h-full p-4 focus:outline-none overflow-y-auto font-patrick text-slate-800 text-[15px] leading-[28px] ruled-lines select-text min-h-[350px] outline-none",
      },
    },
  });

  // 1. Fetch directories on load or note transition
  const fetchFoldersAndNotes = async (silent = false) => {
    if (!silent) setLoadingList(true);
    try {
      const [foldersRes, notesRes] = await Promise.all([
        fetch("/api/v1/folder").then((res) => res.json()),
        fetch("/api/v1/notes").then((res) => res.json()),
      ]);
      if (foldersRes.success) setAllFolders(foldersRes.folders);
      if (notesRes.success) setAllNotes(notesRes.notes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  // 2. Fetch specific note detail on mount or ID change
  useEffect(() => {
    fetchFoldersAndNotes(true);

    const loadNoteDetail = async () => {
      if (activeNoteId) {
        try {
          const res = await fetch(`/api/v1/notes/${activeNoteId}`).then((r) => r.json());
          if (res.success && res.note) {
            setNoteId(res.note.id);
            setTitle(res.note.title);
            setContent(res.note.content);
            setFolderId(res.note.folderId);
            setTags(res.note.tags);
            setIsPinned(res.note.isPinned);
            setIsFavorite(res.note.isFavorite);
            setGrammarSuggestions([]);
            if (editor) {
              editor.commands.setContent(res.note.content);
            }
            // Sync auto-save states
            setIsAutoSaved(true);
          }
        } catch (e) {
          console.error("Failed to load note data", e);
        }
      } else {
        // Automatically fetch all notes, load first or create welcome note
        try {
          const notesRes = await fetch("/api/v1/notes").then((r) => r.json());
          if (notesRes.success && notesRes.notes.length > 0) {
            router.push(`/text-note?id=${notesRes.notes[0].id}`);
          } else {
            createDefaultWelcomeNote();
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadNoteDetail();
  }, [activeNoteId, editor]);

  // Seeding default Welcome Note
  const createDefaultWelcomeNote = async () => {
    try {
      const res = await fetch("/api/v1/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Welcome Note",
          content: `<h1>Welcome to SyntaxNote TipTap Studio!</h1><p>This is an advanced <strong>WYSIWYG rich text environment</strong> styled in a premium <strong>dark mode theme</strong>. Type directly on the dark ruled lines and test out rich editing controls!</p><h2>Editor Features</h2><ul><li><strong>Interactive TipTap Engine</strong>: A robust rich text editor replacing standard textareas.</li><li><strong>Dark Mode Aesthetics</strong>: Charcoal ruled backgrounds built to protect eyes and make text stand out.</li><li><strong>Live Markdown Preview</strong>: Dynamic compiler logs view on matching dark document sheets.</li><li><strong>One-Click Formatting Ribbon</strong>: Easily toggle bold, italics, headings, code, and lists.</li></ul><p>Write some teh typos to test the grammar check!</p>`,
          folderId: null,
          tags: ["tutorial"],
        }),
      }).then((r) => r.json());

      if (res.success) {
        router.push(`/text-note?id=${res.note.id}`);
        // Notify sidebar
        window.dispatchEvent(new Event("refresh-sidebar"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // 3. Debounced Auto-save
  useEffect(() => {
    if (!noteId || isAutoSaved) return;

    const saveTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/notes/${noteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            content,
            folderId,
            tags,
            isPinned,
            isFavorite,
          }),
        }).then((r) => r.json());

        if (res.success) {
          setIsAutoSaved(true);
          // Notify sidebar to refresh note lists
          window.dispatchEvent(new Event("refresh-sidebar"));
        }
      } catch (e) {
        console.error("Auto save failed", e);
      }
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [title, content, folderId, tags, isPinned, isFavorite, noteId, isAutoSaved]);

  // API Call: Save Note (Force Manual Save)
  const triggerSaveNote = async () => {
    if (!noteId) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/v1/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content,
          folderId,
          tags,
          isPinned,
          isFavorite,
        }),
      }).then((r) => r.json());

      if (res.success) {
        setIsAutoSaved(true);
        window.dispatchEvent(new Event("refresh-sidebar"));
        alert(`💾 Note "${title}" saved successfully!`);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save note.");
    } finally {
      setSavingNote(false);
    }
  };

  // API Call: Grammar Check
  const triggerGrammarCheck = async () => {
    if (!editor) return;
    setCheckingGrammar(true);
    const plainText = editor.getText();
    try {
      const suggestions = await localGrammarChecker.checkGrammar(plainText);
      setGrammarSuggestions(suggestions);
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingGrammar(false);
    }
  };

  // Apply grammar auto-fix
  const fixGrammar = (suggestion: GrammarSuggestion) => {
    if (!editor) return;
    const plainText = editor.getText();
    const newText =
      plainText.substring(0, suggestion.offset) +
      suggestion.suggestion +
      plainText.substring(suggestion.offset + suggestion.length);

    editor.commands.setContent(newText);
    setContent(editor.getHTML());
    setIsAutoSaved(false);

    setGrammarSuggestions((prev) =>
      prev.filter((s) => s.offset !== suggestion.offset)
    );
  };

  // Delete current Note
  const triggerDeleteNote = async () => {
    if (!noteId) return;
    if (!confirm(`Are you sure you want to delete note "${title}"?`)) return;

    try {
      const res = await fetch(`/api/v1/notes/${noteId}`, {
        method: "DELETE",
      }).then((r) => r.json());

      if (res.success) {
        window.dispatchEvent(new Event("refresh-sidebar"));
        router.push("/text-note");
      } else {
        alert(res.message || "Failed to delete note");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Tag list helpers
  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    const tag = newTagName.trim().toLowerCase().replace(/^#/, "");
    if (!tag) return;
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      setIsAutoSaved(false);
    }
    setNewTagName("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    setIsAutoSaved(false);
  };

  // Copy compiled HTML
  const copyHtml = () => {
    navigator.clipboard.writeText(content);
    alert("📋 HTML copied to clipboard successfully!");
  };

  // Download raw markdown/HTML file
  const downloadMarkdownFile = () => {
    const blob = new Blob([content], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.replace(/\s+/g, "_")}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats Counters
  const wordCount = editor
    ? editor.getText().trim()
      ? editor.getText().trim().split(/\s+/).length
      : 0
    : 0;
  const charCount = editor ? editor.getText().length : 0;

  // Folder helper for display name formatting
  const getFolderLabel = (f: Folder) => {
    if (f.parentId) {
      const parent = allFolders.find((p) => p.id === f.parentId);
      return `${parent ? parent.name + " / " : ""}${f.name}`;
    }
    return f.name;
  return (
    <div className="min-h-full flex flex-col gap-6 relative select-none pb-8 text-slate-800 paper-theme">
      {/* Top action header bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-dashed border-neutral-300 pb-3 z-20">
        <div className="flex items-center gap-2 text-slate-800 w-full sm:max-w-xs">
          <FileText size={18} className="text-violet-500 shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setIsAutoSaved(false);
            }}
            className="bg-transparent border-none text-slate-800 font-patrick text-xl font-bold focus:outline-none focus:ring-1 focus:ring-violet-300 rounded px-1.5 w-full"
            placeholder="Note Title"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Grammar check */}
          <button
            onClick={triggerGrammarCheck}
            disabled={checkingGrammar}
            className={`px-3 py-1.5 text-xs rounded border border-slate-300 font-patrick text-slate-650 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              checkingGrammar ? "animate-pulse pointer-events-none" : ""
            }`}
            title="Verify spelling and grammar"
          >
            <Check size={13} className={checkingGrammar ? "animate-spin" : ""} />
            <span>{checkingGrammar ? "Checking..." : "Check Grammar"}</span>
          </button>

          {/* Copy HTML */}
          <button
            onClick={copyHtml}
            className="px-3 py-1.5 text-xs rounded border border-slate-300 font-patrick text-slate-650 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Copy compiled HTML code"
          >
            <Copy size={13} />
            <span>Copy HTML</span>
          </button>

          {/* Download */}
          <button
            onClick={downloadMarkdownFile}
            className="px-3 py-1.5 text-xs rounded border border-slate-300 font-patrick text-slate-655 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Download document as HTML"
          >
            <Download size={13} />
            <span>Download</span>
          </button>

          {/* Delete Current Note */}
          <button
            onClick={triggerDeleteNote}
            className="px-3 py-1.5 text-xs rounded border border-rose-300 font-patrick text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Delete current note"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>

          {/* Save Note */}
          <button
            onClick={triggerSaveNote}
            disabled={savingNote}
            className={`px-4 py-1.5 text-xs rounded border border-violet-500 font-patrick text-white bg-violet-650 hover:bg-violet-555 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              savingNote ? "animate-pulse pointer-events-none" : ""
            }`}
            title="Save note"
          >
            <Save size={13} />
            <span>{savingNote ? "Saving..." : "Save Note"}</span>
          </button>
        </div>
      </div>

      {/* Main split screen */}
      <div className="grow flex flex-col md:flex-row gap-6 min-h-120">
        {/* LEFT COMPONENT: TipTap Rich Editor */}
        <div className="w-full md:w-[50%] flex flex-col justify-between pr-0 md:pr-3 border-r-0 md:border-r border-slate-300/70">
          <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 border border-slate-300 rounded p-1 mb-2">
            {[
              {
                icon: <BoldIcon size={14} />,
                title: "Bold",
                action: () => editor?.chain().focus().toggleBold().run(),
                isActive: editor?.isActive("bold"),
              },
              {
                icon: <ItalicIcon size={14} />,
                title: "Italic",
                action: () => editor?.chain().focus().toggleItalic().run(),
                isActive: editor?.isActive("italic"),
              },
              {
                icon: <Heading1 size={14} />,
                title: "Heading 1",
                action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
                isActive: editor?.isActive("heading", { level: 1 }),
              },
              {
                icon: <Heading2 size={14} />,
                title: "Heading 2",
                action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
                isActive: editor?.isActive("heading", { level: 2 }),
              },
              {
                icon: <Code size={14} />,
                title: "Code Block",
                action: () => editor?.chain().focus().toggleCodeBlock().run(),
                isActive: editor?.isActive("codeBlock"),
              },
              {
                icon: <List size={14} />,
                title: "Bullet List",
                action: () => editor?.chain().focus().toggleBulletList().run(),
                isActive: editor?.isActive("bulletList"),
              },
            ].map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={btn.action}
                className={`p-1.5 rounded transition-colors cursor-pointer ${
                  btn.isActive
                    ? "bg-violet-650 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                }`}
                title={btn.title}
              >
                {btn.icon}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-1.5 px-2 text-[10px] text-slate-500 font-sans border-l border-slate-300">
              <CheckCircle2
                size={10}
                className={isAutoSaved ? "text-emerald-500" : "text-slate-550 animate-spin"}
              />
              <span>{isAutoSaved ? "Saved" : "Syncing..."}</span>
            </div>
          </div>

          {/* Editor Container */}
          <div className="grow relative rounded border border-dashed border-neutral-300 bg-[#fbfbf8] focus-within:ring-2 focus-within:ring-violet-300/20 transition-all min-h-95 flex flex-col z-10 overflow-hidden shadow-sm">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.035] filter blur-[0.8px] z-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 200 200"
                className="w-72 h-72 fill-current text-slate-800"
              >
                <path d="M20 150 L180 150 L180 170 L20 170 Z" />
                <path d="M25 120 L175 120 L175 145 L25 145 Z" />
                <path d="M35 90 L165 90 L165 115 L35 115 Z" />
                <rect x="55" y="45" width="8" height="35" rx="1" fill="white" />
              </svg>
            </div>

            <EditorContent editor={editor} className="w-full h-full relative z-10 flex flex-col" />
          </div>

          {/* Grammar Suggestions */}
          <div className="mt-3 h-20 min-h-20 max-h-20 border-t border-slate-300 pt-2 flex flex-col justify-start overflow-hidden">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter mb-1 flex items-center gap-1">
              <AlertCircle size={10} className="text-amber-500" />
              <span>Grammar Corrections ({grammarSuggestions.length})</span>
            </div>

            <div className="grow overflow-x-auto overflow-y-hidden pb-1">
              {grammarSuggestions.length === 0 ? (
                <div className="text-slate-400 font-patrick text-xs italic mt-1">
                  No issues found. Type grammar errors (e.g. "teh" or "recieve") and click "Check Grammar".
                </div>
              ) : (
                <div className="flex gap-2.5 items-center pr-2 h-full">
                  {grammarSuggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="shrink-0 bg-slate-100 border border-slate-300 rounded px-2.5 py-1 flex items-center gap-2 max-w-52.5 shadow-sm"
                    >
                      <div className="grow text-[10px] leading-tight text-slate-650 font-sans">
                        <span className="line-through text-rose-450 mr-1">{sug.text}</span>
                        <CornerDownRight size={8} className="inline-block text-slate-400 mr-1" />
                        <span className="font-bold text-emerald-450 mr-1">{sug.suggestion}</span>
                        <span className="text-slate-400 block text-[9px] truncate">{sug.message}</span>
                      </div>
                      <button
                        onClick={() => fixGrammar(sug)}
                        className="px-1.5 py-0.5 text-[9px] font-bold font-sans bg-emerald-650 hover:bg-emerald-555 text-white rounded cursor-pointer shrink-0"
                      >
                        Fix
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats Footer */}
          <div className="flex justify-between items-center text-slate-400 font-patrick text-xs border-t border-slate-300 pt-2 select-text">
            <span>
              Words: <strong className="text-slate-350">{wordCount}</strong> | Characters:{" "}
              <strong className="text-slate-350">{charCount}</strong>
            </span>
            <span className="italic">WYSIWYG TipTap Active</span>
          </div>
        </div>

        {/* RIGHT COMPONENT: Live Preview / Note Organization Settings */}
        <div className="w-full md:w-[50%] flex flex-col justify-between pl-0 md:pl-3">
          <div className="flex items-center justify-between border-b-2 border-dashed border-neutral-300 pb-2 mb-2 z-20">
            <div className="flex gap-1.5">
              {/* Tab: HTML Preview */}
              <button
                onClick={() => setActiveRightTab("preview")}
                className={`px-2.5 py-1.5 text-xs rounded font-patrick flex items-center gap-1.5 transition-all cursor-pointer border ${
                  activeRightTab === "preview"
                    ? "border-violet-400 bg-violet-50 text-violet-700 font-bold"
                    : "border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                }`}
              >
                <FileCode size={13} />
                <span>HTML Preview</span>
              </button>

              {/* Tab: Organization */}
              <button
                onClick={() => setActiveRightTab("organization")}
                className={`px-2.5 py-1.5 text-xs rounded font-patrick flex items-center gap-1.5 transition-all cursor-pointer border ${
                  activeRightTab === "organization"
                    ? "border-violet-400 bg-violet-50 text-violet-700 font-bold"
                    : "border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                }`}
              >
                <Tag size={13} />
                <span>Organization</span>
              </button>

              {/* Tab: Saved Notes index */}
              <button
                onClick={() => {
                  setActiveRightTab("files");
                  fetchFoldersAndNotes(false);
                }}
                className={`px-2.5 py-1.5 text-xs rounded font-patrick flex items-center gap-1.5 transition-all cursor-pointer border ${
                  activeRightTab === "files"
                    ? "border-violet-400 bg-violet-50 text-violet-700 font-bold"
                    : "border-slate-300 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800"
                }`}
              >
                <BookOpen size={13} />
                <span>Index list ({allNotes.length})</span>
              </button>
            </div>
          </div>

          {/* Right tab content body */}
          <div className="grow rounded border border-dashed border-neutral-300/80 bg-[#fbfbf8] min-h-95 overflow-hidden flex flex-col p-4 relative shadow-sm text-slate-700">
            {activeRightTab === "preview" ? (
              <div className="w-full h-full overflow-y-auto flex flex-col relative select-text">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] filter blur-[0.5px] z-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-64 h-64 fill-current text-slate-800"
                  >
                    <path d="M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM11 19H3V6h8v13zm10 0h-8V6h8v13z" />
                  </svg>
                </div>

                <div
                  className="prose prose-slate max-w-none wrap-break-word grow select-text relative z-10 font-sans text-slate-850 pb-6
                    prose-h1:text-[20px] prose-h1:font-bold prose-h1:border-b prose-h1:border-slate-200 prose-h1:pb-1 prose-h1:text-slate-900
                    prose-h2:text-[17px] prose-h2:font-bold prose-h2:border-b prose-h2:border-dashed prose-h2:border-slate-200 prose-h2:pb-0.5 prose-h2:text-slate-900
                    prose-p:text-sm prose-p:leading-relaxed prose-p:text-slate-650
                    prose-li:text-sm prose-li:text-slate-650"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            ) : activeRightTab === "organization" ? (
              <div className="w-full h-full overflow-y-auto flex flex-col space-y-6">
                {/* 1. Pins and Favorites settings */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter block">
                    Important Flags
                  </span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsPinned(!isPinned);
                        setIsAutoSaved(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs transition-all cursor-pointer ${
                        isPinned
                          ? "bg-amber-100 border-amber-400 text-amber-800 font-bold"
                          : "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      <Pin size={12} className={isPinned ? "fill-amber-800" : ""} />
                      <span>{isPinned ? "Pinned Note" : "Pin Note"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsFavorite(!isFavorite);
                        setIsAutoSaved(false);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs transition-all cursor-pointer ${
                        isFavorite
                          ? "bg-rose-100 border-rose-300 text-rose-800 font-bold"
                          : "bg-slate-100 border-slate-300 text-slate-600 hover:text-slate-800"
                      }`}
                    >
                      <Heart size={12} className={isFavorite ? "fill-rose-800" : ""} />
                      <span>{isFavorite ? "Favorited" : "Favorite"}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Folder parent selection settings */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter block">
                    Parent Folder Location
                  </span>
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-slate-100 border border-slate-300 rounded-lg p-1.5">
                      <FolderOpen size={16} className="text-slate-500 shrink-0" />
                      <select
                        value={folderId || ""}
                        onChange={(e) => {
                          setFolderId(e.target.value || null);
                          setIsAutoSaved(false);
                        }}
                        className="bg-transparent border-none text-slate-700 text-xs w-full outline-none cursor-pointer font-sans"
                      >
                        <option value="" className="bg-white text-slate-800">Root (No Folder)</option>
                        {allFolders.map((f) => (
                          <option key={f.id} value={f.id} className="bg-white text-slate-800">
                            {getFolderLabel(f)}
                          </option>
                        ))}
                      </select>
                    </div>
                    {folderId && (
                      <button
                        type="button"
                        onClick={async () => {
                          const folder = allFolders.find((f) => f.id === folderId);
                          const name = folder ? folder.name : "this folder";
                          if (
                            !confirm(
                              `Are you sure you want to delete folder "${name}"? Subfolders will also be deleted, and notes inside will move to root.`
                            )
                          ) {
                            return;
                          }

                          try {
                            const res = await fetch(`/api/v1/folder/${folderId}`, {
                              method: "DELETE",
                            }).then((r) => r.json());

                            if (res.success) {
                              setFolderId(null);
                              setIsAutoSaved(false);
                              await fetchFoldersAndNotes(true);
                              window.dispatchEvent(new Event("refresh-sidebar"));
                              alert(`Folder "${name}" was deleted successfully.`);
                            } else {
                              alert(res.message || "Failed to delete folder");
                            }
                          } catch (e) {
                            console.error(e);
                            alert("Failed to delete folder");
                          }
                        }}
                        className="px-3 py-1.5 border border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                        title="Delete selected folder"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Note Tags management settings */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-inter block">
                    Note Tags ({tags.length})
                  </span>

                  {/* Active tags badges */}
                  <div className="flex flex-wrap gap-1.5 py-1">
                    {tags.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No tags assigned.</span>
                    ) : (
                      tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 bg-slate-100 border border-slate-300 text-slate-600 rounded-full shadow-sm"
                        >
                          <Tag size={10} />
                          <span>{t}</span>
                          <button
                            onClick={() => handleRemoveTag(t)}
                            className="text-slate-450 hover:text-rose-600 font-bold ml-0.5 cursor-pointer"
                            title="Remove tag"
                          >
                            &times;
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add tag form */}
                  <form onSubmit={handleAddTag} className="flex gap-2 pt-1 max-w-sm">
                    <input
                      type="text"
                      placeholder="Add tag (e.g. research)..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="flex-1 bg-slate-100 border border-slate-300 text-slate-700 text-xs rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-violet-300 focus:border-violet-500"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-violet-650 hover:bg-violet-500 text-white font-patrick text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Add Tag
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="w-full h-full overflow-y-auto flex flex-col">
                {loadingList ? (
                  <div className="grow flex items-center justify-center font-patrick text-slate-500 text-sm">
                    Loading notes index...
                  </div>
                ) : allNotes.length === 0 ? (
                  <div className="grow flex flex-col items-center justify-center text-center font-patrick text-slate-500 py-6">
                    <p className="m-0 text-sm">No saved notes found.</p>
                  </div>
                ) : (
                  <div className="space-y-2 grow pr-1">
                    {allNotes.map((note) => (
                      <div
                        key={note.id}
                        className={`flex items-center justify-between p-2.5 rounded border transition-all shadow-sm ${
                          note.id === noteId
                            ? "bg-violet-50 border-violet-300"
                            : "bg-slate-50/50 border-slate-200 hover:bg-slate-100/70"
                        }`}
                      >
                        <div
                          onClick={() => router.push(`/text-note?id=${note.id}`)}
                          className="grow flex items-center gap-1.5 cursor-pointer min-w-0"
                        >
                          <FileText size={15} className={`shrink-0 ${
                            note.id === noteId ? "text-violet-500" : "text-slate-400"
                          }`} />
                          <div className="flex flex-col min-w-0">
                            <span className={`font-patrick text-sm font-bold leading-tight truncate ${
                              note.id === noteId ? "text-violet-900" : "text-slate-700"
                            }`}>
                              {note.title}
                            </span>
                            <span className={`text-[9px] truncate ${
                              note.id === noteId ? "text-violet-650" : "text-slate-450"
                            }`}>
                              Updated {new Date(note.updatedAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 z-40">
                          {note.isPinned && (
                            <span className={`text-[9px] px-1 border rounded ${
                              note.id === noteId
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-amber-50/80 text-amber-700 border-amber-200"
                            }`}>
                              PIN
                            </span>
                          )}
                          <button
                            onClick={() => router.push(`/text-note?id=${note.id}`)}
                            className={`px-2.5 py-0.5 text-[10px] font-bold font-sans rounded cursor-pointer border ${
                              note.id === noteId
                                ? "bg-violet-600 hover:bg-violet-700 text-white border-violet-600"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300"
                            }`}
                          >
                            Load
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-center font-patrick text-[11px] text-slate-500 pt-2 select-none">
            Auto-saves modifications instantly. Check HTML or Organization tabs to edit attributes.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TextNoteStudio() {
  return (
    <React.Suspense fallback={<div className="grow flex items-center justify-center font-patrick text-slate-500 text-sm">Loading studio workspace...</div>}>
      <TextNoteStudioInner />
    </React.Suspense>
  );
}
