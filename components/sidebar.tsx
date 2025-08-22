"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const NavItem = ({ href, label }: { href: string; label: string }) => (
    <Link
      href={href}
      className={`block px-3 py-2 rounded hover:bg-gray-800 ${
        pathname === href ? "font-semibold bg-gray-800" : ""
      }`}
    >
      {label}
    </Link>
  );

  return (
    <aside className="p-4 border-r border-gray-800 min-h-screen w-56 flex flex-col">
      <div className="text-xl font-bold mb-4">Uni Planner</div>

      {/* Nav */}
      <nav className="space-y-1">
        <NavItem href="/" label="Planner" />
        <NavItem href="/subjects" label="Subjects" />
      </nav>

      {/* Spacer pushes auth block to bottom */}
      <div className="flex-1" />

      {/* Auth block */}
      <div className="mt-4 border-t border-gray-800 pt-4">
        {status === "loading" ? (
          <div className="text-sm opacity-70">Checking session…</div>
        ) : session?.user ? (
          <div className="flex items-center gap-2 mb-3">
            {session.user.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name ?? "User"}
                width={28}
                height={28}
                className="rounded-full"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-700" />
            )}
            <div className="leading-tight">
              <div className="text-sm font-medium truncate max-w-[9rem]">
                {session.user.name ?? session.user.email}
              </div>
              <div className="text-xs opacity-70 truncate max-w-[9rem]">
                {session.user.email}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm opacity-80 mb-3">Not signed in</div>
        )}

        {/* One toggle button */}
        {session?.user ? (
          <button
            onClick={() => signOut()}
            className="w-full px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-gray-100 text-sm"
          >
            Log out
          </button>
        ) : (
          <button
            onClick={() => signIn("google")}
            className="w-full px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </aside>
  );
}
