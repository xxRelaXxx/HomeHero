import React, { useState, useEffect, useCallback } from 'react';
// useState  -> per salvare "stato" (valori che cambiano nel tempo) dentro al componente
// useEffect -> per eseguire codice quando il componente si monta / quando cambiano dipendenze
// useCallback -> per "memorizzare" una funzione e non ricrearla ad ogni render (utile con useEffect)

import { motion, AnimatePresence } from 'framer-motion';
const MotionDiv = motion.div;
const MotionSpan = motion.span;
// motion -> componenti animabili (es: <motion.div>)
// AnimatePresence -> gestisce animazioni di entrata/uscita quando un elemento appare/scompare

import { RefreshCw, Thermometer, ToggleLeft, ToggleRight, CheckCircle, AlertCircle } from 'lucide-react';
// Icone SVG pronte da usare come componenti React

import { deviceAPI } from '../../api/api';
// deviceAPI -> oggetto con funzioni per chiamare il backend (GET/POST/PUT ecc.)
// Qui lo usi per leggere e aggiornare le impostazioni del dispositivo

import fanSvg from '../../styles/img/fan.svg';
// Immagine della ventola (SVG)

// Nome del dispositivo (lo usi nelle chiamate API)
const DEVICE_NAME = 'esp32_living_room';

/**
 * FanIcon
 * - Piccolo componente che mostra l’icona della ventola.
 * - Se running è true, l’icona ruota in loop (animazione).
 * - size controlla grandezza in pixel.
 */
const FanIcon = ({ running, size = 48 }) => (
  <MotionDiv
    // animate: cosa deve fare l'animazione
    // rotate: se running è true ruota di 360°, altrimenti sta a 0°
    animate={{ rotate: running ? 360 : 0 }}
    // transition: come si comporta l'animazione nel tempo
    // repeat: Infinity = ripete all'infinito (solo se running)
    // duration: quanto dura un giro completo
    // ease: 'linear' = velocità costante
    transition={{ repeat: running ? Infinity : 0, duration: running ? 0.9 : 0.4, ease: 'linear' }}
    className="flex items-center justify-center"
    // style inline: dimensione del contenitore
    style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <img
      src={fanSvg}
      alt="fan"
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        // filter cambia il colore dell’SVG:
        // - se running: colore più "acceso"
        // - se non running: colore più "spento"
        filter: running
          ? 'brightness(0) saturate(100%) invert(66%) sepia(84%) saturate(1256%) hue-rotate(188deg) brightness(103%) contrast(101%)'
          : 'brightness(0) saturate(100%) invert(61%) sepia(10%) saturate(429%) hue-rotate(207deg) brightness(98%) contrast(86%)',
      }}
    />
  </MotionDiv>
);

