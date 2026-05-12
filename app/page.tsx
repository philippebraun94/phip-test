"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; 

interface TimeEntry {
  id?: number;
  project: string;
  duration: number; // Wir speichern hier jetzt Sekunden
  created_at?: string;
}

export default function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [project, setProject] = useState('Projekt A');
  const [history, setHistory] = useState<TimeEntry[]>([]);

  // 1. Daten beim Start aus Supabase laden
  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setHistory(data);
    if (error) console.error('Fehler beim Laden:', error);
  }

  // Timer-Logik (läuft in Millisekunden für die flüssige Anzeige)
  useEffect(() => {
    let interval: any;
    if (isRunning && startTime !== null) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  // 2. Speichern in Supabase beim Stoppen
  const handleStartStop = async () => {
    if (isRunning) {
      // FIX: Umrechnung von Millisekunden in ganze Sekunden für die Datenbank
      const durationInSeconds = Math.floor(elapsedTime / 1000);
      
      const { error } = await supabase
        .from('time_entries')
        .insert([{ 
          project: project, 
          duration: durationInSeconds // Wir senden Sekunden
        }]);

      if (error) {
        alert('Fehler beim Speichern: ' + error.message);
        console.error(error);
      } else {
        fetchEntries(); 
      }

      setIsRunning(false);
      setElapsedTime(0);
      setStartTime(null);
    } else {
      setStartTime(Date.now());
      setIsRunning(true);
    }
  };

  // Hilfsfunktion zur Formatierung
  const formatTime = (input: number, isMs: boolean = true) => {
    // Wenn es keine Millisekunden sind (aus der DB), wandeln wir es für die Logik kurz um
    const ms = isMs ? input : input * 1000;
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <main className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Team Zeiterfassung</h1>
        
        {/* Anzeige nutzt Millisekunden (elapsedTime) */}
        <div className="text-5xl font-mono text-center mb-8 text-blue-600 bg-blue-50 py-4 rounded-lg">
          {formatTime(elapsedTime, true)}
        </div>

        <select 
          className="w-full p-3 mb-4 border rounded-lg bg-white"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          disabled={isRunning}
        >
          <option value="Projekt A">Projekt A</option>
          <option value="Projekt B">Projekt B</option>
          <option value="Meeting">Meeting</option>
        </select>

        <button
          onClick={handleStartStop}
          className={`w-full py-4 rounded-xl font-bold text-white transition ${
            isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isRunning ? 'Stoppen & Speichern' : 'Arbeit starten'}
        </button>

        <div className="mt-10">
          <h2 className="font-bold text-gray-700 mb-4 border-b pb-2">Letzte Einträge (Cloud)</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((entry, index) => (
              <div key={entry.id || index} className="flex justify-between p-3 bg-gray-50 rounded border border-gray-100">
                <span className="font-medium text-gray-600">{entry.project}</span>
                {/* FIX: Da entry.duration aus der DB Sekunden sind, isMs = false */}
                <span className="font-mono text-blue-500">{formatTime(entry.duration, false)}</span>
              </div>
            ))}
            {history.length === 0 && <p className="text-gray-400 text-sm text-center">Noch keine Einträge vorhanden.</p>}
          </div>
        </div>
      </div>
    </main>
  );
}