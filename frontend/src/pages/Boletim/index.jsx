// Local: src/Boletim/index.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { FaSave, FaArrowLeft, FaGraduationCap, FaCalendarCheck } from "react-icons/fa";
import "./styles.css";

const Boletim = () => {
  const { termoId } = useParams();
  const navigate = useNavigate();

  // --- ESTADOS PADRONIZADOS ---
  const [carregando, setCarregando] = useState(true);
  const [alunoInfo, setAlunoInfo] = useState({ nome: "", curso: "" });
  const [termos, setTermos] = useState([]);
  const [termoAtivo, setTermoAtivo] = useState(null);

  // --- FUNÇÃO PADRÃO: CARREGAR ---
  const carregarDados = useCallback(async () => {
    try {
      setCarregando(true);
      // Busca detalhes da matrícula através de um ID de termo
      const res = await api.getDetalhesBoletim(termoId);

      setAlunoInfo({
        nome: res.alunoNome || "Estudante",
        curso: res.cursoNome || "Curso não identificado",
      });

      setTermos(res.todosOsTermos || []);

      // Se não houver termoAtivo (primeira carga), define o que veio pela URL
      if (!termoAtivo) {
        const ativo = res.todosOsTermos?.find((t) => t.id === parseInt(termoId));
        if (ativo) setTermoAtivo(ativo);
      } else {
        // Se já houver um ativo (re-carga após salvar), atualiza os dados dele
        const atualizado = res.todosOsTermos?.find((t) => t.id === termoAtivo.id);
        if (atualizado) setTermoAtivo(atualizado);
      }
    } catch (error) {
      console.error("Erro ao carregar boletim:", error);
    } finally {
      setCarregando(false);
    }
  }, [termoId, termoAtivo]);

  useEffect(() => {
    carregarDados();
  }, [termoId]); // Só recarrega tudo se mudar o ID da URL

  // --- FUNÇÃO PADRÃO: SALVAR ---
  const handleSalvar = async () => {
    if (!termoAtivo) return;
    try {
      setCarregando(true);
      const dadosParaSalvar = {
        ...termoAtivo,
        nota1: termoAtivo.nota1 === "" ? 0 : parseFloat(termoAtivo.nota1),
        nota2: termoAtivo.nota2 === "" ? 0 : parseFloat(termoAtivo.nota2),
      };

      await api.updateBoletim(termoAtivo.id, dadosParaSalvar);
      alert(`Dados do ${termoAtivo.numeroTermo}º Termo salvos!`);

      // Recarrega para atualizar a média na barra lateral
      await carregarDados();
    } catch (error) {
      alert("Erro ao salvar notas.");
    } finally {
      setCarregando(false);
    }
  };

  const calcularMedia = (n1, n2) => ((parseFloat(n1 || 0) + parseFloat(n2 || 0)) / 2).toFixed(1);

  if (carregando && !alunoInfo.nome) return <div className="loading">Carregando informações...</div>;

  return (
    <div className="container-boletim">
      <header className="header-boletim">
        <button className="btn-voltar" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Voltar
        </button>
        <h2>
          <FaGraduationCap /> Boletim Pedagógico
        </h2>

        <div className="info-aluno-sub">
          <span className="nome">{alunoInfo.nome}</span>
          <span className="divisor"> | </span>
          <span className="curso">{alunoInfo.curso}</span>
        </div>
      </header>

      <div className="layout-boletim">
        {/* SIDEBAR DE TERMOS */}
        <aside className="sidebar-termos">
          <h3>Módulos do Curso</h3>
          {termos.map((t) => (
            <div key={t.id} className={`item-termo ${termoAtivo?.id === t.id ? "selecionado-verde" : ""}`} onClick={() => setTermoAtivo(t)}>
              <div className="termo-header">
                <strong>{t.numeroTermo}º Termo</strong>
                <span className="qtd-aulas">{t.aulasRealizadas} aulas</span>
              </div>
              <div className="termo-detalhes-mini">
                <span className="media-mini">Média: {calcularMedia(t.nota1, t.nota2)}</span>
              </div>
            </div>
          ))}
        </aside>

        {/* PAINEL DE EDIÇÃO */}
        <main className="painel-notas">
          {termoAtivo ? (
            <>
              <div className="alerta-edicao">
                Lançamento de Notas: <strong>{termoAtivo.numeroTermo}º Termo</strong>
              </div>

              <div className="grid-boletim">
                <div className="sessao-prova">
                  <h4>Avaliação Prática</h4>
                  <div className="campo">
                    <label>Nota</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={termoAtivo.nota1 || ""}
                      onChange={(e) => setTermoAtivo({ ...termoAtivo, nota1: e.target.value })}
                    />
                  </div>
                  <div className="campo">
                    <label>Data da Prova</label>
                    <input
                      type="date"
                      value={termoAtivo.dataProva1 ? termoAtivo.dataProva1.split("T")[0] : ""}
                      onChange={(e) => setTermoAtivo({ ...termoAtivo, dataProva1: e.target.value })}
                    />
                  </div>
                </div>

                <div className="sessao-prova">
                  <h4>Avaliação Teórica</h4>
                  <div className="campo">
                    <label>Nota</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={termoAtivo.nota2 || ""}
                      onChange={(e) => setTermoAtivo({ ...termoAtivo, nota2: e.target.value })}
                    />
                  </div>
                  <div className="campo">
                    <label>Data da Prova</label>
                    <input
                      type="date"
                      value={termoAtivo.dataProva2 ? termoAtivo.dataProva2.split("T")[0] : ""}
                      onChange={(e) => setTermoAtivo({ ...termoAtivo, dataProva2: e.target.value })}
                    />
                  </div>
                </div>

                <div className="sessao-resultado">
                  <h4>Média Final</h4>
                  <div className={`valor-media ${calcularMedia(termoAtivo.nota1, termoAtivo.nota2) >= 6 ? "aprovado" : "reprovado"}`}>
                    {calcularMedia(termoAtivo.nota1, termoAtivo.nota2)}
                  </div>
                  <div className="info-aulas-mini">
                    <FaCalendarCheck /> {termoAtivo.aulasRealizadas || 0} aulas presenciais
                  </div>
                </div>
              </div>

              <div className="sessao-obs">
                <label>Observações Pedagógicas</label>
                <textarea
                  rows="3"
                  value={termoAtivo.obs || ""}
                  onChange={(e) => setTermoAtivo({ ...termoAtivo, obs: e.target.value })}
                  placeholder="Descreva o desempenho do aluno neste módulo..."
                ></textarea>
              </div>

              <button className="btn-sucesso full" onClick={handleSalvar} disabled={carregando}>
                <FaSave /> {carregando ? "Salvando..." : `Confirmar Notas do ${termoAtivo.numeroTermo}º Termo`}
              </button>
            </>
          ) : (
            <div className="vazio">Selecione um termo ao lado para gerenciar as notas.</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Boletim;
