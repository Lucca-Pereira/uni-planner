"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface GEvent {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  type?: string;
  subject?: string;
}

const SUBJECTS_KEY = "uniPlanner.subjects";

export default function Home() {
  const [events, setEvents] = useState<GEvent[] | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(SUBJECTS_KEY);
    setSubjects(saved ? JSON.parse(saved) : ["Math", "Physics", "Chemistry"]);
  }, []);

  async function loadEvents() {
    setErrorMsg(null); setSuccessMsg(null);
    const res = await fetch("/api/calendar/upcoming");
    const data = await res.json();
    setEvents(data.events || []);
  }

  async function addEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null); setSuccessMsg(null);

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const start = form.get("start") as string;
    const end = form.get("end") as string;
    const duration = form.get("duration") as string;
    const type = form.get("type") as string;
    const subject = form.get("subject") as string;

    if (!title || !start || (!end && !duration)) {
      setErrorMsg("Please provide a title, start time, and either an end time or duration.");
      return;
    }
    if (!type) { setErrorMsg("Please select a type (Class / Exam / Study)."); return; }
    if (!subject) { setErrorMsg("Please select a subject."); return; }

    const startISO = new Date(start).toISOString();
    let finalEndISO = end ? new Date(end).toISOString() : "";
    if (!end && duration) {
      const d = new Date(start);
      d.setMinutes(d.getMinutes() + parseInt(duration, 10));
      finalEndISO = d.toISOString();
    }
    if (finalEndISO && new Date(finalEndISO) <= new Date(startISO)) {
      setErrorMsg("End time must be after start time.");
      return;
    }

    try {
      const res = await fetch("/api/calendar/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, start: startISO, end: finalEndISO, type, subject }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.details || data?.error || "Failed to add event");
      setSuccessMsg("Event added to Google Calendar ✅");
      (e.currentTarget as HTMLFormElement).reset();
      loadEvents();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while adding the event.");
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">📅 Uni Planner</h1>

      {errorMsg && <div className="mb-3 rounded border border-red-300 bg-red-50 text-red-700 px-3 py-2">{errorMsg}</div>}
      {successMsg && <div className="mb-3 rounded border border-green-300 bg-green-50 text-green-700 px-3 py-2">{successMsg}</div>}

      <button onClick={loadEvents} className="px-4 py-2 bg-blue-600 text-white rounded mb-4">Load upcoming events</button>

      <form onSubmit={addEvent} className="flex flex-col gap-2 mb-6">
        <input name="title" placeholder="Event title" className="border p-2" />
        <input name="start" type="datetime-local" className="border p-2" />
        <input name="end" type="datetime-local" className="border p-2" />

        <select name="duration" className="border p-2">
          <option value="">-- Select duration (minutes) --</option>
          <option value="30">30 min</option>
          <option value="60">1 h</option>
          <option value="110">1 h 50 min</option>
          <option value="120">2 h</option>
        </select>

        {/* NEW: Type */}
        <select name="type" className="border p-2" defaultValue="">
          <option value="">-- Select type --</option>
          <option value="Class">Class</option>
          <option value="Exam">Exam</option>
          <option value="Study">Study</option>
        </select>

        {/* NEW: Subject + link to manage */}
        <div className="flex gap-2 items-center">
          <select name="subject" className="border p-2 flex-1" defaultValue="">
            <option value="">-- Select subject --</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <Link href="/subjects" className="text-blue-600 underline">Manage</Link>
        </div>

        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Add Event</button>
      </form>

      {/* Grouped events list; now can show type/subject if present */}
      {events && (
        <div className="mt-6 w-full">
          {Object.entries(
            events.reduce<Record<string, GEvent[]>>((groups, event) => {
              const dateKey = event.start?.dateTime?.split("T")[0] || event.start?.date || "Unknown date";
              if (!groups[dateKey]) groups[dateKey] = [];
              groups[dateKey].push(event);
              return groups;
            }, {})
          ).map(([date, dayEvents]) => (
            <div key={date} className="mb-6">
              <h2 className="font-bold text-lg mb-2">
                📅 {new Date(date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </h2>
              <ul className="ml-4 list-disc">
                {dayEvents.map((e) => {
                  const startTime = e.start?.dateTime ? new Date(e.start.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;
                  const endTime = e.end?.dateTime ? new Date(e.end.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : null;
                  return (
                    <li key={e.id}>
                      <strong>{e.summary || "(no title)"}</strong>
                      {startTime && endTime && ` (${startTime} – ${endTime})`}
                      {e.type && ` · ${e.type}`}
                      {e.subject && ` · ${e.subject}`}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
