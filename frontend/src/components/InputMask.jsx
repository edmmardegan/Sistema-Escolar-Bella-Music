import React from 'react';

const InputMask = ({ label, mask, value, onChange, name, placeholder }) => {
  
  // Função que aplica a máscara dinamicamente
  const aplicarMascara = (valor) => {
    if (!valor) return "";
    let v = valor.replace(/\D/g, ""); // Remove tudo que não é número
    
    if (mask === "(99) 99999-9999") {
      v = v.substring(0, 11);
      v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
      v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    }
    // Adicione outras máscaras aqui se precisar (CPF, etc)
    
    return v;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Aplicamos a máscara antes de mandar para o estado do componente pai
    const valorMascarado = aplicarMascara(value);
    
    // Simulamos o evento do target para o handleChange original funcionar
    onChange({
      target: {
        name,
        value: valorMascarado
      }
    });
  };

  return (
    <div className="input-group">
      {label && <label>{label}</label>}
      <input
        type="text"
        name={name}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        className="input-field"
      />
    </div>
  );
};

export default InputMask;