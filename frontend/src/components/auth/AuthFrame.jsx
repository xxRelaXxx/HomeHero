import React, { useEffect, useMemo, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import bgImg from "../../styles/img/backgroundImg.svg";

// Chiavi condivise con la dashboard per mantenere il tema sincronizzato.
const THEME_KEYS = ["theme", "hh-theme", "hh_dashboard_theme"];

function readStoredTheme() {
  if (typeof window === "undefined") return null;
  try {
    for (const k of THEME_KEYS) {
      const v = window.localStorage.getItem(k);
      if (v === "dark" || v === "light") return v;
    }
  } catch {
    // ignore
  }
  return null;
}

function writeStoredTheme(theme) {
  if (typeof window === "undefined") return;
  try {
    for (const k of THEME_KEYS) window.localStorage.setItem(k, theme);
  } catch {
    // ignore
  }
}

function getSystemTheme() {
  if (typeof window === "undefined") return "dark";
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? true;
  return prefersDark ? "dark" : "light";
}

/**
 * Pulsante locale per il cambio tema.
 * Se non viene passato uno slot topRight, AuthFrame usa questo di default.
 */
function ThemeToggle({ theme, setTheme }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold",
        "tracking-widest uppercase backdrop-blur-md transition",
        "border-[color:var(--auth-chip-border)] bg-[color:var(--auth-chip-bg)] text-[color:var(--auth-fg-muted)]",
        "hover:bg-[color:var(--auth-chip-bg-hover)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--auth-ring)]",
      ].join(" ")}
      aria-label={isDark ? "Attiva modalita chiara" : "Attiva modalita scura"}
    >
      {isDark ? <Moon size={16} /> : <Sun size={16} />}
      <span>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}

/**
 * AuthFrame
 * Contenitore comune per login e registrazione.
 * Gestisce:
 * - tema chiaro/scuro
 * - sfondo con effetto spotlight
 * - card centrale con logo, titolo e contenuto
 */
