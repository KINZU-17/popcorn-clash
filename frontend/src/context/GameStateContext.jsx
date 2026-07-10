/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const GameStateContext = createContext();

const defaultUser = {
  isAuthenticated: false,
  username: '',
  role: null,
  streak_count: 0,
  current_level: 1,
  current_xp: 0,
  xp_to_next_level: 100,
  favorite_club: ''
};

export const GameStateProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('popcornclash_user');
      return saved ? JSON.parse(saved) : defaultUser;
    } catch {
      return defaultUser;
    }
  });

  useEffect(() => {
    localStorage.setItem('popcornclash_user', JSON.stringify(user));
  }, [user]);

  const logout = () => {
    setUser(defaultUser);
  };

  return (
    <GameStateContext.Provider value={{ user, setUser, logout }}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGame = () => useContext(GameStateContext);
