import { useState } from "react";

export function useDeploySafe() {
  const [safeAddress, setSafeAddress] = useState<string | null>(null);
  const [deploying, setDeploying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function deploySafe() {
    setDeploying(true);
    setError(null);

    try {
      const response = await fetch("/api/safe/new", {
        method: "GET",
      });

      const data = await response.json();

      setSafeAddress(data.safeAddress);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setDeploying(false);
    }
  }

  return {
    safeAddress,
    deploying,
    error,
    deploySafe,
  };
}
