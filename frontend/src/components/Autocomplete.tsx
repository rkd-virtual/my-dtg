import React, { useEffect, useRef, useState } from "react";

type Props = {
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  /**
   * Base URL for site suggestions. Default points to the render backend you provided.
   * It will call `${baseUrl}?q=<term>`.
   */
  suggestionsBaseUrl?: string;
  minChars?: number;
};

export default function Autocomplete({
  name,
  value,
  onChange,
  placeholder = "",
  disabled = false,
  required = false,
  suggestionsBaseUrl = "https://dtg-backend.onrender.com/sites",
  minChars = 1,
}: Props) {
  const [query, setQuery] = useState(value || "");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const controllerRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<number | null>(null);

  // Keep controlled value in sync if parent changes it
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    // close on outside click
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const fetchSuggestions = async (q: string) => {
    if (!q || q.length < minChars) {
      setItems([]);
      setOpen(false);
      return;
    }

    if (controllerRef.current) {
      controllerRef.current.abort();
    }
    const ctl = new AbortController();
    controllerRef.current = ctl;

    setLoading(true);
    setItems([]);
    setActiveIndex(-1);

    try {
      const url = `${suggestionsBaseUrl}?q=${encodeURIComponent(q)}`;
      const res = await fetch(url, { signal: ctl.signal });
      if (!res.ok) {
        // tolerate non-200 by showing no items
        setItems([]);
        setOpen(false);
        setLoading(false);
        return;
      }
      const data = await res.json();
      // Expect an array of strings from the API (adjust if API returns objects)
      const suggestions: string[] = Array.isArray(data) ? data : [];
      setItems(suggestions);
      setOpen(suggestions.length > 0);
    } catch (err) {
      if ((err as any).name === "AbortError") {
        // aborted - ignore
      } else {
        // network or parse error - fail silently
        console.error("Autocomplete fetch error:", err);
      }
      setItems([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Debounced query watcher
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      fetchSuggestions(query.trim());
    }, 300); // 300ms debounce
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const setValueFromSelect = (val: string) => {
    // Notify parent either via synthetic change or direct string
    onChange(
      typeof onChange === "function"
        ? // create a fake event to match FormInput handlers
          ({ target: { name: name || "amazon_site", value: val } } as unknown as React.ChangeEvent<HTMLInputElement>)
        : val
    );
    setQuery(val);
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) {
      if (e.key === "ArrowDown" && items.length > 0) {
        setOpen(true);
        setActiveIndex(0);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < items.length) {
        setValueFromSelect(items[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        name={name}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          // if parent expects a change event immediately, you can call onChange here too.
          // But typically we only call parent when the user selects an item.
        }}
        onKeyDown={onKeyDown}
        onFocus={() => { if (items.length) setOpen(true); }}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 ${
          disabled ? "bg-gray-50 cursor-not-allowed" : "bg-white"
        }`}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-haspopup="listbox"
        role="combobox"
      />

      {/* loading spinner (small) */}
      {loading && (
        <div className="absolute right-2 top-2">
          <svg className="animate-spin h-4 w-4 text-gray-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
          </svg>
        </div>
      )}

      {/* suggestions dropdown */}
      {open && items.length > 0 && (
        <ul
          role="listbox"
          aria-label="Suggestions"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border bg-white shadow-lg"
        >
          {items.map((it, idx) => {
            const active = idx === activeIndex;
            return (
              <li
                key={it + idx}
                role="option"
                aria-selected={active}
                onMouseDown={(ev) => {
                  // onMouseDown so input doesn't lose focus before click resolves
                  ev.preventDefault();
                  setValueFromSelect(it);
                }}
                className={`cursor-pointer px-3 py-2 text-sm ${active ? "bg-amber-100" : "hover:bg-gray-50"}`}
              >
                {it}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
