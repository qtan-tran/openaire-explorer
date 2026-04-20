import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import clsx from "clsx";

interface SearchBarProps {
  defaultValue?: string;
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchBar({
  defaultValue = "",
  onSearch,
  placeholder = "Search publications, datasets, organizations, projects...",
  className,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  // Always call latest onSearch without restarting the debounce timer
  const onSearchRef = useRef(onSearch);
  useLayoutEffect(() => {
    onSearchRef.current = onSearch;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchRef.current(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={clsx("relative w-full", className)}>
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted pointer-events-none"
        aria-hidden
      />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search OpenAIRE"
        className={clsx(
          "w-full rounded-2xl border border-border bg-background",
          "pl-12 pr-10 py-4 text-lg text-foreground",
          "placeholder:text-text-muted",
          "focus:outline-none focus:ring-2 focus:ring-accent/60 focus:ring-offset-1 focus:ring-offset-background",
          "transition-shadow duration-150 shadow-sm hover:shadow-md focus:shadow-md"
        )}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setValue("")}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