export default function AuthFrame({ title, subtitle, topRight, logo, children }) {
  const rootRef = useRef(null);
  const [theme, setTheme] = useState(() => readStoredTheme() || getSystemTheme());
  const isDark = theme === "dark";

  // Maschera usata per il secondo layer di sfondo, quello "rivelato" dalla torcia.
  const revealMask = useMemo(() => {
    const g =
      "radial-gradient(circle var(--torch-radius) at var(--torch-x) var(--torch-y), rgba(0,0,0,1) 0%, rgba(0,0,0,1) 28%, rgba(0,0,0,0) 60%)";
    return { WebkitMaskImage: g, maskImage: g };
  }, []);

  // Sincronizza il tema locale con localStorage e con il documento.
  useEffect(() => {
    writeStoredTheme(theme);
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    }
  }, [theme]);

  /**
   * Effetto spotlight:
   * segue il puntatore in modo fluido aggiornando variabili CSS sul contenitore root.
   * Se e attivo "reduced motion", il movimento diventa immediato.
   */
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    const target = { x: 0.5, y: 0.5 };
    const current = { x: 0.5, y: 0.5 };
    let raf = 0;

    const lerp = (a, b, t) => a + (b - a) * t;

    const tick = () => {
      if (reduced) {
        current.x = target.x;
        current.y = target.y;
      } else {
        current.x = lerp(current.x, target.x, 0.12);
        current.y = lerp(current.y, target.y, 0.12);
      }

      el.style.setProperty("--torch-x", `${current.x * 100}%`);
      el.style.setProperty("--torch-y", `${current.y * 100}%`);
      raf = requestAnimationFrame(tick);
    };

    const setFromEvent = (e) => {
      const rect = el.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width;
      const cy = (e.clientY - rect.top) / rect.height;
      target.x = Math.min(1, Math.max(0, cx));
      target.y = Math.min(1, Math.max(0, cy));
    };

    const onPointerMove = (e) => setFromEvent(e);
    const onPointerLeave = () => {
      target.x = 0.5;
      target.y = 0.5;
    };

    el.addEventListener("pointermove", onPointerMove, { passive: true });
    el.addEventListener("pointerleave", onPointerLeave, { passive: true });

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  // Variabili CSS del tema condivise da tutta la UI auth.
  const themeVars = useMemo(() => {
    const dash = isDark
      ? {
          pageBg: "#020617",
          text: "#e2e8f0",
          muted: "#94a3b8",
          muted2: "#64748b",
          surfaceSolid: "#0f172a",
          headerSurface: "rgba(15, 23, 42, 0.8)",
          controlBg: "#1e293b",
          controlBgHover: "#334155",
          controlBorder: "#475569",
          border: "rgba(96, 104, 116, 0.95)",
          divider: "rgba(100, 116, 139, 0.6)",
        }
      : {
          pageBg: "#f6f1e7",
          text: "#0f172a",
          muted: "#475569",
          muted2: "#64748b",
          surfaceSolid: "rgba(255, 255, 255, 0.92)",
          headerSurface: "rgba(255, 255, 255, 0.85)",
          controlBg: "rgba(15, 23, 42, 0.06)",
          controlBgHover: "rgba(15, 23, 42, 0.1)",
          controlBorder: "rgba(15, 23, 42, 0.15)",
          border: "rgba(15, 23, 42, 0.14)",
          divider: "rgba(15, 23, 42, 0.12)",
        };

    return {
      "--auth-page-bg": dash.pageBg,
      "--auth-fg": dash.text,
      "--auth-fg-muted": dash.muted,
      "--auth-fg-soft": dash.muted2,
      "--auth-placeholder": isDark ? "rgba(148,163,184,0.78)" : "rgba(71,85,105,0.64)",
      "--auth-card-bg": isDark ? "rgba(15,23,42,0.74)" : "rgba(255,255,255,0.86)",
      "--auth-card-border": dash.border,
      "--auth-chip-bg": dash.headerSurface,
      "--auth-chip-bg-hover": dash.surfaceSolid,
      "--auth-chip-border": dash.controlBorder,
      "--auth-input-bg": isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.94)",
      "--auth-input-border": dash.controlBorder,
      "--auth-focus-border": isDark ? "#64748b" : "rgba(15,23,42,0.24)",
      "--auth-ring": isDark ? "rgba(6,182,212,0.42)" : "rgba(6,182,212,0.32)",
      "--auth-action-primary-bg": isDark
        ? "linear-gradient(180deg, #334155, #1e293b)"
        : "linear-gradient(180deg, #475569, #334155)",
      "--auth-action-primary-bg-hover": isDark
        ? "linear-gradient(180deg, #475569, #334155)"
        : "linear-gradient(180deg, #64748b, #475569)",
      "--auth-action-primary-border": isDark ? "#475569" : "#475569",
      "--auth-action-primary-text": "rgba(248,250,252,1)",
      "--auth-action-primary-shadow": isDark
        ? "0 10px 26px -16px rgba(2,6,23,0.9)"
        : "0 10px 24px -16px rgba(51,65,85,0.5)",
      "--auth-action-secondary-bg": isDark ? "rgba(15,23,42,0.72)" : "rgba(255,255,255,0.85)",
      "--auth-action-secondary-bg-hover": isDark ? "rgba(30,41,59,0.9)" : "rgba(255,255,255,0.98)",
      "--auth-action-secondary-border": dash.controlBorder,
      "--auth-action-secondary-text": isDark ? "#cbd5e1" : dash.muted,
      "--auth-action-secondary-underline": isDark ? "#94a3b8" : dash.muted,
      "--auth-switch-track": dash.controlBg,
      "--auth-switch-thumb": isDark ? "#e2e8f0" : "#334155",
      "--auth-error-bg": "rgba(244,63,94,0.10)",
      "--auth-error-border": isDark ? "rgba(254,202,202,0.18)" : "rgba(190,18,60,0.22)",
      "--auth-error-text": isDark ? "rgba(254,226,226,0.95)" : "rgba(159,18,57,0.92)",
    };
  }, [isDark]);

  return (
    <div
      ref={rootRef}
      className="relative min-h-screen overflow-hidden text-[color:var(--auth-fg)]"
      style={{
        ...themeVars,
        "--torch-radius": "clamp(120px, 18vw, 240px)",
        "--torch-x": "50%",
        "--torch-y": "50%",
      }}
    >
      {/* Layer di sfondo composto da immagine base, spotlight e overlay di leggibilita. */}
      <div className="absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${bgImg})`,
            opacity: isDark ? 0.42 : 0.18,
            backgroundColor: "var(--auth-page-bg)",
            filter: isDark
              ? "invert(1) brightness(0.92) contrast(1.08) saturate(0.9)"
              : "brightness(0.95) contrast(1.02) saturate(0.72)",
          }}
        />

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${bgImg})`,
            opacity: isDark ? 0.96 : 0.28,
            filter: isDark
              ? "invert(1) brightness(1.02) contrast(1.1) saturate(1.0)"
              : "brightness(1.04) contrast(1.02) saturate(0.7)",
            ...revealMask,
          }}
        />

        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{
            background: isDark
              ? "radial-gradient(closest-side at 50% 38%, rgba(255,255,255,0.14), rgba(0,229,255,0.06) 34%, rgba(0,0,0,0) 72%)"
              : "radial-gradient(closest-side at 50% 38%, rgba(15,23,42,0.08), rgba(15,23,42,0.03) 40%, rgba(255,255,255,0) 75%)",
            boxShadow: isDark
              ? "inset 0 0 140px rgba(255,255,255,0.05)"
              : "inset 0 0 140px rgba(15,23,42,0.08)",
            opacity: 0.95,
          }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? "linear-gradient(to bottom, rgba(0,0,0,0.75), rgba(0,0,0,0.55), rgba(0,0,0,0.80))"
              : "linear-gradient(to bottom, rgba(246,241,231,0.76), rgba(255,255,255,0.58), rgba(246,241,231,0.82))",
          }}
        />
      </div>

      <div className="fixed right-5 top-5 z-20">
        {topRight ?? <ThemeToggle theme={theme} setTheme={setTheme} />}
      </div>

      {/* Card principale dell'autenticazione con header e contenuto passato dal padre. */}
      <main className="relative z-10 flex min-h-screen items-center justify-center p-4" role="main">
        <section
          className={[
            "w-full max-w-md rounded-2xl border p-6 shadow-2xl backdrop-blur-xl",
            "border-[color:var(--auth-card-border)] bg-[color:var(--auth-card-bg)]",
          ].join(" ")}
        >
          <header className="mb-6 text-center">
            {logo ? (
              <div className="mx-auto mb-4 flex h-32 w-32 items-center justify-center">
                <img
                  src={logo}
                  alt="Logo"
                  className={isDark ? "h-full w-full object-contain brightness-0 invert" : "h-full w-full object-contain"}
                  aria-hidden="true"
                />
              </div>
            ) : (
              <div
                className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-xl ring-1"
                style={{
                  background: isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.04)",
                  borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(15,23,42,0.10)",
                }}
              >
                <span className="text-xs font-semibold tracking-widest text-[color:var(--auth-fg-muted)]">HX</span>
              </div>
            )}

            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm text-[color:var(--auth-fg-soft)]">{subtitle}</p> : null}
          </header>

          {children}
        </section>
      </main>
    </div>
  );
}
