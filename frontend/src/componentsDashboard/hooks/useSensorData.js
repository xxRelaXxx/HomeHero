import { useEffect, useRef, useState } from "react";
import { telemetryAPI } from "../../api/api";
/*
  useSensorData è un CUSTOM HOOK (custom = fatto da te, hook = funzione React che usa useState/useEffect).
  - Non renderizza nulla: restituisce solo dati e funzioni.
  - Gestisce stato, tempo, simulazione dati e side-effects (side-effect = azione esterna, es. setInterval o download file).
  - Espone un'API pulita alla UI.

  Ritorna:
  - currentData → ultimo valore disponibile (per cards)
  - history → storico limitato (per grafici)
  - isOnline → stato dispositivo
  - exportCSV → azione (side-effect controllato)
*/

const POINTS = 20;        // numero massimo di punti nello storico
const INTERVAL_MS = 10000; // frequenza aggiornamento dati (10s)
const MINUTE_MS = 60000;  // millisecondi in 1 minuto (utility per calcoli tempo)
const DEVICE_ID = "ESP32_01";
const COORDS = { lat: 45.4642, lon: 9.19 };
const INITIAL_CURRENT_DATA = {
  temperature: 23.5,
  humidity: 48,
  pressure: 1012,
  noise: 35,
  gas_kohm: 120,
  light_lux: 400,
  timestamp: "",
};
const SEED_STEP_MINUTES = 3; // ogni quanto “spaziamo” i punti iniziali (solo per riempire i grafici)

/*
  CSV per Excel
  - sep=; forza Excel a usare ; come separatore (fix principale del tuo problema)
  - BOM aiuta con UTF-8
*/
const CSV_DELIMITER = ";";
const CSV_BOM = "\ufeff";

// Colonne più leggibili: Data e Ora separate
const CSV_HEADERS = [
  "date",
  "time",
  "device_id",
  "temperature_C",
  "humidity_pct",
  "pressure_hPa",
  "noise_dB",
  "gas_kohm",
  "light_lux",
  "lat",
  "lon",
];

// Escape CSV: mette tra virgolette i campi che contengono separatore, " o a capo
const csvCell = (value) => {
  const s = String(value ?? "");
  const needsQuotes =
    s.includes(CSV_DELIMITER) || s.includes('"') || s.includes("\n") || s.includes("\r");
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
};

// Numeri “Excel-friendly” in Italia: virgola decimale (23,4 invece di 23.4)
const toItNumber = (n, digits) => Number(n).toFixed(digits).replace(".", ",");

// Helper puro: formatta l’orario per l’asse X (UI-friendly)
const formatTimeHHMM = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// Costruisce uno storico iniziale
// Serve per evitare grafici “vuoti” al primo render
const buildInitialHistory = () => {
  const now = new Date();
  const initial = [];

  for (let i = POINTS; i > 0; i--) {
    const d = new Date(now.getTime() - i * SEED_STEP_MINUTES * MINUTE_MS);
    initial.push({
      time: formatTimeHHMM(d),
      fullTime: d.toISOString(),
      temperature: 23 + Math.random() * 2,
      humidity: 45 + Math.random() * 5,
      pressure: 1012 + Math.random() * 3,
      noise: 30 + Math.random() * 20,      gas_kohm: 100 + Math.random() * 50,
      light_lux: 300 + Math.random() * 300,    });
  }

  return initial;
};

