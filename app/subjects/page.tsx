"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Subject = {
  id: number;
  name: string;
  color?: string;
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // Load subjects from DB
  useEffect(() => {
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => setSubjects(data));
  }, []);

  // Add subject to DB
  async function addSubject() {
    const name = newSubject.trim();
    if (!name || subjects.some((s) => s.name === name)) return;

    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color: "blue" }), // default color for now
    });

    const newEntry = await res.json();
    setSubjects([...subjects, newEntry]);
    setNewSubject("");
  }

  // Start editing
  const startEdit = (id: number, currentName: string) => {
    setEditingId(id);
    setEditValue(currentName);
  };

  // Save rename (update in DB)
  async function saveEdit() {
    if (!editingId || !editValue.trim()) return;

    const res = await fetch(`/api/subjects/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue }),
    });

    const updated = await res.json();
    setSubjects((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );

    setEditingId(null);
    setEditValue("");
  }

  // Delete subject
  async function removeSubject(id: number) {
    await fetch(`/api/subjects/${id}`, { method: "DELETE" });
    setSubjects(subjects.filter((s) => s.id !== id));
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📚 Manage Subjects</h1>
        <Link className="text-blue-600 underline" href="/">
          ← Back to Planner
        </Link>
      </div>

      {/* Add subject */}
      <div className="flex gap-2 mb-4">
        <input
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Add new subject"
          className="border p-2 flex-1 rounded"
        />
        <button
          onClick={addSubject}
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          Add
        </button>
      </div>

      {/* Subject list */}
      <ul className="space-y-2">
        {subjects.map((s) => (
          <li
            key={s.id}
            className="border rounded p-2 flex items-center justify-between"
          >
            {editingId === s.id ? (
              <div className="flex gap-2 flex-1">
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="border p-2 flex-1 rounded"
                />
                <button
                  onClick={saveEdit}
                  className="bg-green-600 text-white px-3 py-2 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-2 rounded border"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <span style={{ color: s.color || "inherit" }}>{s.name}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(s.id, s.name)}
                    className="px-3 py-1 border rounded"
                  >
                    Rename
                  </button>
                  <button
                    onClick={() => removeSubject(s.id)}
                    className="px-3 py-1 border rounded"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}