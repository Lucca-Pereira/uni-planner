"use client";

import { signIn, signOut, useSession } from "next-auth/react";

export default function AuthButtons() {
  const { data: session, status } = useSession();

  if (status === "loading") return <button disabled>Loading…</button>;

  if (!session) {
    return <button onClick={() => signIn("google")}>Sign in with Google</button>;
  }

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <span>Signed in as {session.user?.email}</span>
      <button onClick={() => signOut()}>Sign out</button>
    </div>
  );
}