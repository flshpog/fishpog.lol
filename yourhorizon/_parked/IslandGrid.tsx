"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/lib/db/database";
import { useDesignerStore } from "../store/designerStore";

// ACNH island: simplified 7x6 acre grid at 4 cells per acre = 28x24
const GRID_WIDTH = 28;
const GRID_HEIGHT = 24;
const CELL_SIZE = 20;

type CellType = "grass" | "water" | "sand" | "rock" | "path" | "building" | "bridge" | "incline" | "tree" | "flower" | "plaza";

const CELL_COLORS: Record<CellType, string> = {
  grass: "#5cb85c",
  water: "#4a90d9",
  sand: "#e8c97a",
  rock: "#8a8a8a",
  path: "#c4956a",
  building: "#d9534f",
  bridge: "#a67bc5",
  incline: "#e8943a",
  tree: "#2d7a2d",
  flower: "#e882a8",
  plaza: "#c9a66b",
};

const TOOLS: { id: CellType | "eraser"; label: string; color: string }[] = [
  { id: "grass", label: "Grass", color: CELL_COLORS.grass },
  { id: "water", label: "Water", color: CELL_COLORS.water },
  { id: "sand", label: "Sand", color: CELL_COLORS.sand },
  { id: "rock", label: "Rock", color: CELL_COLORS.rock },
  { id: "path", label: "Path", color: CELL_COLORS.path },
  { id: "building", label: "Building", color: CELL_COLORS.building },
  { id: "bridge", label: "Bridge", color: CELL_COLORS.bridge },
  { id: "incline", label: "Incline", color: CELL_COLORS.incline },
  { id: "tree", label: "Tree", color: CELL_COLORS.tree },
  { id: "flower", label: "Flower", color: CELL_COLORS.flower },
  { id: "plaza", label: "Plaza", color: CELL_COLORS.plaza },
  { id: "eraser", label: "Eraser", color: "#6b7280" },
];

const BRUSH_SIZES = [1, 2, 3] as const;

type GridData = (CellType | null)[][];

function createDefaultIsland(): GridData {
  const grid: GridData = Array.from({ length: GRID_HEIGHT }, () =>
    Array.from({ length: GRID_WIDTH }, () => null)
  );

  for (let r = 0; r < GRID_HEIGHT; r++) {
    for (let c = 0; c < GRID_WIDTH; c++) {
      // Ocean border (top 2, bottom 2, left 1, right 1 rows/cols)
      if (r < 2 || r >= GRID_HEIGHT - 2 || c < 1 || c >= GRID_WIDTH - 1) {
        grid[r][c] = "water";
        continue;
      }
      // Beach ring (1 cell inside the ocean)
      if (r === 2 || r === GRID_HEIGHT - 3 || c === 1 || c === GRID_WIDTH - 2) {
        grid[r][c] = "sand";
        continue;
      }
      // River (vertical center)
      if (c >= 13 && c <= 14 && r >= 3 && r <= GRID_HEIGHT - 4) {
        grid[r][c] = "water";
        continue;
      }
      // River mouth to ocean
      if (c >= 13 && c <= 14 && r >= GRID_HEIGHT - 4) {
        grid[r][c] = "water";
        continue;
      }
      // Resident Services plaza
      if (r >= 10 && r <= 12 && c >= 11 && c <= 16) {
        grid[r][c] = "plaza";
        continue;
      }
      // Everything else is grass
      grid[r][c] = "grass";
    }
  }
  return grid;
}

function createEmptyGrid(): GridData {
  return Array.from({ length: GRID_HEIGHT }, () =>
    Array.from({ length: GRID_WIDTH }, () => null)
  );
}

function cloneGrid(grid: GridData): GridData {
  return grid.map((r) => [...r]);
}

const MAX_UNDO = 30;

