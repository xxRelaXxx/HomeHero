import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

/**
 * RequireAuth - Protegge le rotte che necessitano autenticazione
 * Se non loggato, reindirizza a /login
 */
function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  const loc = useLocation();
  if (!token) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return children;
}

/**
 * RedirectIfLoggedIn - Protegge le rotte pubbliche (Login/Register)
 * Se già loggato, reindirizza a /dashboard
 */
function RedirectIfLoggedIn({ children }) {
  const token = localStorage.getItem("token");
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      <Route 
        path="/login" 
        element={
          <RedirectIfLoggedIn>
            <Login />
          </RedirectIfLoggedIn>
        } 
      />
      
      <Route 
        path="/register" 
        element={
          <RedirectIfLoggedIn>
            <Register />
          </RedirectIfLoggedIn>
        } 
      />

      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
