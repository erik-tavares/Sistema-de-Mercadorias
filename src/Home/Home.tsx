import { useState } from "react";
import "../Styles/Home.css";

type Props = {
  sair: () => void;
};

function Home({ sair }: Props) {
  const [carregando, setCarregando] = useState(false);

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

        <button
          className="botao-sair"
          onClick={handleSair}
          disabled={carregando}
        >
          Sair
        </button>
      </div>
    </div>
  );
}

export default Home;
