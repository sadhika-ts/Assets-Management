import React, { useState, useRef, useEffect } from 'react';

/**
 * Searchable vendor dropdown.
 * Props:
 *   vendors       — array of { name, contact, email, address, contact_person }
 *   value         — current vendor_name string
 *   onChange      — (vendorName: string) => void  — called on every keystroke
 *   onSelect      — (vendor: object) => void       — called when user picks from list
 *   error         — boolean
 *   placeholder   — string
 */
export const VendorDropdown = ({ vendors, value, onChange, onSelect, error, placeholder }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = value?.trim()
    ? vendors.filter(v => v.name.toLowerCase().includes(value.toLowerCase()))
    : vendors;

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || 'Select or type vendor name…'}
          autoComplete="off"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8
            ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs">▾</span>
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-56 overflow-y-auto">
          {filtered.map((v, i) => (
            <button
              key={i}
              type="button"
              onMouseDown={() => { onSelect(v); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex flex-col border-b border-gray-100 last:border-0 transition-colors"
            >
              <span className="font-medium text-gray-800 text-sm">{v.name}</span>
              <span className="text-xs text-gray-400 mt-0.5">
                {[v.email, v.contact].filter(Boolean).join(' · ')}
              </span>
            </button>
          ))}
        </div>
      )}

      {open && filtered.length === 0 && value?.trim() && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl px-4 py-3 text-sm text-gray-400">
          No existing vendor found — a new vendor will be created
        </div>
      )}
    </div>
  );
};
