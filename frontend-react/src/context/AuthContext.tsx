/**
 * @fileoverview AuthContext — estado global de sesión del usuario
 * Detecta si hay sesión activa intentando cargar /identity/perfiles/mi
 * @date 27/06/2026
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    nombre: null,
    fotoPerfil: null,
    checking: true,
  });

  /** Intenta verificar si hay cookie válida cargando /auth/me */
  const checkSession = useCallback(async () => {
    try {
      const user = await getMe();
      setState({ isAuthenticated: true, role: user.rol, nombre: user.nombre ?? null, fotoPerfil: (user as any).fotoPerfil ?? null, checking: false });
    } catch {
      setState({ isAuthenticated: false, role: null, nombre: null, fotoPerfil: null, checking: false });
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await checkSession();
    })();
  }, [checkSession]);


  const loginCtx = useCallback(async () => {
    // Después de que el servicio hace login exitoso, refrescamos la sesión
    await checkSession();
  }, [checkSession]);

  const logoutCtx = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // ignore network errors on logout
    }
    setState({ isAuthenticated: false, role: null, nombre: null, fotoPerfil: null, checking: false });
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login: loginCtx, logout: logoutCtx }}
    >
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

