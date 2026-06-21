"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { cx } from "@/utils/cx";
import Sidebar from "@/components/dashboard/Sidebar";
import Toaster from "@/components/ui/Toaster";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // 1. Determine if the user is visiting a marketing layout page
  // This ensures your landing pages don't inherit the dashboard sidebar and frames!
  const isMarketingRoute =
    pathname === "/" || pathname.startsWith("/marketing");

  const getBreadcrumbName = (path: string) => {
    switch (path) {
      case "/text-note":
        return "Text Editor Note";
      default:
        return (
          path.replace(/^\//, "").split("/")[0]?.replace("-", " ") ||
          "Editor"
        );
    }
  };

  // 2. Clean, uninhibited layout wrapper for marketing routes
  if (isMarketingRoute) {
    return (
      <div
        className={cx(
          inter.className,
          "min-h-screen bg-base-100 text-base-content selection:bg-primary/20",
        )}
      >
        {children}
        <Toaster />
      </div>
    );
  }

  // 3. Premium Workspace layout wrapper for internal authenticated app routes
  return (
    <div
      className={cx(
        inter.className,
        "min-h-screen flex bg-base-300 text-base-content relative overflow-hidden transition-colors duration-300",
      )}
    >
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 pointer-events-none"></div>

      {/* Premium Sidebar Component */}
      <React.Suspense fallback={<div className="w-64 h-screen bg-[#1e1e1e] shrink-0 border-r border-zinc-850" />}>
        <Sidebar user="Current User" />
      </React.Suspense>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header bar with dynamic breadcrumbs (padded on mobile due to absolute mobile header) */}
        <header className="h-16 border-b border-base-content/10 bg-base-200/50 backdrop-blur-md flex items-center justify-between px-6 z-20 shrink-0 mt-16 md:mt-0 transition-colors">
          {/* Breadcrumb Indicators */}
          <div className="flex items-center gap-2 text-xs font-semibold text-base-content/50 uppercase tracking-wider">
            <span>SyntaxNote Workspace</span>
            <span className="opacity-40 font-mono">/</span>
            <span className="text-primary font-bold">
              {getBreadcrumbName(pathname)}
            </span>
          </div>
        </header>

        {/* Dynamic Studio Workspace Scroll Port */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 py-6 md:py-8 relative z-10">
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>

      <Toaster />
    </div>
  );
}
