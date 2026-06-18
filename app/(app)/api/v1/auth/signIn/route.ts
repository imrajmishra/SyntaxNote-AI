"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignInSchema, SignInIndex } from "@/lib/validations";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  // 1. Convert FormData to an object
  const data = Object.fromEntries(formData.entries());

  // 2. Validate using Zod schema
  const validatedFields = SignInSchema.safeParse(data);

  if (!validatedFields.success) {
    // Return the error messages to the client component
    return {
      success: false,
      error: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password }: SignInIndex = validatedFields.data;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
        success: false,
        message: "Invalid email or password"
    }
  }

  revalidatePath("/", "layout");
  redirect("/");
}
