import jwtDecode from 'jwt-decode';
import { toast } from 'react-toastify';

// Salva dati autenticazione
export const setAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('auth_timestamp', Date.now().toString());
};

// Recupera token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Recupera dati utente
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Verifica se autenticato
export const isAuthenticated = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    // Controlla se il token è scaduto
    if (decoded.exp < currentTime) {
      logout();
      return false;
    }
    
    // Controlla se l'ultimo accesso è stato più di 7 giorni fa
    const authTimestamp = localStorage.getItem('auth_timestamp');
    if (authTimestamp) {
      const daysSinceLogin = (Date.now() - parseInt(authTimestamp)) / (1000 * 60 * 60 * 24);
      if (daysSinceLogin > 7) {
        logout();
        toast.info('Sessione scaduta per inattività');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    logout();
    return false;
  }
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('auth_timestamp');
  window.location.href = '/login';
};

// Decodifica token
export const decodeToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};

// Controlla se l'utente è il proprietario
export const isOwner = (resourceUserId) => {
  const user = getUser();
  return user && user.id === resourceUserId;
};

// Verifica ruolo utente (per funzionalità future)
export const hasRole = (role) => {
  const user = getUser();
  return user && user.role === role;
};

// Aggiorna dati utente nel localStorage
export const updateUserData = (newUserData) => {
  const currentUser = getUser();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...newUserData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }
};