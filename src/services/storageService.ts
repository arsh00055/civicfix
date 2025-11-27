class StorageService {
  private static instance: StorageService;

  // Storage keys
  private readonly KEYS = {
    AUTH_TOKEN: 'auth_token',
    USER_ROLE: 'user_role',
    USER_DATA: 'user_data',
    SESSION_EXPIRY: 'session_expiry',
    THEME_PREFERENCE: 'theme_preference',
    LANGUAGE: 'language',
    REDIRECT_URL: 'redirect_url'
  } as const;

  private constructor() {}

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Generic storage methods
  setItem(key: string, value: any, options?: { expiresIn?: number }): void {
    try {
      const storageItem = {
        value,
        timestamp: Date.now(),
        expiresAt: options?.expiresIn ? Date.now() + options.expiresIn : null
      };
      const serializedValue = JSON.stringify(storageItem);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
      throw new Error(`Storage failed for key: ${key}`);
    }
  }

  getItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue || null;

      const storageItem = JSON.parse(item);
      
      // Check if item has expired
      if (storageItem.expiresAt && Date.now() > storageItem.expiresAt) {
        this.removeItem(key);
        return defaultValue || null;
      }

      return storageItem.value;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue || null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }

  clear(): void {
    try {
      // Preserve some preferences during clear
      const theme = this.getThemePreference();
      const language = this.getLanguage();
      
      localStorage.clear();
      
      // Restore preferences
      if (theme) this.setThemePreference(theme);
      if (language) this.setLanguage(language);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  clearAll(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing all localStorage:', error);
    }
  }

  // Auth specific methods
  setAuthToken(token: string, expiresIn?: number): void {
    this.setItem(this.KEYS.AUTH_TOKEN, token, expiresIn ? { expiresIn } : undefined);
    if (expiresIn) {
      this.setItem(this.KEYS.SESSION_EXPIRY, Date.now() + expiresIn);
    }
  }

  getAuthToken(): string | null {
    return this.getItem(this.KEYS.AUTH_TOKEN);
  }

  removeAuthToken(): void {
    this.removeItem(this.KEYS.AUTH_TOKEN);
    this.removeItem(this.KEYS.SESSION_EXPIRY);
  }

  setUserRole(role: string): void {
    this.setItem(this.KEYS.USER_ROLE, role);
  }

  getUserRole(): string | null {
    return this.getItem(this.KEYS.USER_ROLE);
  }

  removeUserRole(): void {
    this.removeItem(this.KEYS.USER_ROLE);
  }

  setUserData(userData: any): void {
    this.setItem(this.KEYS.USER_DATA, userData);
  }

  getUserData<T = any>(): T | null {
    return this.getItem<T>(this.KEYS.USER_DATA);
  }

  removeUserData(): void {
    this.removeItem(this.KEYS.USER_DATA);
  }

  // Session management
  isSessionExpired(): boolean {
    const expiry = this.getItem<number>(this.KEYS.SESSION_EXPIRY);
    return expiry ? Date.now() > expiry : false;
  }

  getSessionTimeRemaining(): number {
    const expiry = this.getItem<number>(this.KEYS.SESSION_EXPIRY);
    return expiry ? Math.max(0, expiry - Date.now()) : 0;
  }

  // Clear all auth-related data
  clearAuth(): void {
    this.removeAuthToken();
    this.removeUserRole();
    this.removeUserData();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    const role = this.getUserRole();
    return !!(token && role && !this.isSessionExpired());
  }

  // User preferences
  setThemePreference(theme: string): void {
    this.setItem(this.KEYS.THEME_PREFERENCE, theme);
  }

  getThemePreference(): string | null {
    return this.getItem(this.KEYS.THEME_PREFERENCE);
  }

  setLanguage(language: string): void {
    this.setItem(this.KEYS.LANGUAGE, language);
  }

  getLanguage(): string | null {
    return this.getItem(this.KEYS.LANGUAGE);
  }

  // Navigation
  setRedirectUrl(url: string): void {
    this.setItem(this.KEYS.REDIRECT_URL, url, { expiresIn: 15 * 60 * 1000 }); // 15 minutes
  }

  getRedirectUrl(): string | null {
    return this.getItem(this.KEYS.REDIRECT_URL);
  }

  removeRedirectUrl(): void {
    this.removeItem(this.KEYS.REDIRECT_URL);
  }

  // Utility methods
  getAllKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  }

  getStorageSize(): string {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return (total / 1024).toFixed(2) + ' KB';
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return '0 KB';
    }
  }

  // Migration helper (useful for version updates)
  migrateKey(oldKey: string, newKey: string): boolean {
    try {
      const value = localStorage.getItem(oldKey);
      if (value) {
        this.setItem(newKey, JSON.parse(value));
        this.removeItem(oldKey);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error migrating key ${oldKey} to ${newKey}:`, error);
      return false;
    }
  }
}

export default StorageService.getInstance();