export function IslandGrid() {
  const [grid, setGrid] = useState<GridData>(createDefaultIsland);
  const [selectedTool, setSelectedTool] = useState<CellType | "eraser">("grass");
  const [brushSize, setBrushSize] = useState<1 | 2 | 3>(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [undoStack, setUndoStack] = useState<GridData[]>([]);
  const [savedDesigns, setSavedDesigns] = useState<{ id: string; name: string }[]>([]);
  const [designName, setDesignName] = useState("My Island");
  const { gridVisible, toggleGrid } = useDesignerStore();
  const lastPaintRef = useRef<string | null>(null);

  // Load saved designs list on mount
  useEffect(() => {
    db.userIslandDesigns.toArray().then((designs) => {
      setSavedDesigns(designs.map((d) => ({ id: d.id, name: d.name })));
    });
  }, []);

  const pushUndo = useCallback((currentGrid: GridData) => {
    setUndoStack((prev) => [...prev.slice(-(MAX_UNDO - 1)), cloneGrid(currentGrid)]);
  }, []);

  const undo = useCallback(() => {
    setUndoStack((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const restored = next.pop()!;
      setGrid(restored);
      return next;
    });
  }, []);

  const paint = useCallback((row: number, col: number) => {
    const key = `${row},${col}`;
    if (lastPaintRef.current === key) return;
    lastPaintRef.current = key;

    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      const value = selectedTool === "eraser" ? null : selectedTool;
      const half = Math.floor(brushSize / 2);
      for (let dr = -half; dr < brushSize - half; dr++) {
        for (let dc = -half; dc < brushSize - half; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < GRID_HEIGHT && nc >= 0 && nc < GRID_WIDTH) {
            next[nr][nc] = value;
          }
        }
      }
      return next;
    });
  }, [selectedTool, brushSize]);

  const handleMouseDown = (row: number, col: number) => {
    pushUndo(grid);
    lastPaintRef.current = null;
    setIsDrawing(true);
    paint(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isDrawing) paint(row, col);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    lastPaintRef.current = null;
  };

  const handleSave = async () => {
    const id = `design-${Date.now()}`;
    await db.userIslandDesigns.put({
      id,
      name: designName,
      grid: grid,
      updatedAt: Date.now(),
    });
    setSavedDesigns((prev) => [...prev, { id, name: designName }]);
  };

  const handleLoad = async (id: string) => {
    const design = await db.userIslandDesigns.get(id);
    if (design?.grid) {
      pushUndo(grid);
      setGrid(design.grid as GridData);
      setDesignName(design.name);
    }
  };

  const handleDelete = async (id: string) => {
    await db.userIslandDesigns.delete(id);
    setSavedDesigns((prev) => prev.filter((d) => d.id !== id));
  };

  // Cell counts
  const cellCounts: Record<string, number> = {};
  for (const row of grid) {
    for (const cell of row) {
      if (cell) cellCounts[cell] = (cellCounts[cell] ?? 0) + 1;
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <Card>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {TOOLS.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedTool === tool.id
                  ? "bg-primary-500 text-white"
                  : "bg-bg-hover text-text hover:bg-bg-input"
              }`}
            >
              <span
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: tool.color }}
              />
              {tool.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-muted">Brush:</span>
            {BRUSH_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => setBrushSize(size)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                  brushSize === size
                    ? "bg-primary-500 text-white"
                    : "bg-bg-hover text-text hover:bg-bg-input"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="w-px h-5 bg-border" />
          <button
            onClick={toggleGrid}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-bg-hover text-text hover:bg-bg-input transition-colors"
          >
            {gridVisible ? "Hide Grid" : "Show Grid"}
          </button>
          <button
            onClick={undo}
            disabled={undoStack.length === 0}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-bg-hover text-text hover:bg-bg-input transition-colors disabled:opacity-30"
          >
            Undo
          </button>
          <button
            onClick={() => { pushUndo(grid); setGrid(createDefaultIsland()); }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-bg-hover text-text hover:bg-bg-input transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => { pushUndo(grid); setGrid(createEmptyGrid()); }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
          >
            Clear
          </button>
        </div>
      </Card>

      {/* Grid Canvas */}
      <div className="overflow-auto rounded-xl border border-border bg-bg-card">
        <div
          className="inline-block select-none"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: "crosshair" }}
        >
          {grid.map((row, ri) => (
            <div key={ri} className="flex">
              {row.map((cell, ci) => (
                <div
                  key={ci}
                  onMouseDown={() => handleMouseDown(ri, ci)}
                  onMouseEnter={() => handleMouseEnter(ri, ci)}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: cell ? CELL_COLORS[cell] : "#1a2e1a",
                    borderRight: gridVisible ? "1px solid rgba(255,255,255,0.05)" : "none",
                    borderBottom: gridVisible ? "1px solid rgba(255,255,255,0.05)" : "none",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Save/Load */}
      <Card>
        <h3 className="text-sm font-semibold text-text mb-2">Save & Load</h3>
        <div className="flex gap-2 mb-3">
          <input
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            placeholder="Design name"
            className="flex-1 px-2 py-1.5 rounded-lg bg-bg-hover border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Save
          </button>
        </div>
        {savedDesigns.length > 0 && (
          <div className="space-y-1.5">
            {savedDesigns.map((d) => (
              <div key={d.id} className="flex items-center justify-between bg-bg-hover rounded-lg px-3 py-2">
                <span className="text-sm text-text">{d.name}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleLoad(d.id)}
                    className="text-xs text-primary-500 hover:underline"
                  >
                    Load
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Stats */}
      {Object.keys(cellCounts).length > 0 && (
        <Card>
          <h3 className="text-sm font-semibold text-text mb-2">Layout Summary</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(cellCounts).map(([type, count]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: CELL_COLORS[type as CellType] }}
                />
                <span className="text-xs text-text capitalize">{type}</span>
                <span className="text-xs text-text-muted">({count})</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
