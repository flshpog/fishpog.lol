"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

interface VirtualizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  estimateRowHeight?: number;
  overscan?: number;
  gap?: number;
  className?: string;
  /** Responsive breakpoints: [minWidth, columns][] sorted ascending by minWidth */
  breakpoints?: [number, number][];
}

const DEFAULT_BREAKPOINTS: [number, number][] = [
  [0, 3],      // base: 3 cols
  [640, 4],    // sm: 4 cols
  [768, 5],    // md: 5 cols
  [1024, 6],   // lg: 6 cols
  [1280, 8],   // xl: 8 cols
];

export function VirtualizedGrid<T>({
  items,
  renderItem,
  estimateRowHeight = 120,
  overscan = 5,
  gap = 8,
  className = "",
  breakpoints = DEFAULT_BREAKPOINTS,
}: VirtualizedGridProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState(3);

  const updateColumns = useCallback(() => {
    if (!parentRef.current) return;
    const width = parentRef.current.clientWidth;
    let cols = breakpoints[0][1];
    for (const [minW, c] of breakpoints) {
      if (width >= minW) cols = c;
    }
    setColumns(cols);
  }, [breakpoints]);

  useEffect(() => {
    updateColumns();
    const observer = new ResizeObserver(updateColumns);
    if (parentRef.current) observer.observe(parentRef.current);
    return () => observer.disconnect();
  }, [updateColumns]);

  const rowCount = Math.ceil(items.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateRowHeight,
    overscan,
  });

  return (
    <div ref={parentRef} className={`overflow-auto pr-2 ${className}`} style={{ maxHeight: "70vh" }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columns;
          const rowItems = items.slice(startIndex, startIndex + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gap: `${gap}px`,
                }}
              >
                {rowItems.map((item, colIndex) => (
                  <div key={startIndex + colIndex}>
                    {renderItem(item, startIndex + colIndex)}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
