import React, { memo } from "react";
import { motion } from "framer-motion";
const MotionDiv = motion.div;

/*
  SENSOR CARD (componente “riutilizzabile”)

  ⚠️ NOTA CONCETTUALE IMPORTANTE
  Questo componente NON acquisisce dati.
  Mostra solo dati già acquisiti dal componente padre.

  Lo stato "ACQUIRING" è una rappresentazione visiva.
*/

const SensorCard = memo(function SensorCard({
  label,
  value,
  unit,
  icon: Icon,
  color
}) {


  return (
    <MotionDiv
      className="sensor-card p-5 rounded-lg relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.18, ease: "linear" }}
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-500 to-transparent opacity-20" />

      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest font-bold flex items-center gap-2" style={{ color: color }}>
          {Icon && <Icon size={14} aria-hidden="true" style={{ color: color }} />}
          {label}
        </span>


      </div>

      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-mono font-light glow-text-blue tabular-nums" style={{ color: color }}>
          {value ?? "--"}
        </span>
        <span className="text-sm font-mono" style={{ color: color }}>{unit}</span>
      </div>
      <div className="h-2px w-10px" style={{ backgroundColor: color }}/>
    </MotionDiv>
  );
});

export default SensorCard;
