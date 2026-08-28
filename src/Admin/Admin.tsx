import { useEffect, useState } from "react";
import "../Styles/Admin.css";

type Props = {
  sair: () => void;
  usuarioLogado: Usuario | null;
  onLogout: () => void;
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

function Admin({ sair, usuarioLogado, onLogout }: Props) {
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
  const [carregandoDados, setCarregandoDados] = useState(true);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  function handleSair() {
    setCarregando(true);

    setTimeout(() => {
      onLogout();
      sair();
    }, 2500);
  }

  useEffect(() => {
    async function carregarDados() {
      setCarregandoDados(true);

      try {
        const [produtosResponse, usuariosResponse] = await Promise.all([
          fetch("http://localhost:3000/api/products"),
          fetch("http://localhost:3000/api/users"),
        ]);

        const produtosSalvos = produtosResponse.ok
          ? await produtosResponse.json()
          : [];
        const usuariosSalvos = usuariosResponse.ok
          ? await usuariosResponse.json()
          : [];

        const produtosFormatados = produtosSalvos.map((produto: any) => ({
          ...produto,
          imagem: produto.imagem || "",
        }));

        const usuariosFormatados = usuariosSalvos.map((usuario: any) => ({
          id: usuario.id,
          nome: usuario.nome || usuario.name,
          email: usuario.email,
          tipo: usuario.tipo || "cliente",
        }));

        setProdutos(produtosFormatados);
        setUsuarios(usuariosFormatados);
      } catch (error) {
        console.error("Erro ao carregar dados do backend:", error);
      } finally {
        setCarregandoDados(false);
      }
    }

    carregarDados();
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

  async function adicionarProduto() {
    if (!nome.trim() || !descricao.trim() || !preco.trim()) {
      alert("Preencha todos os campos!");
      return;
    }

    const valorNumerico = Number(preco.replace(/\./g, "").replace(",", "."));

    if (isNaN(valorNumerico)) {
      alert("Digite um preço válido!");
      return;
    }

    try {
      const resposta = await fetch("http://localhost:3000/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          descricao: descricao.trim(),
          preco: valorNumerico,
          imagem,
        }),
      });

      const novoProduto = await resposta.json();

      if (!resposta.ok) {
        alert(novoProduto.error || "Erro ao criar produto.");
        return;
      }

      setProdutos((prev) => [...prev, {
        id: novoProduto.id,
        nome: novoProduto.nome,
        descricao: novoProduto.descricao,
        preco: Number(novoProduto.preco),
        imagem: novoProduto.imagem || "",
      }]);

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
    } catch (error) {
      alert("Não foi possível conectar ao servidor.");
    }
  }

  async function excluirProduto(id: number) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este produto?",
    );

    if (!confirmar) {
      return;
    }

    try {
      const resposta = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: "DELETE",
      });

      if (!resposta.ok) {
        alert("Erro ao excluir produto.");
        return;
      }

      setProdutos((prev) => prev.filter((produto) => produto.id !== id));
    } catch (error) {
      alert("Não foi possível conectar ao servidor.");
    }
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

  async function salvarEdicao() {
    if (!nome.trim() || !descricao.trim() || !preco.trim()) {
      alert("Preencha todos os campos!");
      return;
    }

    const valorNumerico = Number(preco.replace(/\./g, "").replace(",", "."));

    if (isNaN(valorNumerico)) {
      alert("Digite um preço válido!");
      return;
    }

    if (editandoId === null) {
      return;
    }

    try {
      const resposta = await fetch(`http://localhost:3000/api/products/${editandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome.trim(),
          descricao: descricao.trim(),
          preco: valorNumerico,
          imagem,
        }),
      });

      const produtoAtualizado = await resposta.json();

      if (!resposta.ok) {
        alert(produtoAtualizado.error || "Erro ao editar produto.");
        return;
      }

      setProdutos((prev) =>
        prev.map((produto) =>
          produto.id === editandoId
            ? {
                ...produto,
                nome: produtoAtualizado.nome,
                descricao: produtoAtualizado.descricao,
                preco: Number(produtoAtualizado.preco),
                imagem: produtoAtualizado.imagem || "",
              }
            : produto,
        ),
      );

      setNome("");
      setDescricao("");
      setPreco("");
      setImagem("");

      setEditandoId(null);

      fecharFormulario();
    } catch (error) {
      alert("Não foi possível conectar ao servidor.");
    }
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

          {carregandoDados && produtos.length === 0 ? (
            <p className="carregando-dados">Carregando produtos...</p>
          ) : produtos.length === 0 ? (
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

          {carregandoDados && usuarios.length === 0 ? (
            <p className="carregando-dados">Carregando usuários...</p>
          ) : usuarios.length === 0 ? (
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
