// Local: /src/components/InputMoeda.jsx
import React, { useState, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export default function InputMoeda({ 
  label, 
  name, 
  value, 
  onChange, 
  required, 
  className = "", 
  disabled 
}) {
  const [displayValue, setDisplayValue] = useState("");

  // Sincroniza o valor visual quando o valor real (numérico) muda
  useEffect(() => {
    if (value !== undefined && value !== null && value !== "") {
      setDisplayValue(formatarParaMoeda(value));
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const formatarParaMoeda = (valor) => {
    const numeric = typeof valor === "number" ? valor : Number(valor) || 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numeric);
  };

  const handleInputChange = (e) => {
    const rawValue = e.target.value;
    const onlyNumbers = rawValue.replace(/\D/g, "");
    const numericValue = Number(onlyNumbers) / 100;

    // Simula um evento nativo para que o seu handleChange (e.target.name/value) funcione
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: numericValue,
          type: "text"
        }
      });
    }
  };

  return (
    <div className="text-sm font-semibold text-gray-600 flex flex-col gap-2">
      {label && <label>{label}</label>}
      
      <input
        type="text"
        name={name}
        value={displayValue}
        onChange={handleInputChange}
        required={required}
        disabled={disabled}
        placeholder="R$ 0,00"
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
          )
        )}
      />
    </div>
  );
}