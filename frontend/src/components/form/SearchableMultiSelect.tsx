import type React from "react";
import { useState, useEffect, useRef } from "react";

interface Option {
  value: string;
  text: string;
}

interface SearchableMultiSelectProps {
  label: string;
  options: Option[];
  value?: string[];
  onChange?: (selected: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  label,
  options,
  value = [],
  onChange,
  disabled = false,
  placeholder = "Select options",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const filteredOptions = options.filter(option => 
    option.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
      if (!isOpen) {
          setSearchTerm("");
      }
    }
  };

  const handleSelect = (optionValue: string) => {
    const newSelected = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange?.(newSelected);
  };

  const removeOption = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(value.filter((v) => v !== optionValue));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-col items-center relative">
        <div className="w-full" onClick={toggleDropdown}>
          <div
            className={`mb-2 flex rounded-lg border border-gray-300 bg-transparent py-1.5 pl-3 pr-3 outline-hidden transition-colors dark:border-gray-700 dark:bg-gray-900 ${
              disabled
                ? "cursor-not-allowed bg-gray-100 dark:bg-gray-800"
                : "cursor-pointer focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500"
            }`}
          >
            <div className="flex flex-auto flex-wrap gap-2">
              {value.length > 0 ? (
                value.map((val) => {
                  const option = options.find((o) => o.value === val);
                  if (!option) return null;
                  return (
                    <div
                      key={val}
                      className="flex items-center justify-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      <div className="max-w-full flex-initial text-xs font-normal leading-none">
                        {option.text}
                      </div>
                      <div className="flex flex-auto flex-row-reverse">
                        <button
                          type="button"
                          onClick={(e) => removeOption(val, e)}
                          disabled={disabled}
                          className="pl-2 outline-hidden hover:text-red-500 focus:outline-hidden disabled:cursor-not-allowed"
                        >
                          <svg
                            className="fill-current"
                            role="button"
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.40717 4.46881C3.11428 4.17591 3.11428 3.70104 3.40717 3.40815C3.70006 3.11525 4.17494 3.11525 4.46783 3.40815L6.99943 5.93975L9.53095 3.40822C9.82385 3.11533 10.2987 3.11533 10.5916 3.40822C10.8845 3.70112 10.8845 4.17599 10.5916 4.46888L8.06009 7.00041L10.5916 9.53193C10.8845 9.82482 10.8845 10.2997 10.5916 10.5926C10.2987 10.8855 9.82385 10.8855 9.53095 10.5926L6.99943 8.06107L4.46783 10.5927C4.17494 10.8856 3.70006 10.8856 3.40717 10.5927C3.11428 10.2998 3.11428 9.8249 3.40717 9.53201L5.93877 7.00041L3.40717 4.46881Z"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full h-full p-1 pr-2 text-sm text-gray-400 dark:text-gray-500 pointer-events-none">
                  {placeholder}
                </div>
              )}
            </div>
            <div className="flex items-center self-start py-1 pl-1 pr-1 w-7">
              <button
                type="button"
                disabled={disabled}
                className="w-5 h-5 text-gray-700 outline-hidden cursor-pointer focus:outline-hidden dark:text-gray-400 disabled:cursor-not-allowed"
              >
                <svg
                  className={`stroke-current transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.79175 7.39551L10.0001 12.6038L15.2084 7.39551"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div
            className="absolute left-0 z-40 w-full bg-white rounded-lg shadow-sm top-full dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-2 border-b border-gray-200 dark:border-gray-800">
                <input 
                    type="text" 
                    className="w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-brand-500/20 dark:border-gray-700 dark:text-white/90"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>
            <div className="overflow-y-auto max-h-[200px]">
                {filteredOptions.length > 0 ? filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);

                return (
                    <div
                    key={option.value}
                    className={`hover:bg-primary/5 w-full cursor-pointer border-b border-gray-100 dark:border-gray-800 last:border-0 ${isSelected ? "bg-primary/10" : ""}`}
                    onClick={() => handleSelect(option.value)}
                    >
                    <div className="relative flex w-full items-center p-2 pl-3">
                        <div className="mr-3 flex h-4 w-4 items-center justify-center rounded border border-gray-300 dark:border-gray-600">
                            {isSelected && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1.66663 5.41668L3.74996 7.5L8.33329 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            )}
                        </div>
                        <div className="leading-6 text-sm text-gray-800 dark:text-white/90">
                        {option.text}
                        </div>
                    </div>
                    </div>
                );
                }) : (
                    <div className="p-4 text-center text-sm text-gray-500">No options found</div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchableMultiSelect;
