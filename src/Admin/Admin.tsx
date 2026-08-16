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
  const [produtoAnimando, setProdutoAnimando] = useState<number | null>(null);
  const [fechandoFormulario, setFechandoFormulario] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [produtoAdicionado, setProdutoAdicionado] = useState(false);
  const [carregando, setCarregando] = useState(false);

  function handleSair() {
    setCarregando(true);

    setTimeout(() => {
      sair();
    }, 2500);
  }

  useEffect(() => {
    const dados = localStorage.getItem("produtos");
    const produtosSalvos = dados ? JSON.parse(dados) : [];
    setProdutos(produtosSalvos);
  }, []);

  function abrirFormulario() {
    setEditandoId(null);

    setNome("");
    setDescricao("");
    setPreco("");

    setMostrarFormulario(true);
  }

  function fecharFormulario() {
    setFechandoFormulario(true);

    setTimeout(() => {
      setMostrarFormulario(false);
      setFechandoFormulario(false);

      setNome("");
      setDescricao("");
      setPreco("");
      setEditandoId(null);
    }, 400);
  }

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
    const novoProduto: Produto = {
      id: Date.now(),
      nome: nome.trim(),
      descricao: descricao.trim(),
      preco: valorNumerico,
    };

    produtosSalvos.push(novoProduto);

    localStorage.setItem("produtos", JSON.stringify(produtosSalvos));

    setProdutos(produtosSalvos);

    setProdutoAdicionado(true);

    setProdutoAnimando(novoProduto.id);

    setNome("");
    setDescricao("");
    setPreco("");

    setMostrarFormulario(true);

    setTimeout(() => {
      setProdutoAdicionado(false);
    }, 1500);

    setTimeout(() => {
      setProdutoAnimando(null);
    }, 1000);
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
    fecharFormulario();
  }

  return (
    <div className="admin">
      {carregando && (
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Saindo...</p>
        </div>
      )}

      <div className="admin-container">
        <h1>Painel Administrativo</h1>

        {!mostrarFormulario && (
          <button
            type="button"
            className="botao-adicionar"
            onClick={abrirFormulario}
          >
            + Adicionar produto
          </button>
        )}

        {mostrarFormulario && (
          <div
            className={`form-produto ${
              fechandoFormulario ? "fechando-formulario" : ""
            }`}
          >
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
                  onClick={fecharFormulario}
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`botao-salvar ${
                    produtoAdicionado ? "produto-adicionado" : ""
                  }`}
                  onClick={adicionarProduto}
                  disabled={produtoAdicionado}
                >
                  {produtoAdicionado
                    ? "✓ Produto adicionado!"
                    : "Adicionar à Loja"}
                </button>
                <button
                  type="button"
                  className="botao-cancelar"
                  onClick={fecharFormulario}
                  disabled={produtoAdicionado}
                >
                  Fechar
                </button>
              </>
            )}
          </div>
        )}
        <div className="produtos-admin">
          <h2>Produtos cadastrados</h2>
          {produtos.length === 0 ? (
            <p>Nenhum produto cadastrado.</p>
          ) : (
            produtos.map((produto) => (
              <div
                className={`produto-admin ${
                  produtoAnimando === produto.id ? "produto-novo" : ""
                }`}
                key={produto.id}
              >
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
        <button
          type="button"
          className="botao-sair-admin"
          onClick={handleSair}
          disabled={carregando}
        >
          {carregando ? "Saindo..." : "Sair"}
        </button>
      </div>
    </div>
  );
}

export default Admin;
