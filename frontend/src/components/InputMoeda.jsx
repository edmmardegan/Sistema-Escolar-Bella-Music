import React, { useState, useEffect } from "react";

export default function InputMoeda({ label, value, onChange, required }) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {label && <label style={{ fontWeight: "bold", fontSize: "14px" }}>{label}</label>}
      <input
        type="text"
        className="input-field"
        value={displayValue}
        onChange={handleInputChange}
        required={required}
        placeholder="R$ 0,00"
      />
    </div>
  );
}