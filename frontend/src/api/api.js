import axios from 'axios';

// Crea una versione di axios gia pronta per parlare con il backend Laravel.
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
    'Content-Type': 'application/json',
         },
});

// Prima di ogni richiesta controlla se esiste il token salvato nel browser.
api.interceptors.request.use(
    (config) => {
    // Legge il token dal localStorage.
    const token = localStorage.getItem('token');
    if (token) {
      // Se il token esiste, lo aggiunge negli header per autenticare l'utente.
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Restituisce la configurazione finale della richiesta.
    return config;
    },
  // Se c'e un errore prima della richiesta, lo passa al chiamante.
  (error) => Promise.reject(error)
);

// Controlla le risposte del server e gestisce gli errori piu importanti.
api.interceptors.response.use(
  // Se la risposta va bene, la restituisce senza modificarla.
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Se il server risponde 401, il token non e piu valido o e scaduto.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Riporta l'utente alla pagina iniziale per rifare il login.
      window.location.href = '/';
    }
    // Rimanda l'errore a chi ha chiamato la funzione.
    return Promise.reject(error);
  }
);

// Funzioni per autenticazione utente.
export const authAPI = {
  // Invia i dati di registrazione al server.
  register: (data) => api.post('/register', data),
  // Invia email e password per fare il login.
  login: (data) => api.post('/login', data),
  // Comunica al server che l'utente vuole uscire.
  logout: () => api.post('/logout'),
};

// Funzioni per leggere e inviare i dati di telemetria.
export const telemetryAPI = {
  // Chiede al server tutte le letture salvate.
  getReadings: () => api.get('/telemetry'),
  // Invia una nuova lettura del dispositivo al server.
  addReading: (data) => api.post('/device/data', data),
};

// Funzioni per leggere e aggiornare i dati del profilo utente.
// export const userAPI = {
//   // Recupera i dati del profilo dell'utente loggato.
//   getProfile: () => api.get('/user'),
//   // Aggiorna i dati del profilo con i valori passati.
//   updateProfile: (data) => api.put('/user/profile', data),
// };

// Funzioni per leggere e modificare le impostazioni del dispositivo.
export const deviceAPI = {
  // Recupera le impostazioni del dispositivo indicato.
  getSettings: (deviceName) => api.get(`/device/${deviceName}/settings`),
  // Aggiorna i dati della ventola del dispositivo indicato.
  updateFan: (deviceName, data) => api.put(`/device/${deviceName}/fan`, data),
};

export default api;
