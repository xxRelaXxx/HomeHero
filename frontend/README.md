# Home Hero

Frontend React + Vite per autenticazione, dashboard sensori e controllo ventola del progetto Home Hero.

## Script

```bash
cd frontend
cp .env.example .env          # set VITE_API_BASE_URL and VITE_WEATHER_API_KEY right after
npm run dev                   # avvia il server di sviluppo Vite
npm run build                 # genera la build di produzione
```

## Struttura

```text
src/
  api/                       client Axios e API wrapper
  components/auth/           layout e campi riutilizzabili per login/register
  componentsDashboard/       card, grafici, hook e sezioni dashboard
  pages/                     Login, Register, Dashboard
  styles/                    CSS dashboard e immagini condivise
```

## Note

- Il tema auth e il tema dashboard condividono le stesse chiavi di `localStorage`.
- Il progetto usa `VITE_API_BASE_URL` per puntare al backend.
- `sketch.cpp` e `data/db.json` sono file di supporto al progetto complessivo e non fanno parte della build Vite.
