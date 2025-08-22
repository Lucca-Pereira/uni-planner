"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [primaryColor, setPrimaryColor] = useState("#2563eb"); // default blue
  const [darkMode, setDarkMode] = useState(false);

  // Load saved settings from localStorage
  useEffect(() => {
    const savedColor = localStorage.getItem("uniPlanner.primaryColor");
    const savedDark = localStorage.getItem("uniPlanner.darkMode");

    if (savedColor) setPrimaryColor(savedColor);
    if (savedDark) setDarkMode(savedDark === "true");
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("uniPlanner.primaryColor", primaryColor);
    localStorage.setItem("uniPlanner.darkMode", String(darkMode));
  }, [primaryColor, darkMode]);

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">⚙️ Settings</h1>

      <div className="space-y-6 bg-gray-100 rounded-xl p-6 shadow-sm">
        {/* Color Picker */}
        <div>
          <label className="block mb-2 font-semibold">Primary Color</label>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="w-16 h-10 border rounded cursor-pointer"
          />
          <p className="mt-2 text-sm text-gray-600">
            Current: <span style={{ color: primaryColor }}>{primaryColor}</span>
          </p>
        </div>

        {/* Dark Mode Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
            className="w-5 h-5"
          />
          <label className="font-semibold">Enable Dark Mode</label>
        </div>
      </div>
    </main>
  );
}