export const FanControl = () => {
  // settings: conterrà i dati del dispositivo (modalità, soglia, stato manuale, ecc.)
  const [settings, setSettings] = useState(null);

  // loading: true mentre carichi i settings dal backend
  const [loading, setLoading] = useState(true);

  // saving: true mentre stai salvando una modifica
  const [saving, setSaving] = useState(false);

  // status: messaggio temporaneo (success/error) mostrato come toast
  const [status, setStatus] = useState(null);

  // fanOn: dice se la ventola è "ON" (qui solo in modalità manual)
  // optional chaining (?.) evita errori se settings è null
  const fanOn = settings?.fan_mode === 'manual' ? settings?.fan_manual_state === true : false;

  /**
   * fetchSettings
   * - Legge le impostazioni dal backend
   * - useCallback serve a non ricreare la funzione ad ogni render
   */
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      // Chiamata API: prende settings del dispositivo
      const res = await deviceAPI.getSettings(DEVICE_NAME);
      // res.data = dati che arrivano dal backend
      setSettings(res.data);
      setStatus(null);
    } catch (err) {
      // Provo a prendere un messaggio più dettagliato se esiste
      const detail = err.response?.data?.message || err.message;
      setStatus({ type: 'error', msg: `Load failed: ${detail}` });
    } finally {
      // Questo blocco gira sempre, sia in success che in error
      setLoading(false);
    }
  }, []);

  /**
   * useEffect (montaggio)
   * - Appena il componente appare, carica i settings una volta
   */
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  /**
   * showStatus
   * - Mostra un messaggio per 4 secondi, poi lo nasconde
   */
  const showStatus = (type, msg) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus(null), 4000);
  };

  /**
   * save
   * - patch = solo i campi che vuoi modificare (es: { fan_mode: 'auto' })
   * - unisce patch + settings correnti
   * - manda i dati al backend
   * - aggiorna lo stato locale (setSettings)
   */
  const save = async (patch) => {
    try {
      setSaving(true);

      // Creo un oggetto "updated" con i vecchi settings + le nuove modifiche
      const updated = { ...settings, ...patch };

      // Chiamata API per salvare solo i campi necessari
      await deviceAPI.updateFan(DEVICE_NAME, {
        fan_mode: updated.fan_mode,
        fan_manual_state: updated.fan_manual_state,
        fan_auto_temp_threshold: updated.fan_auto_temp_threshold,
      });

      // Aggiorno lo stato locale così l'interfaccia riflette subito il cambiamento
      setSettings(updated);
      showStatus('success', 'Fan settings aggiornati.');
    } catch (err) {
      const detail = err.response?.data?.message || err.message;
      showStatus('error', `Save failed: ${detail}`);
    } finally {
      setSaving(false);
    }
  };

  // Se stai caricando, mostri uno stato "loading" con iconcina che gira
  if (loading) {
    return (
      <div className="p-6 rounded-lg border border-[var(--hh-divider)]">
        <div className="flex items-center gap-3 text-slate-500">
          <MotionDiv animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
            <RefreshCw size={20} />
          </MotionDiv>
          Loading fan settings...
        </div>
      </div>
    );
  }

  // Flag comodi per capire la modalità attuale
  const isAuto = settings?.fan_mode === 'auto';
  const isManual = settings?.fan_mode === 'manual';

  return (
    <div className="space-y-4">
      {/* Header (titolo + nome dispositivo) */}
      <div className="flex items-center justify-between border-b border-[var(--hh-divider)] pb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg text-white">
            {/* Qui metti l'icona (non in rotazione) come "badge" */}
            <FanIcon running={false} size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--hh-text)]">Controllo Ventola</h3>
          </div>
        </div>
      </div>

      {/* Status toast (success / error) con animazione di entrata/uscita */}
      <AnimatePresence>
        {status && (
          <MotionDiv
            // animazione iniziale (quando appare)
            initial={{ opacity: 0, y: -8 }}
            // animazione mentre è visibile
            animate={{ opacity: 1, y: 0 }}
            // animazione quando sparisce
            exit={{ opacity: 0, y: -8 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-xs font-medium ${
              status.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/15 border-red-500/30 text-red-400'
            }`}
          >
            {/* Icona diversa in base al tipo */}
            {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            {status.msg}
          </MotionDiv>
        )}
      </AnimatePresence>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Fan visual (parte sinistra): mostra ventola e stato */}
        <div className="p-4 rounded-lg border border-[var(--hh-divider)] flex flex-col items-center justify-center gap-3">
          {/* running = fanOn -> se ON ruota */}
          <FanIcon running={fanOn} />
          <div
            className={`text-xs font-bold px-3 py-1 rounded-full ${
              fanOn ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-400/20 text-slate-400'
            }`}
          >
            {/* Se auto, scrivi AUTO, altrimenti ON/OFF */}
            {isAuto ? 'AUTO' : fanOn ? 'ON' : 'OFF'}
          </div>
        </div>

        {/* Controls (parte destra): bottoni e slider */}
        <div className="p-4 rounded-lg border border-[var(--hh-divider)] space-y-4">
          {/* Mode selector: scegli tra manual e auto */}
          <div>
            <p className="text-xs font-bold text-[var(--hh-muted)] mb-2 flex items-center gap-1">
              <span className="text-[10px]">MODE</span>
            </p>

            <div className="flex gap-2">
              {/* Bottone MANUAL: salva fan_mode: 'manual' */}
              <button
                onClick={() => save({ fan_mode: 'manual' })}
                disabled={saving} // disabilita mentre salvi
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  isManual
                    ? 'bg-blue-500/20 border-blue-500/40 text-blue-400'
                    : 'bg-white/10 border-white/20 text-slate-400 hover:bg-white/20'
                }`}
              >
                Manual
              </button>

              {/* Bottone AUTO: salva fan_mode: 'auto' */}
              <button
                onClick={() => save({ fan_mode: 'auto' })}
                disabled={saving}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                  isAuto
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                    : 'bg-white/10 border-white/20 text-slate-400 hover:bg-white/20'
                }`}
              >
                Auto
              </button>
            </div>
          </div>

          {/* Manual toggle: compare SOLO se sei in modalità manual */}
          <AnimatePresence>
            {isManual && (
              <MotionDiv
                // animazione altezza + opacità quando appare/sparisce
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {/* Toggle ON/OFF: inverti fan_manual_state */}
                <button
                  onClick={() => save({ fan_manual_state: !settings.fan_manual_state })}
                  className="flex items-center gap-4 text-2xl font-bold text-[var(--hh-text)] px-6 py-4 rounded-lg border border-[var(--hh-divider)] hover:bg-white/10 transition-all"
                >
                  {/* Icona diversa se ON o OFF */}
                  {settings?.fan_manual_state ? (
                    <ToggleRight size={40} className="text-blue-400" />
                  ) : (
                    <ToggleLeft size={40} className="text-slate-400" />
                  )}
                  Fan {settings?.fan_manual_state ? 'On' : 'Off'}
                </button>
              </MotionDiv>
            )}
          </AnimatePresence>

          {/* Auto threshold: compare SOLO se sei in modalità auto */}
          <AnimatePresence>
            {isAuto && (
              <MotionDiv
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-xs font-bold text-[var(--hh-muted)] mb-2 flex items-center gap-1">
                  <Thermometer size={12} /> Limite di temperatura
                </p>

                <div className="flex items-center gap-3">
                  {/* Slider: aggiorna lo stato mentre trascini, salva quando rilasci */}
                  <input
                    type="range"
                    min={15}
                    max={40}
                    step={0.5}
                    value={settings?.fan_auto_temp_threshold ?? 26} // se null/undefined usa 26
                    onChange={(e) =>
                      // Aggiorna SOLO localmente mentre sposti lo slider (UI reattiva)
                      setSettings((s) => ({ ...s, fan_auto_temp_threshold: parseFloat(e.target.value) }))
                    }
                    onMouseUp={(e) =>
                      // Quando rilasci col mouse, salva sul backend
                      save({ fan_auto_temp_threshold: parseFloat(e.target.value) })
                    }
                    onTouchEnd={(e) =>
                      // Su mobile: quando rilasci il touch, salva sul backend
                      save({ fan_auto_temp_threshold: parseFloat(e.target.value) })
                    }
                    className="flex-1 accent-blue-500 cursor-pointer h-2"
                  />

                  {/* Valore numerico a destra */}
                  <span className="text-sm font-bold text-blue-400 w-12 text-right">
                    {settings?.fan_auto_temp_threshold ?? 26}°C
                  </span>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>

          {/* Indicatore "Saving..." mentre salvi */}
          {saving && (
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <MotionSpan
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                className="inline-block"
              >
                <RefreshCw size={12} />
              </MotionSpan>
              Salvataggio...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FanControl;
