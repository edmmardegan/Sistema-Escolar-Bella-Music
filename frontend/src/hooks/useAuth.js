import { useContext } from "react";
// O ponto indica a pasta atual. Como o arquivo está em /hooks, 
// usamos "../" para sair de hooks e entrar na raiz da src
import { AuthContext } from "../AuthContext.jsx"; 

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
