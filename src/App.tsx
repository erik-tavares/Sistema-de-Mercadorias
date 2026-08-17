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
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [saindo, setSaindo] = useState(false);
  const [loginEntrando, setLoginEntrando] = useState(false);
  const [pagina, setPagina] = useState<
    "login" | "user" | "home" | "admin" | "CreateUser"
  >("login");
  const nodeRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

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
    const dados = localStorage.getItem("usuarios");
    const usuarios = dados ? JSON.parse(dados) : [];
    const adminExiste = usuarios.some(
      (usuario: any) =>
        usuario.email === "admin@email.com" && usuario.tipo === "admin",
    );

    if (!adminExiste) {
      const admin = {
        nome: "Administrador",
        email: "admin@email.com",
        senha: "123456",
        tipo: "admin",
      };

      usuarios.push(admin);
      localStorage.setItem("usuarios", JSON.stringify(usuarios));
      console.log("Administrador criado automaticamente.");
    }
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
      <button className="theme-button" onClick={() => setDark(!dark)}>
        {dark ? <FaRegMoon size={20} /> : <FaMoon size={20} />}
      </button>

      <SwitchTransition mode="out-in">
        <CSSTransition
          key={pagina}
          timeout={400}
          classNames="fade"
          nodeRef={nodeRef}
        >
          <div ref={nodeRef} className={pagina === "login" && loginEntrando ? "login-entrando" : ""}>
            {pagina === "login" && (
              <Login
                irParaCadastro={() => setPagina("CreateUser")}
                irParaHome={() => setPagina("home")}
                irParaAdmin={() => setPagina("admin")}
              />
            )}

            {/* CADASTRO */}
            {pagina === "CreateUser" && (
              <CreateUser voltar={() => setPagina("login")} />
            )}

            {/* HOME DO CLIENTE */}
            {pagina === "home" && (
              <Home
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
            {pagina === "admin" && <Admin sair={() => setPagina("login")} />}

            {/* USUÁRIOS */}
            {pagina === "user" && <Users />}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}

export default App;
