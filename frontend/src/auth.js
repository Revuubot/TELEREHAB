const TOKEN_KEY = 'telerehab_token';
const USER_KEY = 'telerehab_user';

export const auth = {
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
  
  setUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  
  removeUser() {
    localStorage.removeItem(USER_KEY);
  },
  
  isAuthenticated() {
    return !!this.getToken();
  },
  
  isClinicianRole() {
    const user = this.getUser();
    return user?.role === 'clinician';
  },
  
  isPatientRole() {
    const user = this.getUser();
    return user?.role === 'patient';
  },
  
  logout() {
    this.removeToken();
    this.removeUser();
  }
};