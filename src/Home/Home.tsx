import { useEffect, useState } from "react";
import "../Styles/Home.css";

type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
};

type Usuario = {
  nome: string;
  email: string;
  senha: string;
  tipo?: string;
};

type Props = {
  usuarioLogado: Usuario | null;
  carrinho: {
    produto: Produto;
    quantidade: number;
  }[];
  onCarrinhoChange: (carrinho: { produto: Produto; quantidade: number }[]) => void;
};

function obterSaudacao(): string {
  const horaAtual = new Date().getHours();

  if (horaAtual >= 5 && horaAtual < 12) {
    return "Bom dia";
  }

  if (horaAtual >= 12 && horaAtual < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

function Home({
  usuarioLogado,
  carrinho,
  onCarrinhoChange,
}: Props) {
  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [usuarioAtual, setUsuarioAtual] = useState<Usuario | null>(usuarioLogado);

  const [fechandoModal, setFechandoModal] = useState(false);

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null,
  );
  const [quantidadeSelecionada, setQuantidadeSelecionada] = useState(1);

  // =========================
  const [produtoAdicionado, setProdutoAdicionado] = useState(false);

  // =========================
  // CARREGAR PRODUTOS E USUÁRIO
  // =========================

  useEffect(() => {
    setUsuarioAtual(usuarioLogado);
  }, [usuarioLogado]);

  useEffect(() => {
    async function carregarDados() {
      try {
        const resposta = await fetch("http://localhost:3000/api/products");
        const produtosSalvos = resposta.ok ? await resposta.json() : [];

        setProdutos(produtosSalvos.map((produto: any) => ({
          ...produto,
          imagem: produto.imagem || "",
        })));
      } catch (erro) {
        console.error("Erro ao buscar produtos:", erro);
      }
    }

    carregarDados();
  }, []);

  // =========================
  // CARREGAR CARRINHO DO USUÁRIO
  // =========================

  useEffect(() => {
    if (!usuarioAtual?.email) {
      onCarrinhoChange([]);
    }
  }, [usuarioAtual, onCarrinhoChange]);

  // =========================
  // ADICIONAR AO CARRINHO
  // =========================

  function adicionarAoCarrinho(produto: Produto) {
    const carrinhoAtualizado = [...carrinho];

    const itemExistente = carrinhoAtualizado.find(
      (item) => item.produto.id === produto.id,
    );

    if (itemExistente) {
      itemExistente.quantidade += quantidadeSelecionada;
    } else {
      carrinhoAtualizado.push({
        produto,
        quantidade: quantidadeSelecionada,
      });
    }

    onCarrinhoChange(carrinhoAtualizado);
    setProdutoAdicionado(true);

    fecharModal();

    window.setTimeout(() => {
      setProdutoAdicionado(false);
    }, 1300);
  }

  // =========================
  // VISUALIZAR PRODUTO
  // =========================

  function visualizarProduto(produto: Produto) {
    setFechandoModal(false);
    setQuantidadeSelecionada(1);

    setProdutoSelecionado(produto);
  }

  // =========================
  // FECHAR MODAL PRODUTO
  // =========================

  function fecharModal() {
    setFechandoModal(true);

    setTimeout(() => {
      setProdutoSelecionado(null);
      setQuantidadeSelecionada(1);

      setFechandoModal(false);
    }, 250);
  }

  return (
    <div className="home">
      {/* =========================
          CONTEÚDO PRINCIPAL
      ========================= */}

      <div className="home-content">
            {/* =========================
                CABEÇALHO
            ========================= */}

            <div className="cabecalho-home">
              <h1>
                {obterSaudacao()},
                {usuarioLogado?.nome && (
                  <span className="nome-usuario">
                    {usuarioLogado.nome.toUpperCase()}
                  </span>
                )}
                !
              </h1>

            </div>

            <h3>Produtos</h3>

            {/* =========================
                PRODUTOS
            ========================= */}

            <div className="produtos-container">
              {produtos.length === 0 ? (
                <h3>Nenhum produto disponível.</h3>
              ) : (
                produtos.map((produto) => (
                  <div className="produto-card" key={produto.id}>
                    <h2>{produto.nome}</h2>

                    <p>{produto.descricao}</p>

                    <strong>
                      {produto.preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>

                    <button
                      type="button"
                      className="botao-visualizar"
                      onClick={() => visualizarProduto(produto)}
                    >
                      Visualizar
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* ==================================================
              MODAL PRODUTO
          ================================================== */}

          {produtoSelecionado && (
            <div className={`modal-overlay ${fechandoModal ? "fechando" : ""}`}>
              <div
                className={`modal-produto ${fechandoModal ? "fechando" : ""}`}
              >
                {/* IMAGEM */}

                <div className="modal-imagem">
                  {produtoSelecionado.imagem ? (
                    <img
                      src={produtoSelecionado.imagem}
                      alt={produtoSelecionado.nome}
                      className="modal-produto-imagem"
                    />
                  ) : (
                    <span>📦</span>
                  )}
                </div>

                {/* CONTEÚDO */}

                <div className="modal-conteudo">
                  <h2>{produtoSelecionado.nome}</h2>

                  <p>{produtoSelecionado.descricao}</p>

                  <strong>
                    {produtoSelecionado.preco.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>

                  {/* ADICIONAR AO CARRINHO */}

                  <div className="acoes-compra-modal">
                    <button
                      type="button"
                      className={`botao-adicionar-carrinho ${
                        produtoAdicionado ? "produto-adicionado" : ""
                      }`}
                      onClick={() => adicionarAoCarrinho(produtoSelecionado)}
                      disabled={produtoAdicionado}
                    >
                      {produtoAdicionado
                        ? "✓ Adicionado"
                        : "🛒 Adicionar ao carrinho"}
                    </button>

                    <div className="seletor-quantidade-modal">
                      <button
                        type="button"
                        aria-label="Diminuir quantidade"
                        onClick={() =>
                          setQuantidadeSelecionada((quantidade) =>
                            Math.max(1, quantidade - 1),
                          )
                        }
                        disabled={produtoAdicionado}
                      >
                        −
                      </button>

                      <span aria-live="polite">{quantidadeSelecionada}</span>

                      <button
                        type="button"
                        aria-label="Aumentar quantidade"
                        onClick={() =>
                          setQuantidadeSelecionada((quantidade) => quantidade + 1)
                        }
                        disabled={produtoAdicionado}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* FECHAR */}

                  <button
                    type="button"
                    className="botao-fechar-modal"
                    onClick={fecharModal}
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}

      {produtoAdicionado && (
        <div className="aviso-produto-adicionado" role="status">
          <span className="check-produto-adicionado">✓</span>
          Produto adicionado ao carrinho
        </div>
      )}
    </div>
  );
}

export default Home;
