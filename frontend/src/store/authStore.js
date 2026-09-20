import { create } from 'zustand';
import { authAPI } from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('ck_user') || 'null'),
  token: localStorage.getItem('ck_token') || null,
  loading: false,

  setAuth: (token, user) => {
    localStorage.setItem('ck_token', token);
    localStorage.setItem('ck_user', JSON.stringify(user));
    set({ token, user });
  },

  logout: () => {
    localStorage.removeItem('ck_token');
    localStorage.removeItem('ck_user');
    set({ token: null, user: null });
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.login({ email, password });
      get().setAuth(data.token, data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Invalid email or password.',
      };
    } finally {
      set({ loading: false });
    }
  },

  register: async (formData) => {
    set({ loading: true });
    try {
      const { data } = await authAPI.register(formData);
      get().setAuth(data.token, data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed. Please try again.',
      };
    } finally {
      set({ loading: false });
    }
  },

  updateUser: (updatedUser) => {
    localStorage.setItem('ck_user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  refreshUser: async () => {
    try {
      const { data } = await authAPI.getMe();
      localStorage.setItem('ck_user', JSON.stringify(data.user));
      set({ user: data.user });
    } catch {
      get().logout();
    }
  },

  isAdmin: () => get().user?.role === 'admin',
  isLoggedIn: () => !!get().token,
}));

export default useAuthStore;
