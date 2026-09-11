import { useEffect, useState } from "react";
import "../Styles/ProductDetails.css";

type Produto = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
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

        setProduto({
          ...produtoRecebido,
          preco: Number(produtoRecebido.preco),
          imagem: produtoRecebido.imagem || "",
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
      onVoltar();
    }, 1300);
  }

  if (carregando) {
    return (
      <div className="pagina-detalhes-produto">
        <div className="detalhes-carregando">
          <div className="detalhes-loader"></div>
          <p>Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (erro || !produto) {
    return (
      <div className="pagina-detalhes-produto">
        <div className="produto-nao-encontrado">
          <span>📦</span>
          <h1>Produto não encontrado</h1>
          <p>Não foi possível encontrar as informações deste produto.</p>
          <button
            type="button"
            className="botao-voltar-produto"
            onClick={onVoltar}
          >
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pagina-detalhes-produto">
      <div className="detalhes-container">
        <button
          type="button"
          className="botao-voltar-produto"
          onClick={onVoltar}
        >
          ← Voltar
        </button>
        <div className="detalhes-produto">
          <div className="detalhes-imagem">
            {produto.imagem ? (
              <img src={produto.imagem} alt={produto.nome} />
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
    </div>
  );
}

export default ProductDetails;
