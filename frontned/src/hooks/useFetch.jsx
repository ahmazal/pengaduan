import { useState, useEffect } from "react";
import apiClient from "../api/apiClient";

export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // mengambil data list masyarakat
  useEffect(() => {
    let stop = false;
    setLoading(true);
    apiClient(url, options)
      .then((res) => {
        let result = res.data;
        if (Array.isArray(result) && result[0]?.payload !== undefined) {
          result = result[0].payload;
        }
        if (!stop) setData(result);
      })
      .catch((err) => {
        if (!stop) setError(err.response?.data || err.message);
      })
      .finally(() => {
        if (!stop) setLoading(false);
      });
    return () => (stop = true);
  }, [url]);
  return { data, loading, error };
}
