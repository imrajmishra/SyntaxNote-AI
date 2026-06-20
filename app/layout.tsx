import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });
import { cn } from "@/lib/utils";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "SyntaxNote",
  description:
    "SyntaxNote transforms plain text into organized knowledge using the power of Markdown.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          inter.className,
          "dark:bg-black bg-amber-50 dark:text-white min-h-screen flex flex-col justify-between",
        )}
      >
        <Header user={user?.user_metadata?.name ?? user?.email ?? null} />
        <main className="w-full grow flex flex-col">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
