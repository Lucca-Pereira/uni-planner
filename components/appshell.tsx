"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-screen">
      {/* Floating toggle button */}
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="fixed top-4 left-4 z-50 rounded-full px-3 py-2 text-sm font-medium
                   bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700"
      >
        {open ? "✕" : "☰"}
      </button>

      {/* Slide-in sidebar */}
      <div
        className={`fixed top-0 left-0 z-40 h-full w-64 transform transition-transform duration-200
                    bg-gray-900 border-r border-gray-800
                    ${open ? "translate-x-0" : "-translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <Sidebar />
      </div>

      {/* Backdrop (click to close) */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Page content */}
      <div className="relative z-10 p-4">{children}</div>
    </div>
  );
}
