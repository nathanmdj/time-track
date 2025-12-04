"use client";

import { useState, useEffect } from "react";

interface ExchangeRateResponse {
  result: string;
  conversion_rates?: {
    PHP: number;
  };
  rates?: {
    PHP: number;
  };
}

/**
 * Hook to fetch and cache USD to PHP exchange rate
 * Uses exchangerate-api.com free tier (no API key required)
 * Caches the rate for the session to avoid excessive API calls
 */
export function useExchangeRate() {
  const [phpRate, setPhpRate] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have a cached rate from sessionStorage
    const cachedRate = sessionStorage.getItem("usd_php_rate");
    const cachedTime = sessionStorage.getItem("usd_php_rate_time");

    // Use cached rate if it's less than 1 hour old
    if (cachedRate && cachedTime) {
      const hoursSinceCached =
        (Date.now() - parseInt(cachedTime)) / (1000 * 60 * 60);
      if (hoursSinceCached < 1) {
        setPhpRate(parseFloat(cachedRate));
        setIsLoading(false);
        return;
      }
    }

    // Fetch fresh exchange rate
    const fetchExchangeRate = async () => {
      try {
        setIsLoading(true);
        // Using exchangerate-api.com free tier
        const response = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch exchange rate");
        }

        const data: ExchangeRateResponse = await response.json();
        const rate = data.conversion_rates?.PHP || data.rates?.PHP;

        if (rate) {
          setPhpRate(rate);
          // Cache the rate for 1 hour
          sessionStorage.setItem("usd_php_rate", rate.toString());
          sessionStorage.setItem("usd_php_rate_time", Date.now().toString());
          setError(null);
        } else {
          throw new Error("PHP rate not found in response");
        }
      } catch (err) {
        console.error("Error fetching exchange rate:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        // Fallback to approximate rate if API fails
        setPhpRate(56.5); // Approximate USD to PHP rate as fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeRate();
  }, []);

  /**
   * Convert USD amount to PHP
   */
  const convertToPhp = (usdAmount: number): number => {
    if (!phpRate) return usdAmount * 56.5; // Fallback rate
    return usdAmount * phpRate;
  };

  /**
   * Format PHP currency
   */
  const formatPhp = (phpAmount: number): string => {
    return `₱${phpAmount.toFixed(2)}`;
  };

  return {
    phpRate,
    isLoading,
    error,
    convertToPhp,
    formatPhp,
  };
}
