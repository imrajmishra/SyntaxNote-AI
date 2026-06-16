import { z } from "zod";

export const CreateNoteSchema = z.object({
    title: z
    .string()
    .trim()
    .min(1, "Tittle is required")
    .max(50, "Tittle is too long"),

    cobtent: z
    .string()
    .default(""),


    folderId: z
    .uuid()
    .nullable()
    .optional(),

    tags: z
    .array(z.string())
    .default([]),

    isPinned: z
    .boolean()
    .optional(),

    isFavorite: z
    .boolean()
    .optional(),
});

export const UpdateNoteSchema = z.object({
    title: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .optional(),

    content: z
    .string()
    .optional(),

    folderId: z
    .uuid()
    .nullable()
    .optional(),

    tags: z
    .array(z.string())
    .optional(),

    isPinned: z
    .boolean()
    .optional(),

    isFavorite: z
    .boolean()
    .optional(),
});


export const NoteParamsSchema = z.object({
  id: z.uuid("Invalid note id"),
});

export const SearchNoteSchema = z.object({
    q: z
    .string()
    .trim()
    .min(1, "Search query is required")
    .max(200),
});


export type CreateNoteIndex = z.infer<typeof CreateNoteSchema>;
export type UpdateNoteIndex = z.infer<typeof UpdateNoteSchema>;
export type NoteParamsIndex = z.infer<typeof NoteParamsSchema>;
export type SearchNoteIndex = z.infer<typeof SearchNoteSchema>;