import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFrame from "../components/auth/AuthFrame";
import AuthField, { EyeIcon } from "../components/auth/AuthField";
import { authAPI } from "../api/api";
import HomeHeroLogo from "../styles/img/HomeHero.svg";

/**
 * Register - Senior React Implementation
 * - Form State Management con validazione avanzata
 * - Real-time error clearing on field update
 * - API Integration con error handling
 * - Tailwind CSS design system
 */
export default function Register() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

    if (!formData.firstName.trim()) e.firstName = "Nome richiesto";
    if (!formData.lastName.trim()) e.lastName = "Cognome richiesto";

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

    if (formData.password !== formData.confirmPassword) {
      e.confirmPassword = "Le password non coincidono";
    }

    setErrors(e);
    return !Object.keys(e).length;
  };

  /**
   * handleSubmit - Gestione submit form con API call
   * Implementa error handling completo
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setApiError(null);

    try {
      const response = await authAPI.register({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setLoading(false);
      navigate("/dashboard");
    } catch (error) {
      setLoading(false);
      const errorMsg = error.response?.data?.message || "Errore registrazione. Riprova.";
      setApiError(errorMsg);
    }
  };

  // Stato dei campi validi (assenza di errori)
  const isFormValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    formData.password &&
    formData.confirmPassword &&
    !errors.firstName &&
    !errors.lastName &&
    !errors.email &&
    !errors.password &&
    !errors.confirmPassword;

  return (
    <AuthFrame title="System Registration" subtitle="New Identity Configuration" logo={HomeHeroLogo}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthField
          id="reg-firstName"
          name="firstName"
          label="Nome"
          autoComplete="given-name"
          value={formData.firstName}
          onChange={(e) => updateField("firstName", e.target.value)}
          placeholder="Giovanni"
          error={errors.firstName || ""}
        />

        <AuthField
          id="reg-lastName"
          name="lastName"
          label="Cognome"
          autoComplete="family-name"
          value={formData.lastName}
          onChange={(e) => updateField("lastName", e.target.value)}
          placeholder="Rossi"
          error={errors.lastName || ""}
        />

        <AuthField
          id="reg-email"
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
          id="reg-password"
          name="password"
          label="Password"
          type={showPw ? "text" : "password"}
          autoComplete="new-password"
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

        <AuthField
          id="reg-confirm"
          name="confirmPassword"
          label="Conferma password"
          type={showConfirm ? "text" : "password"}
          autoComplete="new-password"
          value={formData.confirmPassword}
          onChange={(e) => updateField("confirmPassword", e.target.value)}
          placeholder="••••••••"
          error={errors.confirmPassword || ""}
          right={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-lg transition hover:bg-[color:var(--auth-chip-bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--auth-ring)]"
              aria-label={showConfirm ? "Nascondi password" : "Mostra password"}
            >
              <EyeIcon open={showConfirm} />
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
          {loading ? "Creating identity..." : "Registrati"}
        </button>

        <p className="pt-2 text-center text-sm text-[color:var(--auth-fg-soft)]">
          Hai già un account?{" "}
          <Link
            to="/login"
            className={[
              "ml-2 inline-flex h-9 items-center rounded-lg border px-3 text-xs font-semibold tracking-wide transition",
              "border-[color:var(--auth-action-secondary-border)] bg-[color:var(--auth-action-secondary-bg)]",
              "text-[color:var(--auth-action-secondary-text)] decoration-[color:var(--auth-action-secondary-underline)]",
              "underline underline-offset-4 hover:bg-[color:var(--auth-action-secondary-bg-hover)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--auth-ring)]",
            ].join(" ")}
          >
            Accedi
          </Link>
        </p>
      </form>
    </AuthFrame>
  );
}
