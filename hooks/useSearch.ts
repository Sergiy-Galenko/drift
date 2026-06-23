import { useEffect, useState } from 'react';

import { searchAll, type SearchResults } from '@/lib/firebase/search';
import { useUIStore } from '@/stores/uiStore';
import { firebaseErrorMessage } from '@/utils/formatters';
import { logger } from '@/utils/logger';

const emptyResults: SearchResults = {
  drifts: [],
  users: [],
};

export function useSearch(term: string) {
  const [results, setResults] = useState<SearchResults>(emptyResults);
  const [loading, setLoading] = useState(false);
  const pushToast = useUIStore((state) => state.pushToast);

  useEffect(() => {
    const normalized = term.trim();
    if (normalized.length === 0) {
      setResults(emptyResults);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    const timeout = setTimeout(() => {
      searchAll(normalized)
        .then((nextResults) => {
          if (!cancelled) setResults(nextResults);
        })
        .catch((error: unknown) => {
          logger.error('Search failed', { error: String(error) });
          pushToast({ title: 'Search failed', message: firebaseErrorMessage(String(error)), tone: 'danger' });
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [pushToast, term]);

  return { results, loading };
}
