import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

const Select = forwardRef(({ label, name, value, onChange, options = [], required, disabled, className = "" }, ref) => {
  return (
    <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
      {label && <label>{label}</label>}

      <select
        ref={ref}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={twMerge(
          clsx(
            "h-8 px-3 border border-gray-300 rounded-md bg-white",
            "text-gray-800 text-sm outline-none transition-all cursor-pointer",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            "focus:bg-yellow-50",
            "focus:border-blue-600",
            "focus:ring-4 focus:ring-blue-500/10",
            className,
          ),
        )}
      >
        {options.map((opt, index) => (
          <option key={index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
});

export default Select;