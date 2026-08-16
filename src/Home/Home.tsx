import { useEffect, useState } from "react";
import "../Styles/Home.css";

type Produto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
};

type Props = {
  sair: () => void;
};

function Home({ sair }: Props) {
  const [carregando, setCarregando] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);

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

  return (
    <div className="home">
      {carregando && (
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Saindo...</p>
        </div>
      )}

      <div className="home-content">
        <h1>Bem-vindo! 👋</h1>

        <h2>Produtos</h2>

        <div className="produtos-container">
          {produtos.length === 0 ? (
            <p>Nenhum produto disponível.</p>
          ) : (
            produtos.map((produto) => (
              <div className="produto-card" key={produto.id}>
                <h3>{produto.nome}</h3>

                <p>{produto.descricao}</p>

                <strong>
                  {produto.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </strong>
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
    </div>
  );
}

export default Home;
