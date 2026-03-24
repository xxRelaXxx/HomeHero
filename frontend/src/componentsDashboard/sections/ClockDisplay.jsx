import React from "react";
import { motion } from "framer-motion";
const MotionDiv = motion.div;

/*
  ClockDisplay
  ============
  Mostra l’orario grande al centro della dashboard.

  Props (proprietà):
  - clockTime: stringa dell’orario già formattata dal componente padre (es. "12:34:56")
*/

const ClockDisplay = ({ clockTime }) => {
  // Fallback: se clockTime è vuoto/undefined, mostriamo un placeholder
  const displayTime = clockTime || "--:--:--";

  /*
    motion.div (Framer Motion)
    - è un normale <div> ma con animazioni integrate.
    - initial: stato di partenza (prima che compaia)
    - animate: stato finale (dopo l’entrata)
    - transition: come avviene il passaggio (durata, tipo di curva)
  */
  return (
    <MotionDiv
      className="text-center mb-12"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: "linear" }}
    >
      {/* Orario principale: grande, monospace, allineato bene grazie a tabular-nums */}
      <h2 className="text-6xl md:text-8xl font-mono font-light text-[var(--hh-text)] glow-text-blue tracking-wider tabular-nums">
        {displayTime}
      </h2>

      {/* Etichetta sotto: testo piccolo, spaziato e “tecnico” */}
    </MotionDiv>
  );
};

export default ClockDisplay;
