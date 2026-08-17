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
  imagem: string;
};

type Usuario = {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  tipo?: "admin" | "usuario";
};

function Admin({ sair }: Props) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [imagem, setImagem] = useState("");
  const [produtoAnimando, setProdutoAnimando] = useState<number | null>(null);
  const [fechandoFormulario, setFechandoFormulario] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [produtoAdicionado, setProdutoAdicionado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);

  function handleSair() {
    setCarregando(true);

    setTimeout(() => {
      sair();
    }, 2500);
  }

  useEffect(() => {
    const dadosProdutos = localStorage.getItem("produtos");
    const produtosSalvos = dadosProdutos ? JSON.parse(dadosProdutos) : [];

    setProdutos(produtosSalvos);

    const dadosUsuarios = localStorage.getItem("usuarios");
    const usuariosSalvos = dadosUsuarios ? JSON.parse(dadosUsuarios) : [];

    setUsuarios(usuariosSalvos);

    const dadosUsuarioLogado = localStorage.getItem("usuarioLogado");

    if (dadosUsuarioLogado) {
      setUsuarioLogado(JSON.parse(dadosUsuarioLogado));
    }
  }, []);

  function abrirFormulario() {
    setEditandoId(null);

    setNome("");
    setDescricao("");
    setPreco("");
    setImagem("");

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
      setImagem("");
      setEditandoId(null);
    }, 400);
  }

  function adicionarImagem(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];

    if (!arquivo) {
      return;
    }

    const leitor = new FileReader();

    leitor.onloadend = () => {
      setImagem(leitor.result as string);
    };

    leitor.readAsDataURL(arquivo);
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
      imagem: imagem,
    };

    produtosSalvos.push(novoProduto);

    localStorage.setItem("produtos", JSON.stringify(produtosSalvos));

    setProdutos(produtosSalvos);

    setProdutoAdicionado(true);

    setProdutoAnimando(novoProduto.id);

    setNome("");
    setDescricao("");
    setPreco("");
    setImagem("");

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

    setImagem(produto.imagem || "");

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
          imagem: imagem,
        };
      }

      return produto;
    });

    localStorage.setItem("produtos", JSON.stringify(produtosAtualizados));

    setProdutos(produtosAtualizados);

    setNome("");
    setDescricao("");
    setPreco("");
    setImagem("");

    setEditandoId(null);

    fecharFormulario();
  }

  return (
    <div className="admin">
      {carregando && (
        <div className="loading-screen admin-exit-screen">
          <div className="loader"></div>
          <p>Saindo</p>
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

            <input type="file" accept="image/*" onChange={adicionarImagem} />

            {imagem && (
              <div className="preview-imagem-container">
                <img
                  src={imagem}
                  alt="Prévia do produto"
                  className="preview-produto"
                />
              </div>
            )}

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
                  {produto.imagem && (
                    <img
                      src={produto.imagem}
                      alt={produto.nome}
                      className="produto-imagem-admin"
                    />
                  )}

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
        <div className="usuarios-admin">
          <h2>Usuários cadastrados</h2>

          {usuarios.length === 0 ? (
            <p>Nenhum usuário cadastrado.</p>
          ) : (
            <div className="usuarios-lista">
              {usuarios.map((usuario) => {
                const estaLogado =
                  usuarioLogado !== null && usuarioLogado.id === usuario.id;

                return (
                  <div
                    className={`usuario-admin ${
                      estaLogado ? "usuario-logado" : ""
                    }`}
                    key={usuario.id}
                  >
                    <div className="usuario-info">
                      <div className="usuario-avatar">
                        {usuario.nome.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3>{usuario.nome}</h3>

                        <p>{usuario.email}</p>

                        <span className="usuario-tipo">
                          {usuario.tipo === "admin"
                            ? "Administrador"
                            : "Usuário"}
                        </span>
                      </div>
                    </div>

                    <div className="usuario-status">
                      {estaLogado ? (
                        <span className="status-online">
                          <span className="status-bolinha"></span>
                          Logado agora
                        </span>
                      ) : (
                        <span className="status-offline">Não logado</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
