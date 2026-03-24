import React from "react";
import CHARTS_CONFIG from "../constants/chartsConfig";
import TimelineChart from "../charts/TimelineChart";

/*
  TimelineSection
  ----------------
  - history: array di 20 record dal backend [{ time, fullTime, temperature, humidity, ... }, ...]
  
  Nota:
  - L'utente osserva i grafici senza filtrare (visualizza tutti i 20 record).
  - CHARTS_CONFIG contiene la lista di grafici (key, color, unit, label).
  - Questo component non modifica i dati: li riceve già pronti da Dashboard/useSensorData.
*/


const TimelineSection = ({ history }) => (
  <div className="space-y-6">
    <div className="border-b border-[var(--hh-divider)] pb-2">
      <h3 className="text-sm font-bold text-[var(--hh-text)] uppercase tracking-widest">Real-time Timeline</h3>
    </div>

    {/* Charts Grid - Mappati da config per evitare ripetizione */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {CHARTS_CONFIG.map(({ key, color, unit, label }) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--hh-muted)] uppercase tracking-[0.22em] hh-chart-label">{label}</span>
            <span className="text-[10px] font-mono text-[var(--hh-muted-2)]">{unit}</span>
          </div>
          <TimelineChart data={history} dataKey={key} color={color} unit={unit} />
        </div>
      ))}
    </div>
  </div>
);

export default TimelineSection;
