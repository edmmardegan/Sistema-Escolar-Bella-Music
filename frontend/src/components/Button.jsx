
/* src/components/Button.jsx */
import React from "react";

const variants = {
  blue: "bg-blue-600 hover:bg-blue-700 text-white",
  green: "bg-green-500 hover:bg-green-600 text-white",
  red: "bg-red-500 hover:bg-red-600 text-white",
  gray: "bg-gray-500 hover:bg-gray-600 text-white",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-600", // Para botões de ícone na tabela
};

export default function Button({ 
  children, 
  icon: Icon, 
  variant = "blue", 
  className = "", 
  ...props 
}) {
  return (
    <button
      className={`
        flex items-center justify-center gap-2 
        py-2 rounded-md font-semibold 
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} 
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}