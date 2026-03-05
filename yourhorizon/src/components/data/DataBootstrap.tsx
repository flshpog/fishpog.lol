"use client";

import { useEffect, useRef } from "react";
import { useDataStore } from "@/store/dataStore";
import { loadCategories } from "@/lib/data/dataLoader";
import { buildSearchIndex, addToSearchIndex } from "@/lib/search/searchEngine";
import {
  getCriticalSources,
  getDeferredSources,
  getTotalCategories,
} from "@/lib/data/dataCatalog";
import type { DataCategory } from "@/types/common";
import { DataStatus } from "./DataStatus";

interface DataBootstrapProps {
  children: React.ReactNode;
}

export function DataBootstrap({ children }: DataBootstrapProps) {
  const {
    isFullyReady,
    error,
    loadingProgress,
    currentCategory,
    setCategoryLoaded,
    setSearchIndexReady,
    setFullyReady,
    setLoadingProgress,
    setCurrentCategory,
    setError,
  } = useDataStore();

  const bootstrapStarted = useRef(false);

  useEffect(() => {
    if (bootstrapStarted.current) return;
    bootstrapStarted.current = true;

    async function bootstrap() {
      try {
        const total = getTotalCategories();
        let loaded = 0;

        // Phase 1: Load critical data
        const criticalSources = getCriticalSources();
        const criticalData = await loadCategories(
          criticalSources,
          (count, _total, category) => {
            loaded = count;
            setLoadingProgress(loaded / total);
            setCurrentCategory(category);
            setCategoryLoaded(category as DataCategory);
          }
        );

        // Build search index from critical data
        buildSearchIndex(criticalData, criticalSources);
        setSearchIndexReady(true);

        // App is interactive now
        setFullyReady(true);
        setCurrentCategory(null);

        // Phase 2: Load deferred data in background
        const deferredSources = getDeferredSources();
        for (const source of deferredSources) {
          try {
            const records = await loadCategories([source], (_c, _t, category) => {
              loaded++;
              setLoadingProgress(loaded / total);
              setCategoryLoaded(category as DataCategory);
            });
            const sourceRecords = records.get(source.id);
            if (sourceRecords) {
              addToSearchIndex(sourceRecords, source);
            }
          } catch (err) {
            console.error(`Deferred load failed for ${source.id}:`, err);
          }
        }

        setLoadingProgress(1);
      } catch (err) {
        // In development without data files, proceed gracefully
        console.warn("Data bootstrap encountered issues:", err);
        setFullyReady(true);
        setLoadingProgress(1);
      }
    }

    bootstrap();
  }, [
    setCategoryLoaded,
    setSearchIndexReady,
    setFullyReady,
    setLoadingProgress,
    setCurrentCategory,
    setError,
  ]);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-bg">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-lg font-semibold text-text mb-2">
            Something went wrong
          </h2>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  if (!isFullyReady) {
    return <DataStatus progress={loadingProgress} category={currentCategory} />;
  }

  return <>{children}</>;
}
