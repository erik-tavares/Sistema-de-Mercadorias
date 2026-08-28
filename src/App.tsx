import { useEffect, useState, useRef } from "react";
import Login from "./Login/Login";
import "./Styles/App.css";
import { FaMoon } from "react-icons/fa";
import { FaRegMoon } from "react-icons/fa6";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import CreateUser from "./CreateUser/CreateUser";
import Home from "./Home/Home";
import Users from "./Users/user";
import Admin from "./Admin/Admin";

function App() {
  const [dark, setDark] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [loginEntrando, setLoginEntrando] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState<any>(null);
  const [pagina, setPagina] = useState<
    "login" | "user" | "home" | "admin" | "CreateUser"
  >("login");
  const nodeRef = useRef(null);

  useEffect(() => {
    if (usuarioLogado?.theme) {
      setDark(usuarioLogado.theme === "dark");
    }
  }, [usuarioLogado]);

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
        onClick={async () => {
          const proximoTema = dark ? "light" : "dark";
          const proximoValorDark = !dark;
          setDark(proximoValorDark);

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
          }
        }}
      >
        {dark ? <FaRegMoon size={20} /> : <FaMoon size={20} />}
      </button>

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
                }}
                irParaAdmin={() => {
                  setPagina("admin");
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
                onLogout={() => setUsuarioLogado(null)}
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
                onLogout={() => setUsuarioLogado(null)}
                sair={() => setPagina("login")}
              />
            )}

            {/* USUÁRIOS */}
            {pagina === "user" && <Users />}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}

export default App;
