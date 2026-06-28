/**
 * @fileoverview App root — routing shell con autenticación para CosasDeCasa
 * Maneja: Login → Register → Perfil profesional (RF1 + RF2)
 */
import { useState, useEffect } from 'react';
import { User, Home, LogOut, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './features/auth-profile/components/LoginPage';
import { RegisterPage } from './features/auth-profile/components/RegisterPage';
import { LandingPublicHomePage } from './features/auth-profile/components/LandingPublicHomePage';
import { PerfilProfesionalPage } from './features/auth-profile/components/PerfilProfesionalPage';

import { AuditorDashboardPage } from './features/auditor/components/AuditorDashboardPage';
import { ClienteHomePage } from './features/cliente/components/ClienteHomePage';
import { ProfileAvatar } from './features/auth-profile/components/ProfileAvatar';
import { PerfilProfesionalPublicoPage } from './features/auth-profile/components/PerfilProfesionalPublicoPage';
import './App.css';


// ─── Auth screen (Landing) ───────────────────────────────────────────────
type AuthScreen = 'login' | 'register';


// ─── Authenticated shell with navbar ─────────────────────────────────────
function AppShell() {
  const { logout, role } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [path, setPath] = useState(window.location.pathname);

  // Listen to browser navigation events so pushState/popState re-renders
  useEffect(() => {
    const handleNav = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handleNav);
    return () => window.removeEventListener('popstate', handleNav);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    setLoggingOut(false);
  };

  const isPublicProfilePath = path.startsWith('/perfil/');

  return (
    <div className="app-shell">
      <nav className="app-navbar" aria-label="Navegación principal">
        <a href="/" className="app-navbar-brand">
          Cosas<span>de</span>Casa
        </a>

        <div className="app-navbar-nav">
          <a href="/" className={`app-nav-link ${path === '/' ? 'active' : ''}`}>
            <Home size={16} />
            Inicio
          </a>
          {role === 'PROFESIONAL' && (
            <a href="/perfil" className={`app-nav-link ${path === '/perfil' ? 'active' : ''}`}>
              <User size={16} />
              Mi Perfil
            </a>
          )}
          <div style={{ marginLeft: '12px', marginRight: '12px' }}>
            <ProfileAvatar size={36} editable={true} />
          </div>
          <button
            id="btn-logout"
            className="app-nav-link"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut
              ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />
              : <LogOut size={16} />}
            Salir
          </button>
        </div>
      </nav>

      <main className="app-main">
        {isPublicProfilePath ? (
           <PerfilProfesionalPublicoPage />
        ) : (
          <>
            {role === 'PROFESIONAL' && path === '/perfil' && <PerfilProfesionalPage />}
            {role === 'PROFESIONAL' && path === '/' && <PerfilProfesionalPage />}
            {role === 'AUDITOR' && <AuditorDashboardPage />}
            {role === 'CLIENTE' && <ClienteHomePage />}
          </>
        )}
      </main>
    </div>
  );
}

// ─── Root router — checks session first ──────────────────────────────────
function AppRouter() {
  const { isAuthenticated, checking } = useAuth();
  const [authMode, setAuthMode] = useState<AuthScreen | null>(null);

  if (checking) {
    return (
      <div className="app-loading">
        <Loader2 size={36} className="app-loading-spinner" />
        <p>Verificando sesión...</p>
      </div>
    );
  }

  if (isAuthenticated) return <AppShell />;

  // Landing para no autenticados (con carrusel)
  if (!authMode) {
    return <LandingPublicHomePage />;
  }

  return authMode === 'register' ? (
    <RegisterPage onGoLogin={() => setAuthMode('login')} />
  ) : (
    <LoginPage onGoRegister={() => setAuthMode('register')} />
  );

}


// ─── App entry point ──────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
