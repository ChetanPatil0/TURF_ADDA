import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (userData, newToken) => {
        if (!userData || !newToken) {
          console.warn('setAuth called with missing user or token');
          return;
        }

        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(userData));

        set({
          user: userData,
          token: newToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (updatedUser) => {
        set((state) => ({
          user: { ...state.user, ...updatedUser },
        }));
      },

      isValidAuth: () => {
        const { token, user } = get();
        return !!token && !!user && !!user.role;
      },
    }),

    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      version: 1,
    }
  )
);

export default useAuthStore;