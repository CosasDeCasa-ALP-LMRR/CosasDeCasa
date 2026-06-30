/**
 * @fileoverview AuthContext — estado global de sesión del usuario
 * Detecta si hay sesión activa intentando cargar /identity/perfiles/mi
 * @date 27/06/2026
 */
/**
 * @modified 28/06/2026
 * @author Luis Manuel
 * @requirement RF12: Interfaz de Autenticación y Enrutamiento por Roles
 * @requirement RNF7: Manejo de Sesión Transparente y Envío de Credenciales
 * @changes Se agregó listener para el evento global 'auth:session-expired'
 *          que dispara el interceptor de Axios (src/lib/axios.ts) cuando tanto
 *          el access_token como el refresh_token expiran. El contexto limpia
 *          el estado de sesión automáticamente para redirigir al login.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { logout as apiLogout, getMe } from '../features/auth-profile/services/auth.service';

export type UserRole = 'PROFESIONAL' | 'CLIENTE' | 'AUDITOR' | null;

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  nombre: string | null;
  fotoPerfil: string | null;
  checking: boolean;
}

interface AuthContextValue extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_EXPIRED_EVENT = 'auth:session-expired';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    nombre: null,
    fotoPerfil: null,
    checking: true,
  });

  const clearSession = useCallback(() => {
    setState({ isAuthenticated: false, role: null, nombre: null, fotoPerfil: null, checking: false });
  }, []);

  /** Intenta verificar si hay cookie válida cargando /auth/me */
  const checkSession = useCallback(async () => {
    try {
      const user = await getMe();
      setState({
        isAuthenticated: true,
        role: user.rol,
        nombre: user.nombre ?? null,
        fotoPerfil: user.fotoPerfil ?? null,
        checking: false,
      });
    } catch {
      clearSession();
    }
  }, [clearSession]);

  // Verificar sesión al montar la app
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  // Escuchar el evento del interceptor de Axios cuando ambos tokens expiran
  useEffect(() => {
    const handleSessionExpired = () => {
      clearSession();
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [clearSession]);

  const loginCtx = useCallback(async () => {
    // Después de que el servicio hace login exitoso, refrescamos la sesión
    await checkSession();
  }, [checkSession]);

  const logoutCtx = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // ignorar errores de red en logout
    }
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ ...state, login: loginCtx, logout: logoutCtx }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
