'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store';
import { useAuthPersistence } from '@/hooks/useAuthPersistence';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>(makeStore());

  return <Provider store={storeRef.current}>{children}</Provider>;
}

// In your root layout, call useAuthPersistence
function AuthPersistor({ children }: { children: React.ReactNode }) {
  useAuthPersistence();
  return <>{children}</>;
}

// Then wrap your app with both
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <AuthPersistor>
        {children}
      </AuthPersistor>
    </StoreProvider>
  );
}