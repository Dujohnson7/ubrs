import { useState, useEffect, useCallback } from "react";
import { schoolBalanceService, SCHOOL_BALANCE_UPDATED_EVENT } from "../services/schoolBalanceService";

export function useSchoolBalance() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await schoolBalanceService.getSchoolBalance(false);
      setBalance(typeof res?.balance === "number" ? res.balance : 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load balance");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchBalance();

    const handleUpdate = () => {
      void fetchBalance();
    };

    window.addEventListener(SCHOOL_BALANCE_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(SCHOOL_BALANCE_UPDATED_EVENT, handleUpdate);
    };
  }, [fetchBalance]);

  return { balance, loading, error, refetch: fetchBalance };
}
