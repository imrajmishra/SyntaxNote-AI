"use client";


import React, { useState, useEffect } from "react";
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
} from "lucide-react";

interface NoteFile {
  filename: string;
  content: string;
  savedAt: string;
}

interface GrammarSuggestion {
  offset: number;
  length: number;
  text: string;
  suggestion: string;
  message: string;
}

// Mock API endpoints
const mockApi = {
  checkGrammar: async (text: string): Promise<GrammarSuggestion[]> => {
    await new Promise((r) => setTimeout(r, 450));
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

  saveNote: async (
    filename: string,
    content: string,
  ): Promise<{ success: boolean; note: NoteFile }> => {
    await new Promise((r) => setTimeout(r, 600));
    const newNote: NoteFile = {
      filename: filename.endsWith(".md") ? filename : `${filename}.md`,
      content,
      savedAt: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };

    const saved = localStorage.getItem("syntaxnote_saved_markdown") || "[]";
    const notes: NoteFile[] = JSON.parse(saved);
    const existingIdx = notes.findIndex(
      (n) => n.filename.toLowerCase() === newNote.filename.toLowerCase(),
    );
    if (existingIdx >= 0) {
      notes[existingIdx] = newNote;
    } else {
      notes.push(newNote);
    }
    localStorage.setItem("syntaxnote_saved_markdown", JSON.stringify(notes));

    return { success: true, note: newNote };
  },

  listNotes: async (): Promise<NoteFile[]> => {
    await new Promise((r) => setTimeout(r, 350));
    const saved = localStorage.getItem("syntaxnote_saved_markdown") || "[]";
    return JSON.parse(saved);
  },
};

interface MainProps {
  handleFlip: () => void;
}

export default function Main({ handleFlip }: MainProps) {
  const [filename, setFilename] = useState<string>("WelcomeNote.md");
  const [content, setContent] = useState<string>(
    `<h1>Welcome to SyntaxNote TipTap Studio!</h1><p>This is an advanced <strong>WYSIWYG rich text environment</strong> styled in a premium <strong>dark mode theme</strong>. Type directly on the dark ruled lines and test out rich editing controls!</p><h2>Editor Features</h2><ul><li><strong>Interactive TipTap Engine</strong>: A robust rich text editor replacing standard textareas.</li><li><strong>Dark Mode Aesthetics</strong>: Charcoal ruled backgrounds built to protect eyes and make text stand out.</li><li><strong>Live Markdown Preview</strong>: Dynamic compiler logs view on matching dark document sheets.</li><li><strong>One-Click Formatting Ribbon</strong>: Easily toggle bold, italics, headings, code, and lists.</li></ul><p>Write some teh typos to test the grammar check!</p>`,
  );

  const [grammarSuggestions, setGrammarSuggestions] = useState<
    GrammarSuggestion[]
  >([]);
  const [savedNotes, setSavedNotes] = useState<NoteFile[]>([]);

  // Tabs: 'preview' | 'files'
  const [activeRightTab, setActiveRightTab] = useState<"preview" | "files">(
    "preview",
  );

  // Loading states
  const [checkingGrammar, setCheckingGrammar] = useState<boolean>(false);
  const [savingNote, setSavingNote] = useState<boolean>(false);
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [isAutoSaved, setIsAutoSaved] = useState<boolean>(true);

  // Initialize TipTap Rich Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setContent(html);
      setIsAutoSaved(false);
    },
    editorProps: {
      attributes: {
        class:
          "w-full h-full p-4 focus:outline-none overflow-y-auto font-patrick text-slate-100 text-[15px] leading-[28px] dark-ruled-lines select-text min-h-[350px] outline-none",
      },
    },
  });

  // Keep auto-saved sync timer running
  useEffect(() => {
    if (isAutoSaved) return;
    const timer = setTimeout(() => {
      setIsAutoSaved(true);
    }, 800);
    return () => clearTimeout(timer);
  }, [content, isAutoSaved]);

  // Initial load
  useEffect(() => {
    triggerListNotes(true);
  }, []);

  // Sync editor content when loaded externally
  const syncEditorContent = (newContent: string) => {
    if (editor && editor.getHTML() !== newContent) {
      editor.commands.setContent(newContent);
    }
  };

  // API Call: List Notes
  const triggerListNotes = async (silent = false) => {
    if (!silent) {
      setLoadingList(true);
    }
    try {
      const notes = await mockApi.listNotes();
      setSavedNotes(notes);
    } catch (e) {
      console.error("Error listing notes", e);
    } finally {
      setLoadingList(false);
    }
  };

  // API Call: Grammar Check
  const triggerGrammarCheck = async () => {
    if (!editor) return;
    setCheckingGrammar(true);
    const plainText = editor.getText();
    try {
      const suggestions = await mockApi.checkGrammar(plainText);
      setGrammarSuggestions(suggestions);
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingGrammar(false);
    }
  };

  // API Call: Save Note
  const triggerSaveNote = async () => {
    if (!filename.trim()) return;
    setSavingNote(true);
    try {
      const result = await mockApi.saveNote(filename, content);
      if (result.success) {
        triggerListNotes(true); // reload list silently
        alert(`💾 Note "/notes/${result.note.filename}" saved successfully!`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingNote(false);
    }
  };

  // Delete a saved file
  const deleteNote = (noteFilename: string) => {
    if (!confirm(`Are you sure you want to delete "${noteFilename}"?`)) return;
    const saved = localStorage.getItem("syntaxnote_saved_markdown") || "[]";
    const notes: NoteFile[] = JSON.parse(saved);
    const updated = notes.filter(
      (n) => n.filename.toLowerCase() !== noteFilename.toLowerCase(),
    );
    localStorage.setItem("syntaxnote_saved_markdown", JSON.stringify(updated));
    setSavedNotes(updated);
  };

  // Load a saved file into editor
  const loadNote = (note: NoteFile) => {
    setFilename(note.filename);
    setContent(note.content);
    syncEditorContent(note.content);
    setGrammarSuggestions([]); // clear suggestions
    setActiveRightTab("preview");
  };

  // Apply grammar auto-fix
  const fixGrammar = (suggestion: GrammarSuggestion) => {
    if (!editor) return;
    const plainText = editor.getText();
    const newText =
      plainText.substring(0, suggestion.offset) +
      suggestion.suggestion +
      plainText.substring(suggestion.offset + suggestion.length);

    // Replace whole plain text with corrected text
    editor.commands.setContent(newText);
    setContent(editor.getHTML());

    // Remove suggestion from list
    setGrammarSuggestions((prev) =>
      prev.filter((s) => s.offset !== suggestion.offset),
    );
  };

  // Copy compiled HTML code
  const copyHtml = () => {
    navigator.clipboard.writeText(content);
    alert("📋 HTML copied to clipboard successfully!");
  };

  // Download raw HTML/markdown document
  const downloadMarkdownFile = () => {
    const blob = new Blob([content], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      filename.endsWith(".html")
        ? filename
        : filename.replace(/\.md$/, ".html"),
    );
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

  return (
    <div className="min-h-full flex flex-col gap-6 relative select-none pb-8 text-slate-100">
      {/* Top action header bar (styled dark) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-dashed border-slate-700/60 pb-3 z-20">
        <div className="flex items-center gap-2 text-slate-100 w-full sm:max-w-xs">
          <FileText size={18} className="text-violet-400 shrink-0" />
          <input
            type="text"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="bg-transparent border-none text-slate-100 font-patrick text-lg font-bold focus:outline-none focus:ring-1 focus:ring-violet-700/50 rounded px-1.5 w-full"
            placeholder="Filename.md"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Grammar check trigger button */}
          <button
            onClick={triggerGrammarCheck}
            disabled={checkingGrammar}
            className={`px-3 py-1.5 text-xs rounded border border-slate-700 font-patrick text-slate-350 bg-slate-800 hover:bg-slate-750 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              checkingGrammar ? "animate-pulse pointer-events-none" : ""
            }`}
            title="Verify spelling and grammar"
          >
            <Check
              size={13}
              className={checkingGrammar ? "animate-spin" : ""}
            />
            <span>{checkingGrammar ? "Checking..." : "Check Grammar"}</span>
          </button>

          {/* Copy HTML Button */}
          <button
            onClick={copyHtml}
            className="px-3 py-1.5 text-xs rounded border border-slate-700 font-patrick text-slate-350 bg-slate-800 hover:bg-slate-750 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Copy compiled HTML code"
          >
            <Copy size={13} />
            <span>Copy HTML</span>
          </button>

          {/* Download File Button */}
          <button
            onClick={downloadMarkdownFile}
            className="px-3 py-1.5 text-xs rounded border border-slate-700 font-patrick text-slate-355 bg-slate-800 hover:bg-slate-750 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            title="Download document as HTML"
          >
            <Download size={13} />
            <span>Download</span>
          </button>

          {/* Save trigger button */}
          <button
            onClick={triggerSaveNote}
            disabled={savingNote}
            className={`px-4 py-1.5 text-xs rounded border border-violet-700 font-patrick text-white bg-violet-650 hover:bg-violet-500 flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              savingNote ? "animate-pulse pointer-events-none" : ""
            }`}
            title="Save markdown document"
          >
            <Save size={13} />
            <span>{savingNote ? "Saving..." : "Save Note"}</span>
          </button>
        </div>
      </div>

      {/* Main split screen in Dark Theme */}
      <div className="grow flex flex-col md:flex-row gap-6 min-h-120">
        {/* LEFT COMPONENT: TipTap Dark Rich Editor */}
        <div className="w-full md:w-[50%] flex flex-col justify-between pr-0 md:pr-3 border-r-0 md:border-r border-slate-800/80">
          {/* TipTap Toolbar ribbon (Dark style) */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-850 border border-slate-700/60 rounded p-1 mb-2">
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
                action: () =>
                  editor?.chain().focus().toggleHeading({ level: 1 }).run(),
                isActive: editor?.isActive("heading", { level: 1 }),
              },
              {
                icon: <Heading2 size={14} />,
                title: "Heading 2",
                action: () =>
                  editor?.chain().focus().toggleHeading({ level: 2 }).run(),
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
                    : "text-slate-350 hover:bg-slate-800 hover:text-slate-100"
                }`}
                title={btn.title}
              >
                {btn.icon}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-1.5 px-2 text-[10px] text-slate-500 font-sans border-l border-slate-700/60">
              <CheckCircle2
                size={10}
                className={
                  isAutoSaved
                    ? "text-emerald-500"
                    : "text-slate-500 animate-spin"
                }
              />
              <span>{isAutoSaved ? "Saved" : "Typing..."}</span>
            </div>
          </div>

          {/* TipTap Editor Container (Ruled dark slate paper) */}
          <div className="grow relative rounded border border-dashed border-slate-700/60 bg-slate-900/90 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all min-h-95 flex flex-col z-10 overflow-hidden">
            {/* Subtle blurry notebooks background watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.025] filter blur-[0.8px] z-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 200 200"
                className="w-72 h-72 fill-current text-slate-100"
              >
                <path d="M20 150 L180 150 L180 170 L20 170 Z" />
                <path d="M25 120 L175 120 L175 145 L25 145 Z" />
                <path d="M35 90 L165 90 L165 115 L35 115 Z" />
                <path d="M50 40 L150 40 L150 85 L50 85 Z" />
                <rect x="55" y="45" width="8" height="35" rx="1" fill="white" />
                <rect x="40" y="95" width="8" height="15" rx="1" fill="white" />
              </svg>
            </div>

            <EditorContent
              editor={editor}
              className="w-full h-full relative z-10 flex flex-col"
            />
          </div>

          {/* Grammar Suggestions Panel (Dark themed) */}
          <div className="mt-3 h-20 min-h-20 max-h-20 border-t border-slate-800/80 pt-2 flex flex-col justify-start overflow-hidden">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-inter mb-1 flex items-center gap-1">
              <AlertCircle size={10} className="text-amber-500" />
              <span>Grammar Corrections ({grammarSuggestions.length})</span>
            </div>

            <div className="grow overflow-x-auto overflow-y-hidden pb-1">
              {grammarSuggestions.length === 0 ? (
                <div className="text-slate-500 font-patrick text-xs italic mt-1">
                  No issues found. Type grammar errors (e.g. "teh" or "recieve")
                  and click "Check Grammar".
                </div>
              ) : (
                <div className="flex gap-2.5 items-center pr-2 h-full">
                  {grammarSuggestions.map((sug, idx) => (
                    <div
                      key={idx}
                      className="shrink-0 bg-slate-800 border border-slate-700/60 rounded px-2.5 py-1 flex items-center gap-2 max-w-52.5 shadow-md animate-fade-in"
                    >
                      <div className="grow text-[10px] leading-tight text-slate-300 font-sans">
                        <span className="line-through text-rose-400 mr-1">
                          {sug.text}
                        </span>
                        <CornerDownRight
                          size={8}
                          className="inline-block text-slate-500 mr-1"
                        />
                        <span className="font-bold text-emerald-450 mr-1">
                          {sug.suggestion}
                        </span>
                        <span className="text-slate-500 block text-[9px] truncate">
                          {sug.message}
                        </span>
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

          {/* Stats Footer bar */}
          <div className="flex justify-between items-center text-slate-500 font-patrick text-xs border-t border-slate-800/50 pt-2 select-text">
            <span>
              Words: <strong className="text-slate-350">{wordCount}</strong> |
              Characters:{" "}
              <strong className="text-slate-350">{charCount}</strong>
            </span>
            <span className="italic">WYSIWYG TipTap Active</span>
          </div>
        </div>

        {/* RIGHT COMPONENT: Live HTML Render (Dark Theme) */}
        <div className="w-full md:w-[50%] flex flex-col justify-between pl-0 md:pl-3">
          {/* Tab Selection Header (Dark style) */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2 z-20">
            <div className="flex gap-2">
              {/* HTML Preview Tab */}
              <button
                onClick={() => setActiveRightTab("preview")}
                className={`px-3 py-1.5 text-xs rounded font-patrick flex items-center gap-1 transition-all cursor-pointer border ${
                  activeRightTab === "preview"
                    ? "border-violet-700 bg-violet-950/40 text-violet-300 font-bold"
                    : "border-slate-700 bg-slate-800 text-slate-350 hover:bg-slate-750 hover:text-slate-100"
                }`}
              >
                <FileCode size={13} />
                <span>HTML Preview</span>
              </button>

              {/* Saved Notes Tab */}
              <button
                onClick={() => {
                  setActiveRightTab("files");
                  triggerListNotes(false);
                }}
                className={`px-3 py-1.5 text-xs rounded font-patrick flex items-center gap-1 transition-all cursor-pointer border ${
                  activeRightTab === "files"
                    ? "border-violet-700 bg-violet-950/40 text-violet-300 font-bold"
                    : "border-slate-700 bg-slate-800 text-slate-355 hover:bg-slate-750 hover:text-slate-100"
                }`}
              >
                <BookOpen size={13} />
                <span>Saved Notes ({savedNotes.length})</span>
              </button>
            </div>

            {/* Return to cover page washi-style CTA */}
            <button
              onClick={handleFlip}
              className="
                relative px-3.5 py-1 bg-[#fee2e2]/15 hover:bg-[#fee2e2]/30 text-rose-300 border border-rose-800/40
                font-patrick text-xs font-bold shadow-sm transition-all cursor-pointer -rotate-1
              "
            >
              Back to Cover
            </button>
          </div>

          {/* Right tab content body (Dark sheet layout) */}
          <div className="grow rounded border border-dashed border-slate-700/60 bg-slate-950/65 min-h-95 overflow-hidden flex flex-col p-4 relative">
            {activeRightTab === "preview" ? (
              <div className="w-full h-full overflow-y-auto flex flex-col relative select-text">
                {/* Subtle blurry open book watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.02] filter blur-[0.5px] z-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-64 h-64 fill-current text-slate-100"
                  >
                    <path d="M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM11 19H3V6h8v13zm10 0h-8V6h8v13z" />
                  </svg>
                </div>

                {/* HTML Render Preview pane (Styled for dark mode typography) */}
                <div
                  className="prose prose-invert max-w-none wrap-break-word grow select-text relative z-10 font-sans text-slate-200 pb-6
                    prose-h1:text-[20px] prose-h1:font-bold prose-h1:border-b prose-h1:border-slate-800 prose-h1:pb-1 prose-h1:text-slate-100
                    prose-h2:text-[17px] prose-h2:font-bold prose-h2:border-b prose-h2:border-dashed prose-h2:border-slate-800 prose-h2:pb-0.5 prose-h2:text-slate-100
                    prose-p:text-sm prose-p:leading-relaxed prose-p:text-slate-305
                    prose-li:text-sm prose-li:text-slate-305
                    prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-pre:border prose-pre:border-slate-850"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            ) : (
              <div className="w-full h-full overflow-y-auto flex flex-col">
                {/* Saved notes list (Dark entries) */}
                {loadingList ? (
                  <div className="grow flex items-center justify-center font-patrick text-slate-500 text-sm">
                    Loading notes index...
                  </div>
                ) : savedNotes.length === 0 ? (
                  <div className="grow flex flex-col items-center justify-center text-center font-patrick text-slate-500 py-6">
                    <p className="m-0 text-sm">
                      No saved markdown notes found.
                    </p>
                    <p className="m-0 text-xs text-slate-550 mt-1">
                      Type in the editor and click "Save Note".
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 grow pr-1">
                    {savedNotes.map((note) => (
                      <div
                        key={note.filename}
                        className="flex items-center justify-between p-2.5 rounded bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 transition-all shadow-sm"
                      >
                        <div
                          onClick={() => loadNote(note)}
                          className="grow flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText size={15} className="text-slate-500" />
                          <div className="flex flex-col">
                            <span className="font-patrick text-sm font-bold text-slate-300 leading-tight">
                              {note.filename}
                            </span>
                            <span className="text-[9.5px] text-slate-500">
                              Saved at {note.savedAt} • {note.content.length}{" "}
                              chars
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 z-40">
                          <button
                            onClick={() => loadNote(note)}
                            className="px-2.5 py-0.5 text-[10px] font-bold font-sans bg-violet-950/40 hover:bg-violet-900 text-violet-300 rounded cursor-pointer border border-violet-850 transition-all"
                          >
                            Load
                          </button>
                          <button
                            onClick={() => deleteNote(note.filename)}
                            className="p-1 hover:bg-slate-800 text-slate-500 hover:text-rose-400 rounded transition-all cursor-pointer border border-transparent"
                            title="Delete note"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel Dark Footnote */}
          <div className="text-center font-patrick text-[11px] text-slate-500 pt-2 select-none">
            Preview compiles real-time. Select tabs to browse index records.
          </div>
        </div>
      </div>
    </div>
  );
}
