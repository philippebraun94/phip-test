'use client';

import React, { useState, useEffect } from 'react';

// Typ-Definition für einen Zeiteintrag
interface TimeEntry {
  id: number;
  project: string;
  duration: number;
  date: string;
}

export default function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [project, setProject] = useState('Projekt A');
  const [history, setHistory] = useState<TimeEntry[]>([]);

  // Der Timer-Effekt
  useEffect(() => {
    let interval: any;
    if (isRunning && startTime !== null) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const handleStartStop = () => {
    if (isRunning) {
      const newEntry: TimeEntry = {
        id: Date.now(),
        project: project,
        duration: elapsedTime,
        date: new Date().toLocaleDateString(),
      };
      setHistory([newEntry, ...history]);
      setIsRunning(false);
      setElapsedTime(0);
      setStartTime(null);
    } else {
      setStartTime(Date.now());
      setIsRunning(true);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 md:p-24 flex flex-col items-center">
      <div className="z-10 max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center tracking-tight">
          Zeiterfassung
        </h1>

        {/* Große Timer Anzeige */}
        <div className="text-6xl font-mono text-center mb-10 text-blue-600 bg-blue-50 py-6 rounded-xl border border-blue-100">
          {formatTime(elapsedTime)}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Projekt wählen
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              disabled={isRunning}
            >
              <option>Projekt A</option>
              <option>Projekt B</option>
              <option>Meeting</option>
              <option>Design</option>
            </select>
          </div>

          <button
            onClick={handleStartStop}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg transition-all active:scale-95 ${
              isRunning
                ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                : 'bg-green-500 hover:bg-green-600 shadow-green-200'
            }`}
          >
            {isRunning ? 'Stoppen' : 'Arbeit starten'}
          </button>
        </div>

        {/* Historie */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex justify-between items-center">
            <span>Verlauf</span>
            <span className="text-xs font-normal text-gray-500">
              {history.length} Einträge
            </span>
          </h2>
          <div className="max-h-60 overflow-y-auto pr-2 space-y-3">
            {history.length === 0 && (
              <p className="text-center text-gray-400 py-4 italic">
                Noch keine Einträge vorhanden.
              </p>
            )}
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition"
              >
                <div>
                  <span className="font-bold text-gray-700 block">
                    {entry.project}
                  </span>
                  <span className="text-xs text-gray-500">{entry.date}</span>
                </div>
                <span className="font-mono font-semibold text-blue-600">
                  {formatTime(entry.duration)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-sm">
        Web-App Prototyp &bull; {new Date().getFullYear()}
      </p>
    </main>
  );
}
