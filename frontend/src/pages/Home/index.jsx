import React from "react";

export default function Home() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '80vh', 
      flexDirection: 'column', 
      color: '#bdc3c7' 
    }}>
      {/* Quando tiver a imagem da logo, use: <img src={logoImg} alt="Logo" style={{ width: '300px' }} /> */}
      <h1 style={{ fontSize: '3rem', margin: 0 }}>SUA LOGO</h1>
      <p style={{ fontSize: '1.2rem' }}>Bem-vindo ao Sistema Escolar</p>
      <small>Selecione uma opção no menu lateral para começar.</small>
    </div>
  );
}