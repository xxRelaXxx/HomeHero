# API Reference

Base URL: `VITE_API_BASE_URL`

Il client Axios condiviso vive in `src/api/api.js` e:

- imposta `Content-Type: application/json`
- aggiunge `Authorization: Bearer <token>` se il token esiste
- su `401` pulisce `localStorage` e riporta a `/`

## Endpoint usati nel frontend attuale

### Auth

- `POST /register`
  Usato in `src/pages/Register.jsx` tramite `authAPI.register(data)`
- `POST /login`
  Usato in `src/pages/Login.jsx` tramite `authAPI.login(data)`

### Telemetria

- `GET /telemetry`
  Usato in `src/componentsDashboard/hooks/useSensorData.js` tramite `telemetryAPI.getReadings()`

### Ventola dispositivo

- `GET /device/{device}/settings`
  Usato in `src/componentsDashboard/sections/FanControl.jsx` tramite `deviceAPI.getSettings(deviceName)`
- `PUT /device/{device}/fan`
  Usato in `src/componentsDashboard/sections/FanControl.jsx` tramite `deviceAPI.updateFan(deviceName, data)`

## Endpoint esportati ma non usati nel frontend attuale

- `POST /logout`
- `POST /device/data`
- `GET /user`
- `PUT /user/profile`

## Client API esportati

```js
authAPI.register(data)
authAPI.login(data)
authAPI.logout()

telemetryAPI.getReadings()
telemetryAPI.addReading(data)

userAPI.getProfile()
userAPI.updateProfile(data)

deviceAPI.getSettings(deviceName)
deviceAPI.updateFan(deviceName, data)
```
