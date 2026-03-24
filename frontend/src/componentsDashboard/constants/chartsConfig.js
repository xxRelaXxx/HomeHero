// CHARTS_CONFIG = "ricetta" dei grafici (approccio DRY: Don't Repeat Yourself)
// Invece di ripetere 4 volte lo stesso codice per i chart,
// descriviamo i chart in un array e poi li generiamo con .map().

const CHARTS_CONFIG = [
  {
    key: "temperature",  // nome del campo nei dati (es: dataPoint.temperature)
    color: "#d41548",    // colore della linea/area del grafico
    unit: "°C",          // unità di misura (mostrata vicino al grafico o nel tooltip)
    label: "Temperatura" // titolo/etichetta mostrata nell’interfaccia
  },
  {
    key: "humidity",
    color: "#38bdf8",
    unit: "%RH",
    label: "Umidita"
  },
  {
    key: "pressure",
    color: "#7826a8",
    unit: "hPa",
    label: "Pressione"
  },
  {
    key: "noise",
    color: "#ff7de9",
    unit: "dB(A)",
    label: "Rumore"
  },
  {
    key: "gas_kohm",
    color: "#32faa7",
    unit: "kΩ",
    label: "Gas"
  },
  {
    key: "light_lux",
    color: "#fbbf24",
    unit: "lux",
    label: "Illuminazione"
  }
];

// Esportiamo la config per usarla in altre parti (es. TimelineSection con CHARTS_CONFIG.map(...))
export default CHARTS_CONFIG;
