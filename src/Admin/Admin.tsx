import { useEffect, useState } from "react";
import "../Styles/Admin.css";

type Props = {
  sair: () => void;
};

type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
};

function Admin({ sair }: Props) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");

  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [editandoId, setEditandoId] = useState<number | null>(null);

  // Carrega os produtos salvos
  useEffect(() => {
    const dados = localStorage.getItem("produtos");

    const produtosSalvos = dados ? JSON.parse(dados) : [];

    setProdutos(produtosSalvos);
  }, []);

  function adicionarProduto() {
    if (!nome.trim() || !descricao.trim() || !preco.trim()) {
      alert("Preencha todos os campos!");
      return;
    }

    const valorNumerico = Number(preco.replace(/\./g, "").replace(",", "."));

    if (isNaN(valorNumerico)) {
      alert("Digite um preço válido!");
      return;
    }

    const dados = localStorage.getItem("produtos");

    const produtosSalvos = dados ? JSON.parse(dados) : [];

    const novoProduto = {
      id: Date.now(),
      nome: nome.trim(),
      descricao: descricao.trim(),
      preco: valorNumerico,
    };

    produtosSalvos.push(novoProduto);

    localStorage.setItem("produtos", JSON.stringify(produtosSalvos));

    setProdutos(produtosSalvos);

    setNome("");
    setDescricao("");
    setPreco("");

    setMostrarFormulario(false);

    alert("Produto adicionado à Home!");
  }

  function excluirProduto(id: number) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este produto?",
    );

    if (!confirmar) {
      return;
    }

    const produtosAtualizados = produtos.filter((produto) => produto.id !== id);

    localStorage.setItem("produtos", JSON.stringify(produtosAtualizados));

    setProdutos(produtosAtualizados);
  }

  function iniciarEdicao(produto: Produto) {
    setEditandoId(produto.id);

    setNome(produto.nome);
    setDescricao(produto.descricao);

    setPreco(
      produto.preco.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    );

    setMostrarFormulario(true);
  }

  function salvarEdicao() {
    if (!nome.trim() || !descricao.trim() || !preco.trim()) {
      alert("Preencha todos os campos!");
      return;
    }

    const valorNumerico = Number(preco.replace(/\./g, "").replace(",", "."));

    if (isNaN(valorNumerico)) {
      alert("Digite um preço válido!");
      return;
    }

    const produtosAtualizados = produtos.map((produto) => {
      if (produto.id === editandoId) {
        return {
          ...produto,
          nome: nome.trim(),
          descricao: descricao.trim(),
          preco: valorNumerico,
        };
      }

      return produto;
    });

    localStorage.setItem("produtos", JSON.stringify(produtosAtualizados));

    setProdutos(produtosAtualizados);

    setNome("");
    setDescricao("");
    setPreco("");

    setEditandoId(null);
    setMostrarFormulario(false);

    alert("Produto atualizado com sucesso!");
  }

  function cancelarEdicao() {
    setNome("");
    setDescricao("");
    setPreco("");

    setEditandoId(null);
    setMostrarFormulario(false);
  }

  return (
    <div className="admin">
      <div className="admin-container">
        <h1>Painel Administrativo</h1>

        <button
          type="button"
          className="botao-adicionar"
          onClick={() => {
            if (mostrarFormulario) {
              cancelarEdicao();
            } else {
              setMostrarFormulario(true);
            }
          }}
        >
          {mostrarFormulario ? "Fechar" : "+ Adicionar produto"}
        </button>

        {mostrarFormulario && (
          <div className="form-produto">
            <h2>{editandoId !== null ? "Editar produto" : "Novo produto"}</h2>

            <input
              type="text"
              placeholder="Nome do produto"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <input
              type="text"
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />

            <input
              type="text"
              placeholder="Preço"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
            />

            {editandoId !== null ? (
              <>
                <button
                  type="button"
                  className="botao-salvar"
                  onClick={salvarEdicao}
                >
                  Salvar alterações
                </button>

                <button
                  type="button"
                  className="botao-cancelar"
                  onClick={cancelarEdicao}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <button
                type="button"
                className="botao-salvar"
                onClick={adicionarProduto}
              >
                Adicionar à Home
              </button>
            )}
          </div>
        )}

        {/* LISTA DE PRODUTOS */}
        <div className="produtos-admin">
          <h2>Produtos cadastrados</h2>

          {produtos.length === 0 ? (
            <p>Nenhum produto cadastrado.</p>
          ) : (
            produtos.map((produto) => (
              <div className="produto-admin" key={produto.id}>
                <div className="produto-info">
                  <h3>{produto.nome}</h3>

                  <p>{produto.descricao}</p>

                  <strong>
                    {produto.preco.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                </div>

                <div className="produto-acoes">
                  <button
                    type="button"
                    className="botao-editar"
                    onClick={() => iniciarEdicao(produto)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="botao-excluir"
                    onClick={() => excluirProduto(produto.id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* SAIR */}
        <button type="button" className="botao-sair-admin" onClick={sair}>
          Sair
        </button>
      </div>
    </div>
  );
}

export default Admin;
