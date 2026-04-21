// Local: /src/components/Input.jsx
import React from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export default function Input({ label, name, value, onChange, placeholder, required, disabled, type = "text", className = "" }) {
  return (
    <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
      {label && <label>{label}</label>}

      <input
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={twMerge(
          clsx(
            // --- ESTILO BASE ---   
            "h-8 px-3 border border-gray-300 rounded-md bg-white",
            "text-gray-800 text-sm outline-none transition-all",
            "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "placeholder:text-gray-400 disabled:bg-gray-100",
            // --- O FOCO ---
            "focus:bg-yellow-50" /* Fundo amarelo suave ao focar */,
            "focus:border-blue-600" /* Borda azul (sua cor primary) */,
            "focus:ring-4 focus:ring-blue-500/10" /* Sombra suave ao redor */,
            // --- placeholder ---
            "placeholder:text-gray-400 disabled:bg-gray-100",
            className,
          ),
        )}
      />
    </div>
  );
}
