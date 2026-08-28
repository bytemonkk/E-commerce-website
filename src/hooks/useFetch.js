import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Generic async-fetch hook. Centralizes the loading/error/data pattern
 * that was previously copy-pasted across every page — this consolidation
 * is a big part of the componentization/hooks work that cut UI bugs.
 *
 * @param {Function} fetchFn - async function returning the API payload
 * @param {Array} deps - dependency array; re-fetches when these change
 */
export const useFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      if (isMounted.current) setData(result);
    } catch (err) {
      if (isMounted.current) setError(err.message || "Failed to fetch data.");
    } finally {
      if (isMounted.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    isMounted.current = true;
    refetch();
    return () => {
      isMounted.current = false;
    };
  }, [refetch]);

  return { data, loading, error, refetch, setData };
};
