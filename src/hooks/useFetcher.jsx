import { useEffect, useState } from 'react';
import { API_URL } from '../utils/constants'; // Adjust the import path as necessary
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}${url}`, {  ...options });
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        const result = await res.json();
        setData(result);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
};

export default useFetch;
