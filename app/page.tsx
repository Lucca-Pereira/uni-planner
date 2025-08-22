"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface GEvent {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  type?: string;
  subjectId?: number;
}

type Subject = { id: number; name: string; color: string };

export default function Home() {
  const [events, setEvents] = useState<GEvent[] | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ✅ Ref for form reset
  const formRef = useRef<HTMLFormElement>(null);

  // Load subjects
  useEffect(() => {
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch(() => setSubjects([]));
  }, []);

  async function loadEvents() {
    setErrorMsg(null);
    setSuccessMsg(null);
    const res = await fetch("/api/calendar/upcoming");
    const data = await res.json();
    setEvents(data.events || []);
  }

  async function addEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const form = new FormData(e.currentTarget);
    const title = form.get("title") as string;
    const start = form.get("start") as string;
    const end = form.get("end") as string;
    const duration = form.get("duration") as string;
    const type = form.get("type") as string;
    const subjectId = parseInt(form.get("subject") as string, 10);

    if (!title || !start || (!end && !duration)) {
      setErrorMsg("Please provide a title, start time, and either an end time or duration.");
      return;
    }
    if (!type) {
      setErrorMsg("Please select a type (Class / Exam / Study).");
      return;
    }
    if (!subjectId) {
      setErrorMsg("Please select a subject.");
      return;
    }

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
        body: JSON.stringify({ title, start: startISO, end: finalEndISO, type, subjectId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.details || data?.error || "Failed to add event");

      setSuccessMsg("Event added to Google Calendar ✅");

      // ✅ Safely reset form
      if (formRef.current) formRef.current.reset();

      loadEvents();
    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong while adding the event.");
    }
  }

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📅 Uni Planner</h1>

      {errorMsg && (
        <div className="mb-3 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-3 rounded-md border border-green-300 bg-green-50 text-green-700 px-3 py-2">
          {successMsg}
        </div>
      )}

      {/* Add Event Form */}
      <form
        ref={formRef}
        onSubmit={addEvent}
        className="flex flex-col gap-3 mb-8 bg-gray-100 p-4 rounded-xl shadow-sm"
      >
        <input name="title" placeholder="Event title" className="border p-2 rounded-md" />
        <input name="start" type="datetime-local" className="border p-2 rounded-md" />
        <input name="end" type="datetime-local" className="border p-2 rounded-md" />

        {/* Duration */}
        <select
          name="duration"
          className="w-full border rounded-md p-2 bg-white text-gray-800 shadow-sm 
                     hover:border-blue-400 focus:ring-2 focus:ring-blue-300 transition"
        >
          <option value="">-- Select duration (minutes) --</option>
          <option value="30">30 min</option>
          <option value="60">1 h</option>
          <option value="110">1 h 50 min</option>
          <option value="120">2 h</option>
        </select>

        {/* Type */}
        <select
          name="type"
          defaultValue=""
          className="w-full border rounded-md p-2 bg-white text-gray-800 shadow-sm 
                     hover:border-blue-400 focus:ring-2 focus:ring-blue-300 transition"
        >
          <option value="">-- Select type --</option>
          <option value="Class">Class</option>
          <option value="Exam">Exam</option>
          <option value="Study">Study</option>
        </select>

        {/* Subject */}
        <div className="flex gap-2 items-center">
          <select name="subject" className="border p-2 flex-1 rounded-md bg-white">
            <option value="">-- Select subject --</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <Link href="/subjects" className="text-blue-600 underline">
            Manage
          </Link>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md"
        >
          Add Event
        </button>
      </form>
    </main>
  );
}