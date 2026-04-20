//Local: /src/components/InputMoeda.jsx

import React, { useState, useEffect } from "react";

export default function InputMoeda({ label, value, onChange, required, className, disabled }) {
  // Estado local para gerenciar o texto que aparece (ex: "R$ 130,00")
  const [displayValue, setDisplayValue] = useState("");

  // Sempre que o valor "real" (vido do banco) mudar, atualizamos a máscara
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setDisplayValue(formatarParaMoeda(value));
    }
  }, [value]);

  const formatarParaMoeda = (valor) => {
    const v = typeof valor === "number" ? valor.toFixed(2) : String(valor);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(v.replace(/\D/g, "") / 100);
  };

  const handleInputChange = (e) => {
    let rawValue = e.target.value;

    // Remove tudo que não é número
    const onlyNumbers = rawValue.replace(/\D/g, "");

    // Converte para número real (centavos)
    const numericValue = Number(onlyNumbers) / 100;

    // Atualiza o que o usuário vê na hora
    setDisplayValue(formatarParaMoeda(numericValue));

    // Envia o número "puro" para o formulário (ex: 130.50)
    if (onChange) {
      onChange(numericValue);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="font-bold text-sm">{label}</label>}
      <input 
        type="text" 
        className={className} 
        value={displayValue} 
        onChange={handleInputChange} 
        required={required} 
        disabled={disabled} 
        placeholder="R$ 0,00" />
    </div>
  );
}
