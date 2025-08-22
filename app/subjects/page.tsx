// app/subjects/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "uniPlanner.subjects";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    setSubjects(saved ? JSON.parse(saved) : ["Math", "Physics", "Chemistry"]);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
  }, [subjects]);

  const addSubject = () => {
    const name = newSubject.trim();
    if (!name || subjects.includes(name)) return;
    setSubjects([...subjects, name]);
    setNewSubject("");
  };

  const startEdit = (i: number) => { setEditingIndex(i); setEditValue(subjects[i]); };
  const saveEdit = () => {
    if (editingIndex === null) return;
    const name = editValue.trim();
    if (!name) return;
    const next = [...subjects];
    next[editingIndex] = name;
    setSubjects(next);
    setEditingIndex(null);
    setEditValue("");
  };
  const removeSubject = (i: number) => setSubjects(subjects.filter((_, idx) => idx !== i));

  return (
    <main className="p-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">📚 Manage Subjects</h1>
        <Link className="text-blue-600 underline" href="/">← Back to Planner</Link>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="Add new subject"
          className="border p-2 flex-1 rounded"
        />
        <button onClick={addSubject} className="bg-blue-600 text-white px-3 py-2 rounded">
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {subjects.map((s, i) => (
          <li key={s + i} className="border rounded p-2 flex items-center justify-between">
            {editingIndex === i ? (
              <div className="flex gap-2 flex-1">
                <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="border p-2 flex-1 rounded" />
                <button onClick={saveEdit} className="bg-green-600 text-white px-3 py-2 rounded">Save</button>
                <button onClick={() => setEditingIndex(null)} className="px-3 py-2 rounded border">Cancel</button>
              </div>
            ) : (
              <>
                <span>{s}</span>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(i)} className="px-3 py-1 border rounded">Rename</button>
                  <button onClick={() => removeSubject(i)} className="px-3 py-1 border rounded">Delete</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
