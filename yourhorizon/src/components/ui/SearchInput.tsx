"use client";

import { useMemo, useState } from "react";
import { debounce } from "@/lib/utils/debounce";
import { SEARCH_DEBOUNCE_MS } from "@/lib/utils/constants";

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  onSearch,
  placeholder = "Search...",
  className = "",
}: SearchInputProps) {
  const [value, setValue] = useState("");

  const debouncedSearch = useMemo(
    () => debounce((q: string) => onSearch(q), SEARCH_DEBOUNCE_MS),
    [onSearch]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleClear = () => {
    setValue("");
    onSearch("");
  };

  return (
    <div className={`relative ${className}`}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
      >
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="
          w-full h-9 pl-9 pr-8 rounded-lg
          bg-bg border border-border
          text-sm text-text placeholder:text-text-muted
          focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400
          transition-colors
        "
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M4 4l6 6M10 4l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
}
