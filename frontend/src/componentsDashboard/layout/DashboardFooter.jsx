import React from "react";

/*
  DashboardFooter
  - Footer semplice: mostra una riga di copyright in basso.
  - Non ha logica: è un componente “presentazionale” (solo UI).
*/
const DashboardFooter = () => (
  <footer
    /*
      className contiene più classi perché stai descrivendo più “regole” di stile diverse:

      1) Layout/spaziatura (dove sta e quanto spazio ha)
         - text-center: centra il testo
         - pt-8 pb-4: padding sopra e sotto

      2) Tipografia (come appare il testo)
         - text-[10px]: dimensione piccola “telemetria”
         - font-mono: font monospaziato, look tecnico

      3) Separatore (linea sopra)
         - border-t: bordo solo sopra
         - border-slate-900/30: colore bordo con trasparenza (più delicato)

      4) Colore testo che funziona su due temi
         - text-slate-700: leggibile su sfondo chiaro
         - dark:text-slate-300: quando il tema è dark (classe "dark" attiva), il testo diventa più chiaro
    */
    className="
      text-center text-[10px] font-mono pt-8 pb-4
      border-t border-slate-900/30
      text-slate-700 dark:text-slate-300
    "
  >
    © 2026 HomeHero. All rights reserved.
  </footer>
);

export default DashboardFooter;