const useSensorData = () => {
  const [currentData, setCurrentData] = useState(INITIAL_CURRENT_DATA);

  const [history, setHistory] = useState(buildInitialHistory);

  // useRef = memoria mutabile che NON causa re-render (evita stale closure nel setInterval)
  const dataRef = useRef(currentData);

  useEffect(() => {
    dataRef.current = currentData;
  }, [currentData]);

  /**
   * fetchTelemetry - Carica i dati storici dal backend Laravel
   * Trasforma la risposta in formato compatibile con i grafici
   * È definita qui (NON dentro useEffect) per essere riusata sia al mount che in setInterval
   */
  const fetchTelemetry = async () => {
    try {
      const response = await telemetryAPI.getReadings();
      
      if (response.data && Array.isArray(response.data)) {
        // Trasforma dati Laravel in formato grafico
        const transformedData = response.data.map((reading) => {
          const date = new Date(reading.created_at);
          return {
            time: formatTimeHHMM(date),
            fullTime: date.toISOString(),
            temperature: parseFloat(reading.temperature) || 0,
            humidity: parseFloat(reading.humidity) || 0,
            pressure: parseFloat(reading.air_pressure) || 0,
            noise: parseFloat(reading.noise_db) || 0,
            gas_kohm: parseFloat(reading.gas_kohm) || 0,
            light_lux: parseFloat(reading.light_lux) || 0,
          };
        });
        
        // Mostra solo gli ultimi POINTS dati
        setHistory(transformedData.slice(-POINTS));
        
        // Aggiorna il dato corrente con l'ultimo disponibile
        if (transformedData.length > 0) {
          const latest = transformedData[transformedData.length - 1];
          setCurrentData((prev) => ({
            ...prev,
            temperature: latest.temperature,
            humidity: latest.humidity,
            pressure: latest.pressure,
            noise: latest.noise,
            gas_kohm: latest.gas_kohm,
            light_lux: latest.light_lux,
            timestamp: latest.fullTime,
          }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch telemetry:", error);
      // Fallback: continua con dati simulati
    }
  };

  // EFFETTO 1: Carica i dati al mount (una sola volta)
  useEffect(() => {
    queueMicrotask(fetchTelemetry);
  }, []);

  // EFFETTO 2: Auto-refresh ogni INTERVAL_MS (10 secondi)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchTelemetry();
    }, INTERVAL_MS);

    // Cleanup: pulisci l'intervallo quando il componente unmount
    return () => clearInterval(intervalId);
  }, []);

  const exportCSV = () => {
    /*
      Export CSV “bello” per Excel:
      - forza separatore con "sep=;"
      - colonne leggibili (data e ora separate)
      - numeri con virgola decimale
      - righe ordinate dal più vecchio al più nuovo
      - nome file: HomeHeroDATA_YYYY-MM-DD.csv

      Nota: un CSV non può impostare la larghezza colonne (quello è possibile solo con XLSX).
    */

    const current = dataRef.current;

    // Ordiniamo lo storico per data (vecchio -> nuovo)
    const sortedHistory = [...history].sort(
      (a, b) => new Date(a.fullTime).getTime() - new Date(b.fullTime).getTime()
    );

    const getDate = (iso) =>
      new Date(iso).toLocaleDateString("it-IT", { year: "numeric", month: "2-digit", day: "2-digit" });

    const getTime = (iso) =>
      new Date(iso).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

    // Righe dallo storico
    const rows = sortedHistory.map((h) => [
      getDate(h.fullTime),
      getTime(h.fullTime),
      DEVICE_ID,
      toItNumber(h.temperature, 1),
      toItNumber(h.humidity, 1),
      toItNumber(h.pressure, 1),
      toItNumber(h.noise, 1),
      toItNumber(h.gas_kohm, 1),
      toItNumber(h.light_lux, 1),
      toItNumber(current.lat ?? COORDS.lat, 4),
      toItNumber(current.lon ?? COORDS.lon, 4),
    ]);

    // Aggiungiamo anche l’ultimo dato corrente (se non è duplicato)
    if (current?.timestamp) {
      const lastIso = sortedHistory.at(-1)?.fullTime;
      if (current.timestamp !== lastIso) {
        rows.push([
          getDate(current.timestamp),
          getTime(current.timestamp),
          DEVICE_ID,
          toItNumber(current.temperature, 1),
          toItNumber(current.humidity, 1),
          toItNumber(current.pressure, 1),
          toItNumber(current.noise, 1),          toItNumber(current.gas_kohm, 1),
          toItNumber(current.light_lux, 1),          toItNumber(current.lat ?? COORDS.lat, 4),
          toItNumber(current.lon ?? COORDS.lon, 4),
        ]);
      }
    }

    // RIGA MAGICA PER EXCEL: forza separatore
    const sepLine = `sep=${CSV_DELIMITER}`;

    // Header + body
    const headerLine = CSV_HEADERS.map(csvCell).join(CSV_DELIMITER);
    const bodyLines = rows
      .map((r) => r.map(csvCell).join(CSV_DELIMITER))
      .join("\n");

    const csv = `${CSV_BOM}${sepLine}\n${headerLine}\n${bodyLines}\n`;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    // Nome file richiesto
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const fileName = `HomeHeroDATA_${today}.csv`;

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return { currentData, history, exportCSV };
};

export default useSensorData;
