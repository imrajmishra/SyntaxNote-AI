import fs from "fs";
import path from "path";

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface DB {
  folders: Folder[];
  notes: Note[];
  tags: Tag[];
}

const DB_FILE = path.join(process.cwd(), "lib", "db.json");

// Helper to initialize db.json if not present
function initializeDB(): DB {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf8");
      return JSON.parse(data) as DB;
    } catch (e) {
      console.error("Failed to parse db.json, resetting database", e);
    }
  }

  // Seed mock data
  const defaultDB: DB = {
    folders: [
      {
        id: "f1111111-1111-1111-1111-111111111111",
        name: "Work",
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "f2222222-2222-2222-2222-222222222222",
        name: "Personal",
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "f3333333-3333-3333-3333-333333333333",
        name: "Nested Projects",
        parentId: "f1111111-1111-1111-1111-111111111111", // nested inside Work
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    notes: [
      {
        id: "n1111111-1111-1111-1111-111111111111",
        title: "Project Checklist",
        content: "<h1>Project Checklist</h1><p>Here are the key task lists:</p><ul><li>Design database schema</li><li>Build dynamic folder sidebar</li><li>Add search features</li></ul>",
        folderId: "f3333333-3333-3333-3333-333333333333",
        tags: ["todo", "dev"],
        isPinned: true,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "n2222222-2222-2222-2222-222222222222",
        title: "Grocery Shopping",
        content: "<h1>Grocery Shopping</h1><p>Buy organic vegetables, brown bread, and some pie templates.</p>",
        folderId: "f2222222-2222-2222-2222-222222222222",
        tags: ["personal", "todo"],
        isPinned: false,
        isFavorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "n3333333-3333-3333-3333-333333333333",
        title: "Welcome Note",
        content: "<h1>Welcome to SyntaxNote TipTap Studio!</h1><p>This is an advanced rich text environment styled in a premium dark mode theme.</p>",
        folderId: null,
        tags: ["tutorial"],
        isPinned: false,
        isFavorite: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    tags: [
      { id: "t1", name: "todo" },
      { id: "t2", name: "dev" },
      { id: "t3", name: "personal" },
      { id: "t4", name: "tutorial" },
    ],
  };

  saveDB(defaultDB);
  return defaultDB;
}

export function getDB(): DB {
  return initializeDB();
}

export function saveDB(db: DB): void {
  // Ensure directory exists
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}
