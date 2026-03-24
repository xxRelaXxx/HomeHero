import React from "react";
import { motion } from "framer-motion";
import { Thermometer, Droplets, Gauge, Volume2, Cloud, Sun } from "lucide-react";
import SensorCard from "../cards/SensorCard";
import SENSORS_CONFIG from "../constants/sensorsConfig";
const MotionDiv = motion.div;

/*
  SensorCardsSection
  ==================
  Mostra le 6 card principali dei sensori in una griglia.

  Props:
  - currentData: oggetto con i valori dei sensori (temperature, humidity, pressure, noise, illumination, gas)
  - containerVariants / itemVariants: animazioni (entrata “a cascata” delle card)
*/

const SensorCardsSection = ({
  currentData,
  containerVariants,
  itemVariants,
}) => {
  /*
    Mappa dei nomi delle icone (stringhe) alle icone vere da lucide-react.
    Questo ci permette di elencare le icone nella config come stringhe,
    mantenendo la config semplice e leggibile.
  */
  const iconMap = {
    Thermometer,
    Droplets,
    Gauge,
    Volume2,
    Cloud,
    Sun
  };

  /*
    Trasformiamo SENSORS_CONFIG in un array di card pronti per il rendering.
    Per ogni configurazione, estraiamo il valore dal currentData,
    lo formatiamo con i decimali corretti, e risaliamo all'icona vera.
  */
  const cards = SENSORS_CONFIG.map((config) => ({
    label: config.label,
    value: currentData[config.key].toFixed(config.decimals),
    unit: config.unit,
    icon: iconMap[config.icon],
    color: config.color
  }));

  return (
    /*
      motion.div = come un div normale, ma può animarsi.
      variants/initial/animate:
      - containerVariants fa partire l’effetto “stagger” (una card dopo l’altra)
      - itemVariants è l’animazione di ogni singola card
    */
    <MotionDiv
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/*
        Creiamo 6 card con map.
        key: serve a React per riconoscere ogni elemento della lista.
      */}
      {cards.map((card) => (
        <MotionDiv key={card.label} variants={itemVariants}>
          <SensorCard
            label={card.label}
            value={card.value}
            unit={card.unit}
            icon={card.icon}
            color={card.color}
          />
        </MotionDiv>
      ))}
    </MotionDiv>
  );
};

export default SensorCardsSection;
