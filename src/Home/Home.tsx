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

type ItemCarrinho = {
  produto: Produto;
  quantidade: number;
};

type Props = {
  sair: () => void;
  onInicioSaida: () => void;
};

function Home({ sair, onInicioSaida }: Props) {
  const [carregando, setCarregando] = useState(false);

  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);

  const [fechandoModal, setFechandoModal] = useState(false);

  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null,
  );

  // =========================
  // CARRINHO
  // =========================

  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);

  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);

  const [fechandoCarrinho, setFechandoCarrinho] = useState(false);

  // =========================
  // CARREGAR PRODUTOS E USUÁRIO
  // =========================

  useEffect(() => {
    const dadosProdutos = localStorage.getItem("produtos");

    const produtosSalvos = dadosProdutos ? JSON.parse(dadosProdutos) : [];

    setProdutos(produtosSalvos);

    const dadosUsuario = localStorage.getItem("usuarioLogado");

    if (dadosUsuario) {
      try {
        const usuario = JSON.parse(dadosUsuario);

        setUsuarioLogado(usuario);
      } catch (erro) {
        console.error("Erro ao carregar usuário logado:", erro);
      }
    }
  }, []);

  // =========================
  // CARREGAR CARRINHO DO USUÁRIO
  // =========================

  useEffect(() => {
    if (!usuarioLogado?.email) {
      return;
    }

    const chaveCarrinho = `carrinho_${usuarioLogado.email}`;

    const dadosCarrinho = localStorage.getItem(chaveCarrinho);

    if (dadosCarrinho) {
      try {
        const carrinhoSalvo = JSON.parse(dadosCarrinho);

        setCarrinho(carrinhoSalvo);
      } catch (erro) {
        console.error("Erro ao carregar carrinho:", erro);

        setCarrinho([]);
      }
    } else {
      setCarrinho([]);
    }
  }, [usuarioLogado]);

  // =========================
  // SALVAR CARRINHO
  // =========================

  function salvarCarrinho(carrinhoAtualizado: ItemCarrinho[]) {
    if (!usuarioLogado?.email) {
      return;
    }

    setCarrinho(carrinhoAtualizado);

    localStorage.setItem(
      `carrinho_${usuarioLogado.email}`,
      JSON.stringify(carrinhoAtualizado),
    );
  }

  // =========================
  // ADICIONAR AO CARRINHO
  // =========================

  function adicionarAoCarrinho(produto: Produto) {
    const carrinhoAtualizado = [...carrinho];

    const itemExistente = carrinhoAtualizado.find(
      (item) => item.produto.id === produto.id,
    );

    if (itemExistente) {
      itemExistente.quantidade += 1;
    } else {
      carrinhoAtualizado.push({
        produto,
        quantidade: 1,
      });
    }

    salvarCarrinho(carrinhoAtualizado);
  }

  // =========================
  // AUMENTAR QUANTIDADE
  // =========================

  function aumentarQuantidade(id: number) {
    const carrinhoAtualizado = carrinho.map((item) => {
      if (item.produto.id === id) {
        return {
          ...item,
          quantidade: item.quantidade + 1,
        };
      }

      return item;
    });

    salvarCarrinho(carrinhoAtualizado);
  }

  // =========================
  // DIMINUIR QUANTIDADE
  // =========================

  function diminuirQuantidade(id: number) {
    const carrinhoAtualizado = carrinho
      .map((item) => {
        if (item.produto.id === id) {
          return {
            ...item,
            quantidade: item.quantidade - 1,
          };
        }

        return item;
      })
      .filter((item) => item.quantidade > 0);

    salvarCarrinho(carrinhoAtualizado);
  }

  // =========================
  // REMOVER DO CARRINHO
  // =========================

  function removerDoCarrinho(id: number) {
    const carrinhoAtualizado = carrinho.filter(
      (item) => item.produto.id !== id,
    );

    salvarCarrinho(carrinhoAtualizado);
  }

  // =========================
  // QUANTIDADE DE ITENS
  // =========================

  const quantidadeCarrinho = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0,
  );

  // =========================
  // TOTAL
  // =========================

  const totalCarrinho = carrinho.reduce(
    (total, item) => total + item.produto.preco * item.quantidade,
    0,
  );

  // =========================
  // SAIR
  // =========================

  function handleSair() {
    onInicioSaida();
    setCarregando(true);

    // Fecha qualquer elemento aberto antes da animação
    setProdutoSelecionado(null);
    setMostrarCarrinho(false);
    setFechandoModal(false);
    setFechandoCarrinho(false);

    setTimeout(() => {
      localStorage.removeItem("usuarioLogado");
      sair();
    }, 2000);
  }

  // =========================
  // VISUALIZAR PRODUTO
  // =========================

  function visualizarProduto(produto: Produto) {
    setFechandoModal(false);

    setProdutoSelecionado(produto);
  }

  // =========================
  // FECHAR MODAL PRODUTO
  // =========================

  function fecharModal() {
    setFechandoModal(true);

    setTimeout(() => {
      setProdutoSelecionado(null);

      setFechandoModal(false);
    }, 250);
  }

  // =========================
  // ABRIR CARRINHO
  // =========================

  function abrirCarrinho() {
    setFechandoCarrinho(false);

    setMostrarCarrinho(true);
  }

  // =========================
  // FECHAR CARRINHO
  // =========================

  function fecharCarrinho() {
    setFechandoCarrinho(true);

    setTimeout(() => {
      setMostrarCarrinho(false);

      setFechandoCarrinho(false);
    }, 300);
  }

  return (
    <div className={`home ${carregando ? "saindo" : ""}`}>
      {/* =========================
          LOADING
      ========================= */}

      {carregando && (
        <div className="loading-screen">
          <div className="loader"></div>

          <p>Saindo</p>
        </div>
      )}

      {/* =========================
          CONTEÚDO PRINCIPAL
      ========================= */}

      {!carregando && (
        <>
          <div className="home-content">
            {/* =========================
                CABEÇALHO
            ========================= */}

            <div className="cabecalho-home">
              <h1>
                Bem-vindo,
                {usuarioLogado?.nome && (
                  <span className="nome-usuario">
                    {usuarioLogado.nome.toUpperCase()}
                  </span>
                )}
                !
              </h1>

              {/* =========================
                  BOTÃO CARRINHO
              ========================= */}

              <button
                type="button"
                className="botao-carrinho"
                onClick={abrirCarrinho}
                aria-label="Abrir carrinho"
              >
                🛒
                {quantidadeCarrinho > 0 && (
                  <span className="contador-carrinho">
                    {quantidadeCarrinho}
                  </span>
                )}
              </button>
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

            {/* =========================
                BOTÃO SAIR
            ========================= */}

            <button
              className="botao-sair"
              onClick={handleSair}
              disabled={carregando}
            >
              Sair
            </button>
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

                  <button
                    type="button"
                    className="botao-adicionar-carrinho"
                    onClick={() => adicionarAoCarrinho(produtoSelecionado)}
                  >
                    🛒 Adicionar ao carrinho
                  </button>

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

          {/* ==================================================
              CARRINHO LATERAL
          ================================================== */}

          {mostrarCarrinho && (
            <div
              className={`carrinho-overlay ${
                fechandoCarrinho ? "fechando" : ""
              }`}
            >
              <div
                className={`carrinho-lateral ${
                  fechandoCarrinho ? "fechando" : ""
                }`}
              >
                {/* CABEÇALHO */}

                <div className="cabecalho-carrinho">
                  <div>
                    <h2>🛒 Meu carrinho</h2>

                    <span>
                      {quantidadeCarrinho}{" "}
                      {quantidadeCarrinho === 1 ? "item" : "itens"}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="botao-fechar-carrinho"
                    onClick={fecharCarrinho}
                    aria-label="Fechar carrinho"
                  >
                    ×
                  </button>
                </div>

                {/* =========================
                    CARRINHO VAZIO
                ========================= */}

                {carrinho.length === 0 ? (
                  <div className="carrinho-vazio">
                    <span>🛒</span>

                    <h2>Seu carrinho está vazio</h2>

                    <p>Adicione alguns produtos para começar suas compras.</p>

                    <button
                      type="button"
                      className="botao-continuar-comprando"
                      onClick={fecharCarrinho}
                    >
                      Continuar comprando
                    </button>
                  </div>
                ) : (
                  <>
                    {/* =========================
                        ITENS
                    ========================= */}

                    <div className="itens-carrinho">
                      {carrinho.map((item) => (
                        <div className="item-carrinho" key={item.produto.id}>
                          {/* IMAGEM */}

                          <div className="item-carrinho-imagem">
                            {item.produto.imagem ? (
                              <img
                                src={item.produto.imagem}
                                alt={item.produto.nome}
                              />
                            ) : (
                              <span>📦</span>
                            )}
                          </div>

                          {/* INFORMAÇÕES */}

                          <div className="item-carrinho-info">
                            <h3>{item.produto.nome}</h3>

                            <strong>
                              {item.produto.preco.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </strong>

                            {/* QUANTIDADE */}

                            <div className="controle-quantidade">
                              <button
                                type="button"
                                onClick={() =>
                                  diminuirQuantidade(item.produto.id)
                                }
                              >
                                −
                              </button>

                              <span>{item.quantidade}</span>

                              <button
                                type="button"
                                onClick={() =>
                                  aumentarQuantidade(item.produto.id)
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* REMOVER */}

                          <button
                            type="button"
                            className="botao-remover-carrinho"
                            onClick={() => removerDoCarrinho(item.produto.id)}
                            aria-label={`Remover ${item.produto.nome}`}
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* =========================
                        RESUMO
                    ========================= */}

                    <div className="resumo-carrinho">
                      <div className="linha-resumo">
                        <span>Itens</span>

                        <strong>{quantidadeCarrinho}</strong>
                      </div>

                      <div className="linha-resumo total-carrinho">
                        <span>Total</span>

                        <strong>
                          {totalCarrinho.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </strong>
                      </div>

                      <button type="button" className="botao-finalizar-compra">
                        Finalizar compra
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Home;
