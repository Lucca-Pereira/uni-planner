"use client";

import { useEffect, useState } from "react";

interface GEvent {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  type?: string;
  subject?: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<GEvent[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/calendar/upcoming")
      .then((res) => res.json())
      .then((data) => setEvents(data.events || []));
  }, []);

  const today = new Date().toDateString();

  function filterEvents(evts: GEvent[]) {
    if (filter === "Class") {
  return evts.filter((e) => {
    if (e.type !== "Class") return false;
    const date = e.start?.dateTime
      ? new Date(e.start.dateTime).toDateString()
      : e.start?.date
      ? new Date(e.start.date).toDateString()
      : "";
    return date === today;
  });
}
    if (filter === "Exam") return evts.filter((e) => e.type === "Exam");
    if (filter === "Project") return evts.filter((e) => e.type === "Project");
    return evts;
  }

  const filtered = filterEvents(events);

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📅 Events</h1>

      {/* Filter dropdown */}
      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded-md bg-white text-gray-800"
        >
          <option value="All">All</option>
          <option value="Class">Classes (Today)</option>
          <option value="Exam">Exams</option>
          <option value="Project">Projects</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-600">No events found.</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((e) => {
            const startTime = e.start?.dateTime
              ? new Date(e.start.dateTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;
            const endTime = e.end?.dateTime
              ? new Date(e.end.dateTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : null;

            return (
              <li
                key={e.id}
                className="bg-gray-100 rounded-lg p-4 shadow-sm text-gray-900"
              >
                <strong>{e.summary || "(no title)"}</strong>
                {startTime && endTime && (
                  <span className="ml-2 text-sm text-gray-600">
                    ({startTime} – {endTime})
                  </span>
                )}
                {e.type && (
                  <span className="ml-2 text-sm font-semibold">{e.type}</span>
                )}
                {e.subject && (
                  <span className="ml-2 text-sm text-blue-600">{e.subject}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}