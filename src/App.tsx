import { useEffect, useState, useRef } from "react";
import Login from "./Login/Login";
import "./Styles/App.css";
import { FaMoon } from "react-icons/fa";
import { FaRegMoon } from "react-icons/fa6";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import CreateUser from "./CreateUser/CreateUser";
import Home from "./Home/Home";
import Users from "./Users/user";

function App() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [pagina, setPagina] = useState<
    "login" | "user" | "home" | "CreateUser"
  >("login");

  const nodeRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

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
          <div ref={nodeRef}>
            {pagina === "login" && (
              <Login
                irParaCadastro={() => setPagina("CreateUser")}
                irParaHome={() => setPagina("home")}
              />
            )}

            {pagina === "CreateUser" && (
              <CreateUser voltar={() => setPagina("login")} />
            )}

            {pagina === "home" && <Home sair={() => setPagina("login")} />}

            {pagina === "user" && <Users />}
          </div>
        </CSSTransition>
      </SwitchTransition>
    </div>
  );
}

export default App;
