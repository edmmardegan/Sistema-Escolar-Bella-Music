// Local: src/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = () => {
      const savedUser = localStorage.getItem("@App:user");
      const token = localStorage.getItem("@App:token");
      //const savedUser = localStorage.getItem("user");
      //const token = localStorage.getItem("token");

      // Verificação rigorosa para não carregar "null" ou "undefined" como string
      if (savedUser && token && token !== "undefined" && token !== "null") {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error("Erro ao ler dados do localStorage", e);
          localStorage.clear();
        }
      } else {
        // Se algo estiver corrompido, limpa para evitar erros de login
        localStorage.clear();
      }
      setLoading(false);
    };
    carregarDados();
  }, []);

  const login = (userData, token) => {
    // Garante que o ID e o role existam antes de salvar
    if (!userData || !token) {
      console.error("Dados de login inválidos!");
      return;
    }

    //localStorage.setItem("user", JSON.stringify(userData));
    //localStorage.setItem("token", token);
    localStorage.setItem("@App:user", JSON.stringify(userData));
    localStorage.setItem("@App:token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("@App:user");
    localStorage.removeItem("@App:token");

    //localStorage.removeItem("user");
    //localStorage.removeItem("token");
    // Se quiser limpar tudo (cuidado se usar outros dados): localStorage.clear();
    setUser(null);
  };

  return <AuthContext.Provider value={{ authenticated: !!user, user, loading, login, logout }}>{children}</AuthContext.Provider>;
}
