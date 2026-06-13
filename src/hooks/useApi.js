import { useEffect, useState } from 'react';
import { getMockData } from '../services/mockData';

export function useApi(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const result = await getMockData(endpoint);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [endpoint]);

  return { data, loading, error };
}
