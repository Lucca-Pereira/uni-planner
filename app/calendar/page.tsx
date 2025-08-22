"use client";

import { useEffect, useState } from "react";

type Subject = { id: number; name: string; color: string };
type Event = { id: number; title: string; date: string; subject: Subject };

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editSubjectId, setEditSubjectId] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Load events
  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, []);

  // Load subjects for dropdown (needed for editing)
  useEffect(() => {
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => setSubjects(data));
  }, []);

  // Delete event
  async function deleteEvent(id: number) {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    setEvents(events.filter((ev) => ev.id !== id));
  }

  // Start editing
  function startEdit(ev: Event) {
    setEditingId(ev.id);
    setEditTitle(ev.title);
    setEditDate(ev.date.split("T")[0]); // yyyy-mm-dd
    setEditSubjectId(ev.subject.id);
  }

  // Save edit
  async function saveEdit() {
    if (!editingId || !editTitle.trim() || !editDate || !editSubjectId) return;

    const res = await fetch(`/api/events/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        date: editDate,
        subjectId: editSubjectId,
      }),
    });

    const updated = await res.json();
    setEvents((prev) =>
      prev.map((ev) => (ev.id === updated.id ? updated : ev))
    );

    setEditingId(null);
    setEditTitle("");
    setEditDate("");
    setEditSubjectId(null);
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📅 Calendar</h1>

      {events.length === 0 ? (
        <p>No events yet. Add one from the event form.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="border rounded p-3 flex justify-between items-center"
            >
              {editingId === ev.id ? (
                <div className="flex flex-col gap-2 flex-1">
                  <input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Event title"
                    className="border p-2 rounded"
                  />
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="border p-2 rounded"
                  />
                  <select
                    value={editSubjectId ?? ""}
                    onChange={(e) =>
                      setEditSubjectId(parseInt(e.target.value, 10))
                    }
                    className="border p-2 rounded"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="bg-green-600 text-white px-3 py-1 rounded"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 border rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="font-semibold">{ev.title}</h2>
                    <p className="text-sm text-gray-600">
                      {new Date(ev.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span
                      className="px-3 py-1 rounded text-white"
                      style={{ backgroundColor: ev.subject?.color || "gray" }}
                    >
                      {ev.subject?.name || "No subject"}
                    </span>
                    <button
                      onClick={() => startEdit(ev)}
                      className="px-3 py-1 border rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteEvent(ev.id)}
                      className="px-3 py-1 border rounded text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
