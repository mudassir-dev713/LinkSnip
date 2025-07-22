'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const UrlContext = createContext();

export const UrlProvider = ({ children }) => {
  const [urls, setUrls] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const storedUrls = localStorage.getItem('urls');

    if (storedUrls && storedUrls !== 'undefined') {
      try {
        const parsed = JSON.parse(storedUrls);
        setUrls(parsed);
      } catch (error) {
        console.error('Error parsing stored URLs from localStorage:', error);
        localStorage.removeItem('urls'); // remove corrupted data
        fetchUrlsFromAPI(); // fallback to API
      }
    } else {
      fetchUrlsFromAPI();
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (urls?.length > 0) {
      localStorage.setItem('urls', JSON.stringify(urls));
    }
  }, [urls]);

  // Fetch URLs from API
  const fetchUrlsFromAPI = async () => {
    try {
      const res = await fetch('/api/get-urls');
      const data = await res.json();
      setUrls(data?.urls);
      localStorage.setItem('urls', JSON.stringify(data.urls)); // also update localStorage
    } catch (err) {
      console.error('Failed to fetch URLs:', err);
    }
  };

  // Call this whenever a new URL is added
  const addNewUrl = (newUrl) => {
    const updatedUrls = [newUrl, ...urls];
    setUrls(updatedUrls);
    localStorage.setItem('urls', JSON.stringify(updatedUrls));
  };

  return (
    <UrlContext.Provider value={{ urls, setUrls, addNewUrl, fetchUrlsFromAPI }}>
      {children}
    </UrlContext.Provider>
  );
};

export const useUrls = () => useContext(UrlContext);
