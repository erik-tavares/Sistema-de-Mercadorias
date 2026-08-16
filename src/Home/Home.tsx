import { useEffect, useState } from "react";
import "../Styles/Home.css";

type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
};

type Props = {
  sair: () => void;
};

function Home({ sair }: Props) {
  const [carregando, setCarregando] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [fechandoModal, setFechandoModal] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(
    null,
  );

  useEffect(() => {
    const dados = localStorage.getItem("produtos");
    const produtosSalvos = dados ? JSON.parse(dados) : [];
    setProdutos(produtosSalvos);
  }, []);

  function handleSair() {
    setCarregando(true);

    setTimeout(() => {
      sair();
    }, 2500);
  }

  function visualizarProduto(produto: Produto) {
    setFechandoModal(false);
    setProdutoSelecionado(produto);
  }

  function fecharModal() {
    setFechandoModal(true);

    setTimeout(() => {
      setProdutoSelecionado(null);
      setFechandoModal(false);
    }, 250);
  }

  return (
    <div className="home">
      {carregando && (
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Saindo...</p>
        </div>
      )}
      <div className="home-content">
        <h1>Bem-vindo!</h1>
        <h3>Produtos</h3>
        <div className="produtos-container">
          {produtos.length === 0 ? (
            <p>Nenhum produto disponível.</p>
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
        <button
          className="botao-sair"
          onClick={handleSair}
          disabled={carregando}
        >
          {carregando ? "Saindo..." : "Sair"}
        </button>
      </div>

      {produtoSelecionado && (
        <div className={`modal-overlay ${fechandoModal ? "fechando" : ""}`}>
          <div className={`modal-produto ${fechandoModal ? "fechando" : ""}`}>
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
            <div className="modal-conteudo">
              <h2>{produtoSelecionado.nome}</h2>
              <p>{produtoSelecionado.descricao}</p>
              <strong>
                {produtoSelecionado.preco.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </strong>
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
    </div>
  );
}

export default Home;
