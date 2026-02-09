import React from "react";
import "./styles.css"
export default function Home() {
  return (
    <div className="pagina-principal">
      {/* Quando tiver a imagem da logo, use: <img src={logoImg} alt="Logo" style={{ width: '300px' }} /> */}
      <img className="logo" src="/src/assets/logo.jpg" alt="Logo"/>
      <h1 className="nome-escola">Bem-vindo a Bella Music</h1>
    </div>
  );
}
