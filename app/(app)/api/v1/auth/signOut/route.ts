"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();

  // 1. Sign out from Supabase
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.log("Error Signing out: ", error.message);
    return;
  }

  // 2. Revalidate the home page or layout to remove authenticated UI
  revalidatePath("/", "layout");

  // 3. Redirect to the login page
  redirect("/sign-in");
};