'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import Cookies from 'js-cookie';
import { setUser } from '../store/slices/authSlice';

export const useAuthPersistence = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // On app mount, restore auth from storage
    const restoreAuth = () => {
      const token = Cookies.get('auth_token') || localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          dispatch(setUser({ user, token }));
        } catch (error) {
          // Clear invalid data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          Cookies.remove('auth_token');
        }
      }
    };

    restoreAuth();
  }, [dispatch]);
};