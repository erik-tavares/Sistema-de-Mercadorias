import { useEffect, useState, useRef } from "react";
import Login from "./Login/Login";
import "./Styles/App.css";
import { FaMoon } from "react-icons/fa";
import { FaRegMoon } from "react-icons/fa6";
import {
  FaChevronDown,
  FaHome,
  FaHistory,
  FaShieldAlt,
  FaShoppingCart,
} from "react-icons/fa";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import CreateUser from "./CreateUser/CreateUser";
import Home from "./Home/Home";
import Users from "./Users/user";
import Admin from "./Admin/Admin";

type ProdutoCarrinho = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem: string;
};

type ItemCarrinho = {
  produto: ProdutoCarrinho;
  quantidade: number;
};

type CarrinhoGlobalProps = {
  aberto: boolean;
  carrinho: ItemCarrinho[];
  onCarrinhoChange: (carrinho: ItemCarrinho[]) => void;
  onFechar: () => void;
};

function CarrinhoGlobal({
  aberto,
  carrinho,
  onCarrinhoChange,
  onFechar,
}: CarrinhoGlobalProps) {
  const [fechando, setFechando] = useState(false);

  if (!aberto && !fechando) {
    return null;
  }

  const quantidade = carrinho.reduce(
    (total, item) => total + item.quantidade,
    0,
  );
  const total = carrinho.reduce(
    (valor, item) => valor + item.produto.preco * item.quantidade,
    0,
  );

  function fechar() {
    setFechando(true);
    window.setTimeout(() => {
      setFechando(false);
      onFechar();
    }, 300);
  }

  function atualizarQuantidade(id: number, variacao: number) {
    onCarrinhoChange(
      carrinho
        .map((item) =>
          item.produto.id === id
            ? { ...item, quantidade: item.quantidade + variacao }
            : item,
        )
        .filter((item) => item.quantidade > 0),
    );
  }

  function remover(id: number) {
    onCarrinhoChange(carrinho.filter((item) => item.produto.id !== id));
  }

  return (
    <div className={`carrinho-overlay ${fechando ? "fechando" : ""}`}>
      <div className={`carrinho-lateral ${fechando ? "fechando" : ""}`}>
        <div className="cabecalho-carrinho">
          <div>
            <h2>🛒 Meu carrinho</h2>
            <span>
              {quantidade} {quantidade === 1 ? "item" : "itens"}
            </span>
          </div>
          <button
            type="button"
            className="botao-fechar-carrinho"
            onClick={fechar}
            aria-label="Fechar carrinho"
          >
            ×
          </button>
        </div>

        {carrinho.length === 0 ? (
          <div className="carrinho-vazio">
            <span>🛒</span>
            <h2>Seu carrinho está vazio</h2>
            <p>Adicione alguns produtos para começar suas compras.</p>
            <button
              type="button"
              className="botao-continuar-comprando"
              onClick={fechar}
            >
              Continuar comprando
            </button>
          </div>
        ) : (
          <>
            <div className="itens-carrinho">
              {carrinho.map((item) => (
                <div className="item-carrinho" key={item.produto.id}>
                  <div className="item-carrinho-imagem">
                    {item.produto.imagem ? (
                      <img src={item.produto.imagem} alt={item.produto.nome} />
                    ) : (
                      <span>📦</span>
                    )}
                  </div>
                  <div className="item-carrinho-info">
                    <h3>{item.produto.nome}</h3>
                    <strong>
                      {item.produto.preco.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </strong>
                    <div className="controle-quantidade">
                      <button
                        type="button"
                        onClick={() => atualizarQuantidade(item.produto.id, -1)}
                      >
                        −
                      </button>
                      <span>{item.quantidade}</span>
                      <button
                        type="button"
                        onClick={() => atualizarQuantidade(item.produto.id, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="botao-remover-carrinho"
                    onClick={() => remover(item.produto.id)}
                    aria-label={`Remover ${item.produto.nome}`}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            <div className="resumo-carrinho">
              <div className="linha-resumo">
                <span>Itens</span>
                <strong>{quantidade}</strong>
              </div>
              <div className="linha-resumo total-carrinho">
                <span>Total</span>
                <strong>
                  {total.toLocaleString("pt-BR", {
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
  );
}

function App() {
  const [dark, setDark] = useState(false);
  const [salvandoTema, setSalvandoTema] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [loginEntrando, setLoginEntrando] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);
  const [painelGlobal, setPainelGlobal] = useState<"conta" | "historico" | null>(null);
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [nomePerfil, setNomePerfil] = useState("");
  const [fotoPerfil, setFotoPerfil] = useState("");
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [erroPerfil, setErroPerfil] = useState("");
  const [visualizandoFotoPerfil, setVisualizandoFotoPerfil] = useState(false);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [opcaoCabecalhoAtiva, setOpcaoCabecalhoAtiva] = useState<
    "inicio" | "admin" | "historico" | "carrinho" | "conta"
  >("inicio");
  const [pagina, setPagina] = useState<
    "login" | "user" | "home" | "admin" | "historico" | "CreateUser"
  >("login");
  const nodeRef = useRef(null);
  const menuUsuarioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fecharMenuAoClicarFora(evento: MouseEvent) {
      if (
        menuUsuarioAberto &&
        menuUsuarioRef.current &&
        !menuUsuarioRef.current.contains(evento.target as Node)
      ) {
        setMenuUsuarioAberto(false);
      }
    }

    document.addEventListener("mousedown", fecharMenuAoClicarFora);

    return () =>
      document.removeEventListener("mousedown", fecharMenuAoClicarFora);
  }, [menuUsuarioAberto]);

  useEffect(() => {
    if (usuarioLogado?.theme) {
      setDark(usuarioLogado.theme === "dark");
    }
  }, [usuarioLogado]);

  useEffect(() => {
    if (!usuarioLogado?.id) {
      return;
    }

    async function enviarHeartbeat() {
      try {
        await fetch("http://localhost:3000/api/users/heartbeat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: usuarioLogado.id }),
        });
      } catch (error) {
        console.error("Erro ao atualizar presença do usuário:", error);
      }
    }

    enviarHeartbeat();
    const intervalo = window.setInterval(enviarHeartbeat, 15000);

    return () => window.clearInterval(intervalo);
  }, [usuarioLogado?.id]);

  async function fazerLogout() {
    if (usuarioLogado?.id) {
      try {
        await fetch("http://localhost:3000/api/users/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: usuarioLogado.id }),
        });
      } catch (error) {
        console.error("Erro ao registrar saída do usuário:", error);
      }
    }

    setUsuarioLogado(null);
    setCarrinho([]);
    setCarrinhoAberto(false);
  }

  function abrirPainelGlobal(painel: "conta" | "historico") {
    setMenuUsuarioAberto(false);
    setOpcaoCabecalhoAtiva(painel);

    if (painel === "historico") {
      setPainelGlobal(null);
      setCarrinhoAberto(false);
      setPagina("historico");
      return;
    }

    setPainelGlobal("conta");

    if (painel === "conta") {
      setNomePerfil(usuarioLogado?.nome || "");
      setFotoPerfil(usuarioLogado?.fotoPerfil || "");
      setEditandoPerfil(false);
      setErroPerfil("");
    }
  }

  function selecionarFotoPerfil(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];

    if (!arquivo) {
      return;
    }

    if (!arquivo.type.startsWith("image/")) {
      setErroPerfil("Selecione um arquivo de imagem válido.");
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      setErroPerfil("A imagem deve ter no máximo 5 MB.");
      return;
    }

    const leitor = new FileReader();
    leitor.onloadend = () => {
      setFotoPerfil(String(leitor.result || ""));
      setErroPerfil("");
    };
    leitor.readAsDataURL(arquivo);
  }

  async function salvarPerfil() {
    if (!usuarioLogado?.id || !nomePerfil.trim()) {
      setErroPerfil("Informe um nome para salvar o perfil.");
      return;
    }

    setSalvandoPerfil(true);
    setErroPerfil("");

    try {
      const resposta = await fetch(
        `http://localhost:3000/api/users/${usuarioLogado.id}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ nome: nomePerfil, fotoPerfil }),
        },
      );

      const usuarioAtualizado = await resposta.json();

      if (!resposta.ok) {
        setErroPerfil(usuarioAtualizado.error || "Não foi possível salvar o perfil.");
        return;
      }

      setUsuarioLogado(usuarioAtualizado);
      setEditandoPerfil(false);
    } catch (error) {
      setErroPerfil("Não foi possível conectar ao servidor.");
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function sairPeloCabecalho() {
    setMenuUsuarioAberto(false);
    setSaindo(true);
    await fazerLogout();

    window.setTimeout(() => {
      setPagina("login");
      setSaindo(false);
    }, 1500);
  }

  function abrirCarrinhoGlobal() {
    setOpcaoCabecalhoAtiva("carrinho");
    setCarrinhoAberto(true);
  }

  useEffect(() => {
    async function carregarTemaSalvo() {
      try {
        const resposta = await fetch("http://localhost:3000/api/users");

        if (!resposta.ok) {
          return;
        }

        const usuarios = await resposta.json();
        const usuarioSalvo = usuarios.find(
          (usuario: any) => Boolean(usuario.rememberedEmail),
        );

        if (!usuarioSalvo || !usuarioSalvo.theme) {
          return;
        }

        setDark(usuarioSalvo.theme === "dark");
      } catch (error) {
        console.error("Erro ao carregar tema salvo:", error);
      }
    }

    carregarTemaSalvo();
  }, []);

  useEffect(() => {
    if (pagina === "login") {
      setLoginEntrando(true);
      const timer = window.setTimeout(() => {
        setLoginEntrando(false);
      }, 600);

      return () => window.clearTimeout(timer);
    }
  }, [pagina]);

  useEffect(() => {
    async function garantirAdmin() {
      try {
        const resposta = await fetch("http://localhost:3000/api/users");

        if (!resposta.ok) {
          return;
        }

        const usuarios = await resposta.json();
        const adminExiste = usuarios.some(
          (usuario: any) =>
            usuario.email === "admin@email.com" && usuario.tipo === "admin",
        );

        if (!adminExiste) {
          await fetch("http://localhost:3000/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              nome: "Administrador",
              email: "admin@email.com",
              senha: "123456",
              tipo: "admin",
            }),
          });

          console.log("Administrador criado automaticamente no banco.");
        }
      } catch (error) {
        console.error("Erro ao garantir usuário admin:", error);
      }
    }

    garantirAdmin();
  }, []);

  if (saindo) {
    return (
      <div className={dark ? "dark" : "light"}>
        <div className="loading-screen app-exit-screen">
          <div className="loader"></div>
          <p>Saindo</p>
        </div>
      </div>
    );
  }

  return (
    <div className={dark ? "dark" : "light"}>
      <button
        className="theme-button"
        disabled={salvandoTema}
        onClick={async () => {
          if (salvandoTema) {
            return;
          }

          const proximoTema = dark ? "light" : "dark";
          const proximoValorDark = !dark;
          setDark(proximoValorDark);
          setSalvandoTema(true);

          try {
            const respostaUsuarios = await fetch("http://localhost:3000/api/users");

            if (!respostaUsuarios.ok) {
              return;
            }

            const usuarios = await respostaUsuarios.json();
            const usuarioTema =
              usuarios.find((usuario: any) => usuario.id === usuarioLogado?.id) ||
              usuarios.find((usuario: any) => Boolean(usuario.rememberedEmail)) ||
              usuarios.find((usuario: any) => usuario.email === "admin@email.com");

            if (!usuarioTema) {
              return;
            }

            const respostaTema = await fetch(
              `http://localhost:3000/api/users/${usuarioTema.id}/theme`,
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ theme: proximoTema }),
              },
            );

            if (!respostaTema.ok) {
              throw new Error("Falha ao salvar tema");
            }

            setUsuarioLogado((prev: any) =>
              prev ? { ...prev, theme: proximoTema } : { ...usuarioTema, theme: proximoTema },
            );
          } catch (error) {
            console.error("Erro ao salvar tema no banco:", error);
          } finally {
            setSalvandoTema(false);
          }
        }}
      >
        {dark ? <FaRegMoon size={20} /> : <FaMoon size={20} />}
      </button>

      {usuarioLogado && pagina !== "login" && pagina !== "CreateUser" && (
        <header className="cabecalho-global">
          <button
            type="button"
            className="marca-global"
            onClick={() => {
              setPagina("home");
              setPainelGlobal(null);
              setCarrinhoAberto(false);
              setOpcaoCabecalhoAtiva("inicio");
            }}
          >
            Mercado Livre
          </button>

          <nav className="navegacao-global" aria-label="Navegação principal">
            <button
              type="button"
              className={opcaoCabecalhoAtiva === "inicio" ? "opcao-global-ativa" : ""}
              onClick={() => {
                setPagina("home");
                setPainelGlobal(null);
                setCarrinhoAberto(false);
                setOpcaoCabecalhoAtiva("inicio");
              }}
            >
              <FaHome />
              Início
            </button>

            {usuarioLogado.tipo === "admin" && (
              <button
                type="button"
                className={opcaoCabecalhoAtiva === "admin" ? "opcao-global-ativa" : ""}
                onClick={() => {
                  setPagina("admin");
                  setPainelGlobal(null);
                  setCarrinhoAberto(false);
                  setOpcaoCabecalhoAtiva("admin");
                }}
              >
                <FaShieldAlt />
                Administração
              </button>
            )}

            <button
              type="button"
              className={opcaoCabecalhoAtiva === "historico" ? "opcao-global-ativa" : ""}
              onClick={() => abrirPainelGlobal("historico")}
            >
              <FaHistory />
              Histórico de compras
            </button>

            <button
              type="button"
              className={`botao-carrinho-global ${
                opcaoCabecalhoAtiva === "carrinho" ? "opcao-global-ativa" : ""
              }`}
              onClick={abrirCarrinhoGlobal}
            >
              <span className="icone-carrinho-global">
                <FaShoppingCart />
                {carrinho.reduce((total, item) => total + item.quantidade, 0) > 0 && (
                  <span className="contador-carrinho-global">
                    {carrinho.reduce((total, item) => total + item.quantidade, 0)}
                  </span>
                )}
              </span>
              Carrinho
            </button>
          </nav>

          <div className="menu-usuario-global" ref={menuUsuarioRef}>
            <button
              type="button"
              className={`botao-usuario-global ${
                opcaoCabecalhoAtiva === "conta" ? "opcao-global-ativa" : ""
              }`}
              aria-expanded={menuUsuarioAberto}
              onClick={() => setMenuUsuarioAberto((aberto) => !aberto)}
            >
              {usuarioLogado.fotoPerfil ? (
                <img src={usuarioLogado.fotoPerfil} alt="" className="avatar-global" />
              ) : (
                <span className="avatar-global avatar-inicial-global">
                  {(usuarioLogado.nome || usuarioLogado.email || "U")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              )}
              <span>{usuarioLogado.nome || usuarioLogado.email}</span>
              <FaChevronDown className={menuUsuarioAberto ? "rotacionado" : ""} />
            </button>

            {menuUsuarioAberto && (
              <div className="dropdown-usuario-global">
                <button
                  type="button"
                  className={opcaoCabecalhoAtiva === "conta" ? "opcao-global-ativa" : ""}
                  onClick={() => abrirPainelGlobal("conta")}
                >
                  <span className="avatar-menu-inicial">
                    {(usuarioLogado.nome || usuarioLogado.email || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </span>
                  Minha conta
                </button>
                <button type="button" onClick={sairPeloCabecalho}>
                  Sair
                </button>
              </div>
            )}
          </div>
        </header>
      )}

      <SwitchTransition mode="out-in">
        <CSSTransition
          key={pagina}
          timeout={400}
          classNames="fade"
          nodeRef={nodeRef}
        >
          <div
            ref={nodeRef}
            className={
              pagina === "login" && loginEntrando ? "login-entrando" : ""
            }
          >
            {pagina === "login" && (
              <Login
                irParaCadastro={() => setPagina("CreateUser")}
                irParaHome={() => {
                  setPagina("home");
                  setOpcaoCabecalhoAtiva("inicio");
                }}
                irParaAdmin={() => {
                  setPagina("admin");
                  setOpcaoCabecalhoAtiva("admin");
                }}
                onLogin={(usuario) => setUsuarioLogado(usuario)}
              />
            )}

            {/* CADASTRO */}
            {pagina === "CreateUser" && (
              <CreateUser voltar={() => setPagina("login")} />
            )}

            {/* HOME DO CLIENTE */}
            {pagina === "home" && (
              <Home
                usuarioLogado={usuarioLogado}
                onLogout={fazerLogout}
                carrinho={carrinho}
                onCarrinhoChange={setCarrinho}
                sair={() => {
                  setTimeout(() => {
                    setPagina("login");
                    setSaindo(false);
                  }, 1500);
                }}
                onInicioSaida={() => setSaindo(true)}
              />
            )}

            {/* PAINEL DO ADMIN */}
            {pagina === "admin" && (
              <Admin
                usuarioLogado={usuarioLogado}
                onLogout={fazerLogout}
                sair={() => setPagina("login")}
              />
            )}

            {pagina === "historico" && (
              <main className="historico-pagina-global">
                <div className="historico-cabecalho-global">
                  <div>
                    <span className="historico-etiqueta-global">PEDIDOS</span>
                    <h1>Histórico de compras</h1>
                    <p>Acompanhe suas compras realizadas nesta conta.</p>
                  </div>
                  <FaHistory className="historico-icone-global" />
                </div>

                <section className="historico-lista-global" aria-label="Lista de compras">
                  <div className="historico-vazio-global">
                    <FaHistory />
                    <h2>Nenhuma compra registrada</h2>
                    <p>Quando você finalizar uma compra, ela aparecerá aqui.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setPagina("home");
                        setOpcaoCabecalhoAtiva("inicio");
                      }}
                    >
                      Ver produtos
                    </button>
                  </div>
                </section>
              </main>
            )}

            {/* USUÁRIOS */}
            {pagina === "user" && <Users />}
          </div>
        </CSSTransition>
      </SwitchTransition>

      <CarrinhoGlobal
        aberto={carrinhoAberto}
        carrinho={carrinho}
        onCarrinhoChange={setCarrinho}
        onFechar={() => {
          setCarrinhoAberto(false);
          setOpcaoCabecalhoAtiva(
            pagina === "admin"
              ? "admin"
              : pagina === "historico"
                ? "historico"
                : "inicio",
          );
        }}
      />

      {painelGlobal && (
        <div className="painel-global-overlay" role="presentation">
          <section className="painel-global" role="dialog" aria-modal="true">
            <button
              type="button"
              className="fechar-painel-global"
              aria-label="Fechar painel"
              onClick={() => {
                setPainelGlobal(null);
                setOpcaoCabecalhoAtiva(
                  pagina === "admin"
                    ? "admin"
                    : pagina === "historico"
                      ? "historico"
                      : "inicio",
                );
              }}
            >
              ×
            </button>

            <>
                <div className="perfil-cabecalho-global">
                  {fotoPerfil ? (
                    <img src={fotoPerfil} alt="Prévia do perfil" className="avatar-perfil-global" />
                  ) : (
                    <span className="avatar-perfil-global avatar-inicial-perfil-global">
                      {(usuarioLogado?.nome || usuarioLogado?.email || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                  <div>
                    <h2>Minha conta</h2>
                    <span>{usuarioLogado?.email}</span>
                  </div>
                </div>

                {editandoPerfil ? (
                  <div className="formulario-perfil-global">
                    <label htmlFor="nome-perfil">Nome</label>
                    <input
                      id="nome-perfil"
                      value={nomePerfil}
                      onChange={(evento) => setNomePerfil(evento.target.value)}
                      placeholder="Seu nome"
                    />

                    <label htmlFor="foto-perfil">Foto de usuário</label>
                    <input
                      id="foto-perfil"
                      type="file"
                      accept="image/*"
                      onChange={selecionarFotoPerfil}
                    />

                    {erroPerfil && <p className="erro-perfil-global">{erroPerfil}</p>}

                    <div className="acoes-perfil-global">
                      <button type="button" onClick={salvarPerfil} disabled={salvandoPerfil}>
                        {salvandoPerfil ? "Salvando..." : "Salvar perfil"}
                      </button>
                      <button type="button" onClick={() => setEditandoPerfil(false)}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p>{usuarioLogado?.nome}</p>
                    <small>
                      Tipo de acesso: {usuarioLogado?.tipo === "admin" ? "Administrador" : "Usuário"}
                    </small>
                    {fotoPerfil && (
                      <button
                        type="button"
                        className="botao-visualizar-foto-global"
                        onClick={() => setVisualizandoFotoPerfil(true)}
                      >
                        Visualizar foto
                      </button>
                    )}
                    <button
                      type="button"
                      className="botao-editar-perfil-global"
                      onClick={() => {
                        setEditandoPerfil(true);
                        setOpcaoCabecalhoAtiva("conta");
                      }}
                    >
                      Editar perfil
                    </button>
                  </>
                )}
            </>
          </section>
        </div>
      )}

      {visualizandoFotoPerfil && fotoPerfil && (
        <div className="foto-perfil-overlay" role="presentation">
          <section className="visualizador-foto-perfil" role="dialog" aria-modal="true">
            <button
              type="button"
              className="fechar-painel-global"
              aria-label="Fechar visualização da foto"
              onClick={() => setVisualizandoFotoPerfil(false)}
            >
              ×
            </button>
            <img
              src={fotoPerfil}
              alt={`Foto de perfil de ${usuarioLogado?.nome || "usuário"}`}
            />
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
