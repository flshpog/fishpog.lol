"use client";

const BASE_PATH = "/yourhorizon";

/**
 * Returns a path with the basePath prefix for asset references.
 */
export function useBasePath() {
  return {
    basePath: BASE_PATH,
    assetPath: (path: string) => `${BASE_PATH}${path}`,
  };
}
