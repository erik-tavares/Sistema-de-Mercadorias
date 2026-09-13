import { useEffect, useState } from "react";
import "../Styles/ProductDetails.css";

type Produto = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
  imagens?: string[];
};

type ItemCarrinho = {
  produto: Produto;
  quantidade: number;
};

type Props = {
  produtoId: string;
  onVoltar: () => void;
  carrinho: ItemCarrinho[];
  onCarrinhoChange: (carrinho: ItemCarrinho[]) => void;
};

function ProductDetails({
  produtoId,
  onVoltar,
  carrinho,
  onCarrinhoChange,
}: Props) {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [produtoAdicionado, setProdutoAdicionado] = useState(false);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [direcaoAnimacao, setDirecaoAnimacao] = useState<
    "esquerda" | "direita"
  >("direita");
  const [proximaImagem, setProximaImagem] = useState<number | null>(null);
  const [animandoImagem, setAnimandoImagem] = useState(false);
  const [imagemTelaCheia, setImagemTelaCheia] = useState(false);
  const [saindoDaPagina, setSaindoDaPagina] = useState(false);
  useEffect(() => {
    async function carregarProduto() {
      try {
        setCarregando(true);
        setErro(false);

        if (!produtoId) {
          setErro(true);
          return;
        }

        const resposta = await fetch(
          `http://localhost:3000/api/products/${produtoId}`,
        );

        if (!resposta.ok) {
          throw new Error("Produto não encontrado.");
        }

        const produtoRecebido = await resposta.json();
        // console.log("========== PRODUTO ==========");
        // console.log(produtoRecebido);
        // console.log("IMAGEM PRINCIPAL:", produtoRecebido.imagem);
        // console.log("TODAS AS IMAGENS:", produtoRecebido.imagens);
        // console.log(
        //   "QUANTIDADE DE IMAGENS:",
        //   Array.isArray(produtoRecebido.imagens)
        //     ? produtoRecebido.imagens.length
        //     : 0,
        // );
        setProduto({
          ...produtoRecebido,
          preco: Number(produtoRecebido.preco),
          imagem: produtoRecebido.imagem || "",
          imagens: Array.isArray(produtoRecebido.imagens)
            ? produtoRecebido.imagens
            : [],
        });
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
        setErro(true);
      } finally {
        setCarregando(false);
      }
    }

    carregarProduto();
  }, [produtoId]);

  useEffect(() => {
    setImagemAtual(0);
  }, [produtoId]);

  useEffect(() => {
    function fecharComEsc(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setImagemTelaCheia(false);
      }
    }

    if (imagemTelaCheia) {
      document.addEventListener("keydown", fecharComEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", fecharComEsc);
      document.body.style.overflow = "";
    };
  }, [imagemTelaCheia]);

  function voltarComAnimacao() {
    if (saindoDaPagina) return;

    setImagemTelaCheia(false);
    setSaindoDaPagina(true);

    window.setTimeout(() => {
      onVoltar();
    }, 480);
  }

  function adicionarAoCarrinho() {
    if (!produto) return;
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

    onCarrinhoChange(carrinhoAtualizado);
    setProdutoAdicionado(true);

    window.setTimeout(() => {
      setProdutoAdicionado(false);
      voltarComAnimacao();
    }, 1300);
  }

  if (carregando) {
    return (
      <div
        className={`pagina-detalhes-produto ${saindoDaPagina ? "pagina-detalhes-saindo" : ""}`}
      >
        <div className="detalhes-carregando">
          <div className="detalhes-loader"></div>
          <p>Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (erro || !produto) {
    return (
      <div
        className={`pagina-detalhes-produto ${saindoDaPagina ? "pagina-detalhes-saindo" : ""}`}
      >
        <div className="produto-nao-encontrado">
          <span>📦</span>
          <h1>Produto não encontrado</h1>
          <p>Não foi possível encontrar as informações deste produto.</p>
          <button
            type="button"
            className="botao-voltar-produto"
            onClick={voltarComAnimacao}
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  const imagensProduto =
    Array.isArray(produto.imagens) && produto.imagens.length > 0
      ? produto.imagens
      : produto.imagem
        ? [produto.imagem]
        : [];

  function mudarImagem(novaImagem: number, direcao: "esquerda" | "direita") {
    if (animandoImagem || novaImagem === imagemAtual) return;

    const imagem = new Image();
    imagem.src = imagensProduto[novaImagem];

    const iniciarAnimacao = () => {
      setDirecaoAnimacao(direcao);
      setProximaImagem(novaImagem);
      setAnimandoImagem(true);

      window.setTimeout(() => {
        setImagemAtual(novaImagem);
        setProximaImagem(null);
        setAnimandoImagem(false);
      }, 350);
    };

    // Se já estiver carregada, anima imediatamente
    if (imagem.complete) {
      iniciarAnimacao();
      return;
    }

    // Aguarda a imagem carregar antes de começar
    imagem.onload = iniciarAnimacao;

    // Caso dê erro, não inicia uma transição quebrada
    imagem.onerror = () => {
      console.error("Não foi possível carregar a imagem:", imagem.src);
    };
  }

  return (
    <div
      className={`pagina-detalhes-produto ${saindoDaPagina ? "pagina-detalhes-saindo" : ""}`}
    >
      <div className="detalhes-container">
        <button
          type="button"
          className="botao-voltar-produto"
          onClick={voltarComAnimacao}
        >
          ← Voltar
        </button>
        <div className="detalhes-produto">
          <div className="detalhes-imagem">
            {imagensProduto.length > 0 ? (
              <>
                <div className="carrossel-imagens">
                  {/* Imagem atual */}
                  <img
                    src={imagensProduto[imagemAtual]}
                    alt={`${produto.nome} - Imagem ${imagemAtual + 1}`}
                    className={
                      animandoImagem
                        ? direcaoAnimacao === "direita"
                          ? "imagem-carrossel-produto imagem-saindo-esquerda"
                          : "imagem-carrossel-produto imagem-saindo-direita"
                        : "imagem-carrossel-produto imagem-visivel"
                    }
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                    onClick={() => setImagemTelaCheia(true)}
                  />

                  {/* Próxima imagem entrando */}
                  {proximaImagem !== null && (
                    <img
                      src={imagensProduto[proximaImagem]}
                      alt={`${produto.nome} - Imagem ${proximaImagem + 1}`}
                      className={
                        direcaoAnimacao === "direita"
                          ? "imagem-carrossel-produto imagem-entrando-direita"
                          : "imagem-carrossel-produto imagem-entrando-esquerda"
                      }
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>

                {imagensProduto.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="carrossel-botao carrossel-anterior"
                      onClick={() =>
                        mudarImagem(
                          (imagemAtual - 1 + imagensProduto.length) %
                            imagensProduto.length,
                          "esquerda",
                        )
                      }
                      aria-label="Imagem anterior"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      className="carrossel-botao carrossel-proxima"
                      onClick={() =>
                        mudarImagem(
                          (imagemAtual + 1) % imagensProduto.length,
                          "direita",
                        )
                      }
                      aria-label="Próxima imagem"
                    >
                      ›
                    </button>

                    <div className="carrossel-indicadores">
                      {imagensProduto.map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          className={
                            index === imagemAtual
                              ? "indicador-imagem ativo"
                              : "indicador-imagem"
                          }
                          onClick={() =>
                            mudarImagem(
                              (imagemAtual + 1) % imagensProduto.length,
                              "direita",
                            )
                          }
                          aria-label={`Ir para imagem ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <span>📦</span>
            )}
          </div>
          <div className="detalhes-informacoes">
            <span className="detalhes-label">Produto</span>
            <h1>{produto.nome}</h1>
            <div className="detalhes-separador"></div>
            <h2>Descrição</h2>
            <p className="detalhes-descricao">{produto.descricao}</p>
            <div className="detalhes-preco">
              {produto.preco.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
            <button
              type="button"
              className="botao-comprar-detalhes"
              onClick={adicionarAoCarrinho}
              disabled={produtoAdicionado}
            >
              {produtoAdicionado ? "✓ Adicionado" : "🛒 Adicionar ao carrinho"}
            </button>
          </div>
        </div>
      </div>
      {produtoAdicionado && (
        <div className="aviso-produto-adicionado" role="status">
          <span className="check-produto-adicionado">✓</span>
          Produto adicionado ao carrinho
        </div>
      )}
      {imagemTelaCheia && (
        <div
          className="modal-imagem-tela-cheia"
          onClick={() => setImagemTelaCheia(false)}
        >
          <button
            type="button"
            className="botao-fechar-imagem"
            onClick={() => setImagemTelaCheia(false)}
            aria-label="Fechar imagem"
          >
            ×
          </button>

          {imagensProduto.length > 1 && (
            <button
              type="button"
              className="modal-carrossel-botao modal-carrossel-anterior"
              onClick={(event) => {
                event.stopPropagation();

                mudarImagem(
                  (imagemAtual - 1 + imagensProduto.length) %
                    imagensProduto.length,
                  "esquerda",
                );
              }}
              aria-label="Imagem anterior"
            >
              ‹
            </button>
          )}

          <div
            className="modal-imagem-container"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-carrossel-imagens">
              {/* Imagem atual */}
              <img
                src={imagensProduto[imagemAtual]}
                alt={`${produto.nome} - Imagem ${imagemAtual + 1}`}
                className={
                  animandoImagem
                    ? direcaoAnimacao === "direita"
                      ? "modal-imagem-ampliada modal-imagem-saindo-esquerda"
                      : "modal-imagem-ampliada modal-imagem-saindo-direita"
                    : "modal-imagem-ampliada modal-imagem-visivel"
                }
              />

              {/* Nova imagem entrando */}
              {proximaImagem !== null && (
                <img
                  src={imagensProduto[proximaImagem]}
                  alt={`${produto.nome} - Imagem ${proximaImagem + 1}`}
                  className={
                    direcaoAnimacao === "direita"
                      ? "modal-imagem-ampliada modal-imagem-entrando-direita"
                      : "modal-imagem-ampliada modal-imagem-entrando-esquerda"
                  }
                />
              )}
            </div>

            {imagensProduto.length > 1 && (
              <div className="modal-indicadores">
                {imagensProduto.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={
                      index === imagemAtual
                        ? "modal-indicador ativo"
                        : "modal-indicador"
                    }
                    onClick={() => {
                      if (index === imagemAtual || animandoImagem) return;

                      mudarImagem(
                        index,
                        index > imagemAtual ? "direita" : "esquerda",
                      );
                    }}
                    aria-label={`Ir para imagem ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {imagensProduto.length > 1 && (
            <button
              type="button"
              className="modal-carrossel-botao modal-carrossel-proxima"
              onClick={(event) => {
                event.stopPropagation();

                mudarImagem(
                  (imagemAtual + 1) % imagensProduto.length,
                  "direita",
                );
              }}
              aria-label="Próxima imagem"
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
