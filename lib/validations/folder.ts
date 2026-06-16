import { z } from "zod";

export const CreateFolderSchema = z.object({
    name: z
    .string()
    .min(1, "Folder name is required")
    .max(50, "Folder name is too long"),

    parentID: z
    .uuid()
    .nullable()
    .optional(),
});


export const UpdateFolderSchema = z.object({
    name: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .optional(),

    parentId: z
    .uuid()
    .nullable()
    .optional(),
});


export const DeleteFolderSchema = z.object({
    id: z.uuid(),
})


export type CreateFolderInput = z.infer<typeof CreateFolderSchema>;
export type UpdateFolderInput = z.infer<typeof UpdateFolderSchema>;
export type DeleteFolderInput = z.infer<typeof DeleteFolderSchema>;