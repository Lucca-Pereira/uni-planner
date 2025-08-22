"use client";

import { useEffect, useState } from "react";

type Subject = { id: number; name: string; color: string };
type Event = {
  id: number;
  title: string;
  start: string;
  end: string;
  type: string;
  subject: Subject;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editType, setEditType] = useState("");
  const [editSubjectId, setEditSubjectId] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Load events
  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, []);

  // Load subjects for dropdown
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
    setEditStart(ev.start.slice(0, 16)); // yyyy-MM-ddTHH:mm
    setEditEnd(ev.end.slice(0, 16));
    setEditType(ev.type);
    setEditSubjectId(ev.subject.id);
  }

  // Save edit
  async function saveEdit() {
    if (!editingId || !editTitle.trim() || !editStart || !editEnd || !editSubjectId || !editType) return;

    const res = await fetch(`/api/events/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle,
        start: editStart,
        end: editEnd,
        type: editType,
        subjectId: editSubjectId,
      }),
    });

    const updated = await res.json();
    setEvents((prev) =>
      prev.map((ev) => (ev.id === updated.id ? updated : ev))
    );

    setEditingId(null);
    setEditTitle("");
    setEditStart("");
    setEditEnd("");
    setEditType("");
    setEditSubjectId(null);
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📅 Calendar</h1>

      {events.length === 0 ? (
        <p className="text-gray-600 text-center">No events yet. Add one from the planner.</p>
      ) : (
        <ul className="space-y-4">
          {events.map((ev) => (
            <li
              key={ev.id}
              className="bg-gray-100 rounded-xl p-4 shadow-sm flex justify-between items-center"
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
                    type="datetime-local"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="border p-2 rounded"
                  />
                  <input
                    type="datetime-local"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    className="border p-2 rounded"
                  />
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="border p-2 rounded"
                  >
                    <option value="">Select type</option>
                    <option value="Class">Class</option>
                    <option value="Exam">Exam</option>
                    <option value="Study">Study</option>
                  </select>
                  <select
                    value={editSubjectId ?? ""}
                    onChange={(e) => setEditSubjectId(parseInt(e.target.value, 10))}
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
                    <h2 className="font-semibold text-gray-900">{ev.title}</h2>
                    <p className="text-sm text-gray-600">
                      {new Date(ev.start).toLocaleDateString()} ({new Date(ev.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – {new Date(ev.end).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                    </p>
                    <p className="text-sm text-gray-600">Type: {ev.type}</p>
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
