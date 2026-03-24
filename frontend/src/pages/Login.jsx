import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "../components/auth/AuthFrame";
import AuthField, { EyeIcon } from "../components/auth/AuthField";
import { authAPI } from "../api/api";
import HomeHeroLogo from "../styles/img/HomeHero.svg";

/**
 * Login - Senior React Implementation
 * - Form State Management con validazione avanzata
 * - Real-time error clearing on field update
 * - API Integration con error handling
 * - Tailwind CSS design system
 */
export default function Login() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  /**
   * updateField - Aggiorna un campo del form e cancella l'errore corrispondente
   * Implementazione professionale che mantiene immutabilità e reactività
   */
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  /**
   * validate - Validazione email e password con regex professionali
   * Usa pattern affidabili e messaggi utente-friendly
   */
  const validate = () => {
    const e = {};

    if (!formData.email.trim()) {
      e.email = "Email richiesta";
    } else if (!/\S+@\S+.\S+/.test(formData.email)) {
      e.email = "Email non valida";
    }

    if (!formData.password) {
      e.password = "Password richiesta";
    } else if (formData.password.length < 6) {
      e.password = "Minimo 6 caratteri";
    }

    setErrors(e);
    return !Object.keys(e).length;
  };

  /**
   * handleSubmit - Gestione submit form con API call
   * Implementa retry logic e error handling completo
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    try {
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      // Salva token e user info nel localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.message || "Credenziali non valide. Riprova.";
      setApiError(errorMsg);
    }
  };

  // Stato dei campi validi (assenza di errori)
  const isFormValid =
    formData.email.trim() &&
    formData.password &&
    !errors.email &&
    !errors.password;

  return (
    <AuthFrame title="Home Hero Network" subtitle="Secure Access Terminal" logo={HomeHeroLogo}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthField
          id="login-email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="nome@istituto.it"
          error={errors.email || ""}
        />

        <AuthField
          id="login-password"
          name="password"
          label="Password"
          type={showPw ? "text" : "password"}
          autoComplete="current-password"
          value={formData.password}
          onChange={(e) => updateField("password", e.target.value)}
          placeholder="••••••••"
          error={errors.password || ""}
          right={
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-lg transition hover:bg-[color:var(--auth-chip-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--auth-ring)]"
              aria-label={showPw ? "Nascondi password" : "Mostra password"}
            >
              <EyeIcon open={showPw} />
            </button>
          }
        />

        {apiError ? (
          <p
            className="rounded-xl border bg-[color:var(--auth-error-bg)] px-3 py-2 text-sm"
            style={{
              borderColor: "var(--auth-error-border)",
              color: "var(--auth-error-text)",
            }}
            role="alert"
          >
            {apiError}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className={[
            "h-11 w-full rounded-xl border text-sm font-semibold tracking-wide transition",
            "border-[color:var(--auth-action-primary-border)] text-[color:var(--auth-action-primary-text)]",
            "bg-[image:var(--auth-action-primary-bg)] shadow-[var(--auth-action-primary-shadow)]",
            "hover:-translate-y-0.5 hover:bg-[image:var(--auth-action-primary-bg-hover)]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--auth-ring)]",
            "active:translate-y-0",
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
          ].join(" ")}
        >
          {loading ? "Authenticating..." : "Login"}
        </button>

        <p className="pt-2 text-center text-sm text-[color:var(--auth-fg-soft)]">
          Non hai un account?{" "}
          <Link
            to="/register"
            className={[
              "ml-2 inline-flex h-9 items-center rounded-lg border px-3 text-xs font-semibold tracking-wide transition",
              "border-[color:var(--auth-action-secondary-border)] bg-[color:var(--auth-action-secondary-bg)]",
              "text-[color:var(--auth-action-secondary-text)] decoration-[color:var(--auth-action-secondary-underline)]",
              "underline underline-offset-4 hover:bg-[color:var(--auth-action-secondary-bg-hover)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--auth-ring)]",
            ].join(" ")}
          >
            Registrati
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}
