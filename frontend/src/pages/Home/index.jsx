import React from "react";
import "./styles.css"
import logo from "../../assets/logo.jpg";

export default function Home() {
  return (
    <div className="pagina-principal">
      <img className="logo" src={logo} alt="Logo"/>
      <h1 className="nome-escola">Bem-vindo a Bella Music</h1>
    </div>
  );
}
