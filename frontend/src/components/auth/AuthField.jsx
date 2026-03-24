

import React from "react";

/**
 * AuthField
 * Campo riutilizzabile per i form di autenticazione.
 * Mostra label, input, eventuale elemento a destra e messaggio di errore.
 * I colori dipendono dalle variabili CSS impostate da AuthFrame.
 */
export default function AuthField({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  autoComplete,
  error,
  right,
}) {
  // Se esiste un errore, colleghiamo l'input al messaggio con aria-describedby.
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-semibold tracking-wider text-[color:var(--auth-fg-muted)]">
        {label}
      </label>

      {/* Wrapper relativo utile per posizionare un elemento opzionale a destra dell'input. */}
      <div className="relative">
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={[
            "h-11 w-full rounded-xl border px-3 text-sm outline-none transition",
            "bg-[color:var(--auth-input-bg)] text-[color:var(--auth-fg)] placeholder:text-[color:var(--auth-placeholder)]",
            "border-[color:var(--auth-input-border)] focus-visible:ring-2 focus-visible:ring-[color:var(--auth-ring)]",
            error
              ? "border-[color:var(--auth-error-border)] focus-visible:border-[color:var(--auth-error-border)] focus-visible:ring-[color:var(--auth-error-bg)]"
              : "focus-visible:border-[color:var(--auth-focus-border)]",
            right ? "pr-11" : "",
          ].join(" ")}
        />

        {right ? <div className="absolute inset-y-0 right-0 grid place-items-center pr-2">{right}</div> : null}
      </div>

      {/* Il blocco errore resta nascosto finche non c'e un messaggio da mostrare. */}
      <p
        id={errorId}
        className={["text-xs", error ? "block" : "hidden"].join(" ")}
        role={error ? "alert" : undefined}
        style={error ? { color: "var(--auth-error-text)" } : undefined}
      >
        {error || "\u2014"}
      </p>
    </div>
  );
}

/**
 * EyeIcon
 * Piccola icona SVG inline usata, ad esempio, per mostrare o nascondere la password.
 */
export function EyeIcon({ open = false }) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className="text-[color:var(--auth-fg-muted)]"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </>
      )}
    </svg>
  );
}
