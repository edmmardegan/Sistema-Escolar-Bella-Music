//Local: /src/pages/Home/index.jsx

import React from "react";
import logo from "../../assets/logo.jpg";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <img 
        className="w-[540px] max-w-full object-contain mb-8" 
        src={logo} alt="Logo" />
      <h1 
        className="font-playfair text-5xl font-extrabold italic text-slate-800 text-center">
        Bem-vindo a Bella Music
      </h1>
    </div>
  );
}
