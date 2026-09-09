import { useEffect, useState } from "react";
import "../Styles/ProductDetails.css";

type Produto = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
};

type Props = {
  produtoId: string;
  onVoltar: () => void;
};

function ProductDetails({ produtoId, onVoltar }: Props) {
  const [produto, setProduto] = useState<Produto | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

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
        {/* VOLTAR */}

        <button
          type="button"
          className="botao-voltar-produto"
          onClick={onVoltar}
        >
          ← Voltar
        </button>

        {/* PRODUTO */}

        <div className="detalhes-produto">
          {/* IMAGEM */}

          <div className="detalhes-imagem">
            {produto.imagem ? (
              <img src={produto.imagem} alt={produto.nome} />
            ) : (
              <span>📦</span>
            )}
          </div>

          {/* INFORMAÇÕES */}

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

            <button type="button" className="botao-comprar-detalhes">
              🛒 Adicionar ao carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
