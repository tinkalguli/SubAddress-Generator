import { useCallback, useEffect, useState } from 'react';
import type { SessionState } from '../../types';
import {
  getSessionFromBackground,
  setSessionOnBackground,
} from '../../utils/messaging';

export function useBackgroundSession(): {
  session: SessionState | null;
  loading: boolean;
  updateSession: (partial: Partial<SessionState>) => void;
  refresh: () => Promise<void>;
} {
  const [session, setSession] = useState<SessionState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const s = await getSessionFromBackground();
    setSession(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateSession = useCallback((partial: Partial<SessionState>) => {
    setSessionOnBackground(partial).then(setSession);
  }, []);

  return { session, loading, updateSession, refresh };
}
