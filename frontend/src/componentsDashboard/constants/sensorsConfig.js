// SENSORS_CONFIG = "ricetta" delle sensor card (approccio DRY: Don't Repeat Yourself)
// Invece di ripetere 6 volte lo stesso codice per le card,
// descriviamo le card in un array e poi le generiamo con .map().

const SENSORS_CONFIG = [
  {
    key: "temperature",      // nome del campo nei dati (es: currentData.temperature)
    icon: "Thermometer",     // nome dell'icona da lucide-react
    label: "Temperatura",    // titolo mostrato nella card
    unit: "°C",              // unità di misura
    decimals: 1,             // numero di decimali da visualizzare
    color: "#d41548"         // colore della card (abbinato ai charts)
  },
  {
    key: "humidity",
    icon: "Droplets",
    label: "Umidità",
    unit: "%RH",
    decimals: 0,
    color: "#38bdf8"
  },
  {
    key: "pressure",
    icon: "Gauge",
    label: "Pressione",
    unit: "hPa",
    decimals: 0,
    color: "#8d4eb1"
  },
  {
    key: "noise",
    icon: "Volume2",
    label: "Rumore",
    unit: "dB(A)",
    decimals: 1,
    color: "#ff7de9"
  },
  {
    key: "gas_kohm",
    icon: "Cloud",
    label: "Gas",
    unit: "kΩ",
    decimals: 0,
    color: "#32faa7"
  },
  {
    key: "light_lux",
    icon: "Sun",
    label: "Illuminazione",
    unit: "lux",
    decimals: 0,
    color: "#c19f18"
  }
];

// Esportiamo la config per usarla in altre parti (es. SensorCardsSection con SENSORS_CONFIG.map(...))
export default SENSORS_CONFIG;
