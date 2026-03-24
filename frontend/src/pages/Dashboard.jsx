import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import "./Dashboard.css";

//  Hook dati sensori (simulati o reali): stato attuale, storico, online/offline, export CSV
import useSensorData from "../componentsDashboard/hooks/useSensorData";



//  Pezzi UI già scomposti
import DashboardHeader from "../componentsDashboard/layout/DashboardHeader";
import DashboardFooter from "../componentsDashboard/layout/DashboardFooter";

import ClockDisplay from "../componentsDashboard/sections/ClockDisplay";
import SensorCardsSection from "../componentsDashboard/sections/SensorCardsSection";
import TimelineSection from "../componentsDashboard/sections/TimelineSection";
import FanControl from "../componentsDashboard/sections/FanControl";
//import Sidebar from "../componentsDashboard/sections/Sidebar";

const THEME_KEYS = ["hh_dashboard_theme", "hh-theme", "theme"]; // support legacy + unified theme keys
const MotionDiv = motion.div;

function readStoredTheme() {
  if (typeof window === "undefined") return "dark";
  try {
    for (const k of THEME_KEYS) {
      const v = window.localStorage.getItem(k);
      if (v === "dark" || v === "light") return v;
    }
  } catch {
    // ignore
  }
  return "dark";
}

function writeStoredTheme(theme) {
  if (typeof window === "undefined") return;
  try {
    for (const k of THEME_KEYS) {
      window.localStorage.setItem(k, theme);
    }
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    }
  } catch {
    // ignore
  }
}

const Dashboard = () => {
  const formatClock = () =>
    new Date().toLocaleTimeString("it-IT", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  // -----------------------------
  // 1) DATI PRINCIPALI (sensori)
  // -----------------------------
  const { currentData, history, exportCSV } = useSensorData();

  // -----------------------------
  // 2) UI STATE (orologio)
  // -----------------------------
  const [clockTime, setClockTime] = useState(() => formatClock());

  // -----------------------------
  // 3) THEME STATE (dark di default, light quando l’utente lo sceglie)
  //    Lettura/scrittura condivisa con AuthFrame (stessa chiave logica)
  // -----------------------------
  const [theme, setTheme] = useState(() => readStoredTheme());

  // Salviamo il tema scelto (persistenza condivisa)
  useEffect(() => {
    writeStoredTheme(theme);
  }, [theme]);

  // Funzione passata all’header: cambia tema senza toccare la UI del resto
  const onToggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };
  // -----------------------------
  // 3) EFFECT: aggiorna l’orologio ogni 1 secondo
  // -----------------------------
  useEffect(() => {
    const timer = setInterval(() => setClockTime(formatClock()), 1000);
    return () => clearInterval(timer);
  }, []);


  // -----------------------------
  // 5) ANIMAZIONI: varianti (stagger cards)
  // -----------------------------
  const containerVariants = useMemo(
    () => ({ visible: { transition: { staggerChildren: 0.1 } } }),
    []
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    }),
    []
  );

  // -----------------------------
  // 6) RENDER
  // -----------------------------
  return (
    <div
      className={`relative min-h-screen font-sans selection:bg-cyan-500 selection:text-black overflow-hidden hh-theme-${theme}`}
    >
      {/* LAYER 10: Contenuto applicazione */}
      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        {/* HEADER: titolo, export csv, user icon */}
        <DashboardHeader
          onExportCSV={exportCSV}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

        {/* OROLOGIO: grande e centrale */}
        <ClockDisplay clockTime={clockTime} />

        {/* CARD VALORI: i 4 sensori principali */}
        <SensorCardsSection
          currentData={currentData}
          containerVariants={containerVariants}
          itemVariants={itemVariants}
        />

        {/* AREA PRINCIPALE: grafici + sidebar */}
        <MotionDiv
          className="mb-12"
          // animazione semplice di entrata (fade)
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85, duration: 0.95, ease: "linear" }}
        >
          {/* GRAFICI: range selezionabile + storico filtrato */}
          <TimelineSection
            history={history}
          />
        </MotionDiv>

        {/* FAN CONTROL */}
        <MotionDiv
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.95, ease: "linear" }}
        >
          <FanControl />
        </MotionDiv>

        {/* FOOTER: info tecniche / status string */}
        <DashboardFooter />
      </div>
    </div>
  );
};

export default Dashboard;
