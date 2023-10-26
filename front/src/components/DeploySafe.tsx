"use client";

import { useDeploySafe } from "../hooks/useDeploySafe";

export function DeploySafe() {
  const { safeAddress, deploying, error, deploySafe } = useDeploySafe();

  return (
    <div style={{ margin: 20 }}>
      {!safeAddress && (
        <button disabled={deploying} onClick={deploySafe}>
          Deploy Safe
        </button>
      )}

      {deploying && <div>Deploying Safe...</div>}

      {error && <div>Failed to deploy Safe: {error}</div>}

      {safeAddress && (
        <div>
          Safe Address:{" "}
          <a href={`https://goerli.basescan.org/address/${safeAddress}`}>{safeAddress}</a>
        </div>
      )}
    </div>
  );
}
