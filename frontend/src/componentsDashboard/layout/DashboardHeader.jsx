// Importiamo React e alcuni "hook"
// useState  → per gestire lo stato (dati che cambiano nel tempo)
// useEffect → per eseguire codice quando succede qualcosa (eventi, mount, unmount)
// useRef    → per avere un riferimento diretto a un elemento HTML


import React, { useEffect, useRef, useState } from "react";

// Hook di React Router per cambiare pagina via codice
import { useNavigate } from "react-router-dom";

// Icone SVG già pronte (libreria lucide-react)
import { Download, User, Sun, Moon, LogOut } from "lucide-react";

// Import logo
import HomeHeroLogo from "../../styles/img/HomeHero.svg";

/*
  DashboardHeader
  ===============
  Questo componente NON è decorativo.
  È il punto di controllo della Dashboard.

  Qui l’utente:
  - capisce se il sistema è vivo (ONLINE / OFFLINE)
  - esporta dati (azione critica)
  - gestisce il proprio stato (tema + logout)

  Scelta architetturale:
  - separarlo dalla Dashboard evita di mescolare:
    * visualizzazione dati
    * controllo utente
    * responsabilità di sessione
*/

const DashboardHeader = ({ onExportCSV, theme, onToggleTheme }) => {
  const navigate = useNavigate();

  /*
    STATE
    -----
    menuOpen è l’unico stato locale:
    - true  → menu account visibile
    - false → menu account nascosto

    Tutto il resto (tema, online, export) arriva dall’alto:
    il Header NON decide, esegue.
  */
  const [menuOpen, setMenuOpen] = useState(false);

  /*
    REFS
    ----
    Questi ref NON servono per il rendering,
    ma per il CONTROLLO dell’interazione utente.

    Ci permettono di rispondere a una domanda chiave:
    “Hai cliccato DENTRO il menu o FUORI?”
  */
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  /*
    EFFECT: gestione eventi globali
    -------------------------------
    Qui agganciamo il componente al mondo esterno (document):
    - click fuori dal menu
    - tasto ESC

    Questo è codice che:
    - non appartiene alla UI
    - non appartiene allo stato
    ma al COMPORTAMENTO dell’utente.
  */
  useEffect(() => {
    const closeIfOutside = (e) => {
      const menuEl = menuRef.current;
      const btnEl = buttonRef.current;
      if (!menuEl || !btnEl) return;

      const clickedMenu = menuEl.contains(e.target);
      const clickedButton = btnEl.contains(e.target);

      // Se clicchi fuori da menu E bottone → chiudi
      if (!clickedMenu && !clickedButton) setMenuOpen(false);
    };

    const closeOnEscape = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", closeIfOutside);
    document.addEventListener("keydown", closeOnEscape);

    /*
      CLEANUP
      -------
      Fondamentale per evitare:
      - memory leak
      - listener duplicati
      - comportamenti fantasma

      Ogni effetto globale deve SEMPRE pulire.
    */
    return () => {
      document.removeEventListener("mousedown", closeIfOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const logout = () => {
    /*
      LOGOUT = azione di potere
      -----------------------
      1. feedback immediato (chiudi menu)
      2. invalidi la sessione (token)
      3. cancella dati utente
      4. redirigi forzatamente

      Nessuna animazione, nessuna incertezza.
    */
    setMenuOpen(false);

    // Cancella token e user dal localStorage
    // RequireAuth si basa su questo token:
    // rimuoverlo = perdere il diritto di stare qui
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // replace: true → impedisce di tornare indietro col browser
    navigate("/login", { replace: true });
  };

  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
      {/* BLOCCO IDENTITÀ */}
      {/* Qui non mostri dati, mostri CHI SEI */}
      <div className="flex items-center gap-3">
        <img
          src={HomeHeroLogo}
          alt="Home Hero Logo"
          className={`w-32 h-32 ${
            theme === "light" ? "" : "brightness-0 invert"
          }`}
          aria-hidden="true"
        />
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[var(--hh-text)]">Home Hero</h1>
        </div>
      </div>

      {/* BLOCCO CONTROLLO */}
      {/* Tutto ciò che segue è “comando”, non decorazione */}
      <div className="relative flex items-center gap-6 bg-[var(--hh-header-surface)] backdrop-blur px-6 py-2 rounded-full border border-[var(--hh-border)] shadow-lg">
        
      

        <div className="h-4 w-[1px] bg-[var(--hh-divider)]" aria-hidden="true" />

        {/* AZIONE CRITICA */}
        {/* Export CSV NON è secondaria: è una decisione dell’utente */}
        <button
          onClick={onExportCSV}
          className="flex items-center gap-2 text-[var(--hh-muted)] hover:text-[var(--hh-text)] transition-colors"
          aria-label="Export data to CSV"
          type="button"
        >
          <span className="text-xs font-bold">EXPORT CSV</span>
          <Download size={16} aria-hidden="true" />
        </button>

        <div className="h-4 w-[1px] bg-[var(--hh-divider)]" aria-hidden="true" />
        {/* TEMA TOGGLE */}
        {/* Bottone standalone per cambiare tema */}
        <button
          onClick={onToggleTheme}
          className="flex items-center justify-center text-[var(--hh-muted)] hover:text-[var(--hh-text)] transition-colors"
          aria-label={theme === "light" ? "Passa a tema scuro" : "Passa a tema chiaro"}
          type="button"
        >
          {theme === "light" ? (
            <Moon size={16} aria-hidden="true" />
          ) : (
            <Sun size={16} aria-hidden="true" />
          )}
        </button>

        <div className="h-4 w-[1px] bg-[var(--hh-divider)]" aria-hidden="true" />
        {/* MENU ACCOUNT */}
        {/* Qui concentriamo le azioni personali dell’utente */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--hh-control-bg)] hover:bg-[var(--hh-control-bg-hover)] transition-colors border border-[var(--hh-control-border)]"
            aria-label="Account menu"
            aria-expanded={menuOpen}
            type="button"
          >
            <User size={16} aria-hidden="true" />
          </button>

          {menuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-52 rounded-lg border border-[var(--hh-border)] bg-[var(--hh-surface-solid)] shadow-xl overflow-hidden z-50"
              role="menu"
              aria-label="Account actions"
            >
              {/* LOGOUT */}
              {/* Azione distruttiva → stile coerente (rosso) */}
              <button
                onClick={logout}
                className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-950/40 flex items-center gap-2"
                type="button"
                role="menuitem"
              >
                <LogOut size={16} aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
