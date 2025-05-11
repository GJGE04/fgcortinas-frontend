import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Layout, Button, Avatar, Dropdown, Modal, Spin } from "antd";
// import { jwtDecode } from "jwt-decode";

// import { HomeOutlined, AppstoreOutlined, ShoppingCartOutlined, SettingOutlined } from "@ant-design/icons";
// import Footer from "../components/Footer"; // Importa el Footer (v1)
import "../css/layout.css";
import AppFooter from "../components/Footer"; // Importa el Footer mejorado
import { 
    HomeOutlined, 
    AppstoreOutlined, 
    UnorderedListOutlined, 
    ShoppingCartOutlined, 
    UserOutlined, 
    TeamOutlined, 
    CalendarOutlined, 
    FileDoneOutlined, 
    HistoryOutlined, 
    SettingOutlined,
    DollarOutlined,
    // FileTextOutlined
    MenuOutlined
  } from "@ant-design/icons";

import logo from "../assets/logo.png"; // Asegúrate de que la ruta del logo sea correcta
import { getUserRole, isAuthenticated, getUsername } from '../services/authService'; // Importa las funciones de authService

const { Header, Sider, Content } = Layout;

// const role = localStorage.getItem('role');
// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation(); // Obtener la ruta actual
  const navigate = useNavigate(); // Usamos navigate para redirigir al usuario
  const [userRole, setUserRole] = useState(null); // Estado para almacenar el rol del usuario
  const [isLoading, setIsLoading] = useState(true); // Estado de carga mientras obtenemos el rol
  const [username, setUsername] = useState("");

  // const showFooter = ["/dashboard", "/otra-pagina"].includes(location.pathname);
  // ✅ Lista de rutas donde el footer siempre debe mostrarse, incluso si el usuario está logueado
  const footerVisibleRoutes = ["/dashboard", "/login", "/", "/nosotros"];

  // ✅ Se evalúa si la ruta actual está en la lista
  // const showFooter = footerVisibleRoutes.includes(location.pathname);
  const showFooter = footerVisibleRoutes.some(route => location.pathname.startsWith(route));


/*
  // Verificar el rol al cargar el componente
  useEffect(() => {
    console.log("Entró!!");
    const token = localStorage.getItem("token");

    // Verificar si el token está en localStorage
    console.log("Token en localStorage:", token); 

    if (token) {
      try {
        const decoded = jwtDecode(token);    // Decodificamos el token
        console.log("Token decodificado:", decoded); // Verifica la estructura del JWT

        // Asegurarse de que el rol esté presente
        if (decoded && decoded.role) {
          setUserRole(decoded.role);  // Asumimos que el rol está en decoded.role
          console.log("Rol decodificado:", decoded.role);  // Verifica que el rol se decodifica correctamente
        } else {
          console.log("El token no contiene un campo 'role'");
        }
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    } else {
      console.log("No se encontró el token en el localStorage");
    }
    setIsLoading(false);  // Actualizamos el estado de carga una vez procesado el token
  }, []);*/

  /* v.0
  useEffect(() => {
    console.log("Ejecutando useEffect en AppLayout");
    const role = localStorage.getItem('role');
    console.log("Role desde localStorage:", role);
    if (role) {
      setUserRole(role);
    } else {
      setUserRole(null);
    }
    setIsLoading(false);
  }, []);
  */

  /* v.1  */
  useEffect(() => {
    console.log("Ejecutando useEffect de AppLayout");
    console.log("🔄 Cambió ruta:", location.pathname);
    
    const checkAuth = async () => {
      const isAuth = await isAuthenticated();     // Verifica si el token es válido
      console.log("isAuthenticated:", isAuth);
      if (isAuth) {
        const role = getUserRole();               // Obtén el rol del usuario
        const name = getUsername(); // 👈 obtenemos el nombre de usuario
        console.log("✅ Rol obtenido desde localStorage:", role);
        console.log("✅ Username:", name);
        setUserRole(role);                        // Guarda el rol del usuario en el estado
        setUsername(name); // 👈 lo guardamos en el estado
      } else {
        console.log("❌ Usuario no autenticado");
        setUserRole(null);
        setUsername("");
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [location.pathname]);  // ← ¡esto es clave! para re-ejecutar el efecto cada vez que cambie la ruta. Así nos aseguramos de que después del login (cuando cambia a /dashboard), se lea el localStorage.
/*
  if (isLoading) {
    return <div>Cargando...</div>;  // Muestra algo mientras se carga el estado
  } */

  if (isLoading) {
    return (
      <div style={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="Cargando usuario..." />
      </div>
    );
  }

  // Verificar si la ruta es de las páginas donde no quieres mostrar la barra lateral
  const showSider = !["/login", "/register", "/welcome", "/"].includes(location.pathname);

  // Mostrar el menu lateral solo si el rol es admin o superadmin
  const showAdminMenu = userRole === "Admin" || userRole === "Superadmin";
  console.log("userRole:", userRole); // Verifica el valor de userRole
  console.log("showAdminMenu =", showAdminMenu); // Verifica el valor de showAdminMenu

  // Función de cerrar sesión
  const handleLogout = () => {
    // Elimina el token de localStorage y redirige al login
    localStorage.removeItem("token"); 
    localStorage.removeItem('role');
    navigate("/login");                 // Redirige al usuario a la página de login
  };

  const confirmLogout = () => {
    Modal.confirm({
      title: "¿Seguro que quieres cerrar sesión?",
      onOk: handleLogout,
    }); 
  };  

  // Función para ir a la página anterior
  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);  // Navega hacia la página anterior
    } else {
      navigate("/dashboard");  // Redirige al dashboard si no hay historial
    }
  };  

  // Función para ir a la página inicial
  const goHomePage = () => {
    navigate("/register"); // Navega hacia la página anterior
  };

  // Función para ir a la página inicial
  const goChangePassword = () => {
    const token = localStorage.getItem("token");  
    if (token) {
      navigate("/change-password"); // Pasar el token como query param
    } else {
      navigate("/login"); // Si no hay token, redirigir al login
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>  
      {/* Menú lateral */}
      {/* Menú lateral solo si la ruta no es login, register o welcome */}
      {showSider && (
      <Sider 
        breakpoint="md"
        collapsedWidth={0}  // "0"
        collapsible 
        collapsed={collapsed} 
        // onCollapse={setCollapsed} 
        onCollapse={(val) => setCollapsed(val)}
        style={{ background: "#D32F2F" }}
      >
      <div className="logo" style={{ color: "white", textAlign: "center", padding: "20px", fontSize: "20px" }}>
          {/* Logo en el Sidebar */}
          <img src={logo} alt="Logo" style={{ width: "120px", marginBottom: "10px" }} /> {/* Aumenté el tamaño del logo */}
          <div style={{ fontSize: "24px" }}>FG Cortinas</div> {/* Aumenté el tamaño de la fuente */}
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]} onClick={() => {
          if (window.innerWidth < 768) setCollapsed(true);
        }}>
          <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to="/dashboard">Inicio</Link>
          </Menu.Item>

          <Menu.Item key="2" icon={<UnorderedListOutlined />}>
            <Link to="/product-types">Tipos de productos</Link>
          </Menu.Item>

          <Menu.Item key="3" icon={<AppstoreOutlined />}>
            <Link to="/products">Productos</Link>
          </Menu.Item>

          {/* Vendedor */}
          {userRole && (userRole === 'Admin' || userRole === 'Superadmin' || userRole === 'Vendedor') ? (
            <Menu.Item key="4" icon={<ShoppingCartOutlined />}>
              <Link to="/order">Pedidos</Link>
            </Menu.Item>
          ) : null}

          {/* Mostrar el menú de "Usuarios" solo si el rol es admin o superadmin */}
          {userRole === 'Admin' || userRole === 'Superadmin' ? (
              <Menu.Item key="5" icon={<UserOutlined />}>
                <Link to="/users">Usuarios</Link>
              </Menu.Item>
          ) : null}

          {/* Mostrar el menú de "Clientes" solo si el rol es admin o superadmin */}
          {(userRole === 'Admin' || userRole === 'Superadmin' || userRole === 'Editor' || userRole === 'Tecnico') && (
            <>
              <Menu.Item key="6" icon={<TeamOutlined />}>
                <Link to="/clients">Clientes</Link>
              </Menu.Item>
              <Menu.Item key="7" icon={<FileDoneOutlined />}>
                <Link to="/works">Trabajos</Link>
              </Menu.Item>
              <Menu.Item key="8" icon={<DollarOutlined />}>
                <Link to="/budgets">Presupuestos</Link>
              </Menu.Item>
              <Menu.Item key="9" icon={<HistoryOutlined />}>
                <Link to="/old-works">Trabajos Antiguos</Link>
              </Menu.Item>

              <Menu.Item key="10" icon={<CalendarOutlined />}>
                <Link to="/calendar">Calendario</Link>
              </Menu.Item>
            </>
          )}

          {/* Sección de Administrador */}
          {/* Mostrar el menú de administración solo si el rol es admin o superadmin */}
          {showAdminMenu && (
              <Menu.Item key="11" icon={<SettingOutlined />}>
                <Link to="/admin">Admin</Link>
              </Menu.Item>
            )}

            {/* Guest */} {/*
            {role === 'Guest' && (
              <Menu.Item key="12" icon={<UserOutlined />}>
                <Link to="/perfil">Mi Perfil</Link>
              </Menu.Item>
            )}  */}
            
        </Menu>
      </Sider>
      )}

      <Layout>
        {/* Barra de navegación superior */}
        <Header style={{ 
          background: "#D32F2F", 
          padding: "10px 20px", // padding: "0 20px",
          color: "white", 
          fontSize: "24px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          position: "relative",
          flexWrap: "wrap" 
          }}>  {/* 👈 importante para centrar realmente el título */}
        
        {/* Izquierda: Bienvenida con ícono */}
 {/*         <div style={{ minWidth: "220px", textAlign: "left", fontSize: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <UserOutlined style={{ fontSize: "18px", color: "white" }} />
            <span style={{ fontWeight: "500" }}>
              {userRole ? `Bienvenido, ` : ""}<strong>{username}</strong>
            </span>
          </div>
*/}

        {/* Izquierda: Avatar + Bienvenida + Dropdown */}
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="1" disabled>
                  Perfil (en construcción)
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="2" onClick={handleLogout}>
                  Cerrar sesión
                </Menu.Item>
              </Menu>
            }
            placement="bottomLeft"
            arrow
          >
            <div style={{ display: "flex", alignItems: "center", cursor: "pointer", gap: "10px" }}>
              {username ? (
                <>
                  <Avatar
                    style={{ backgroundColor: "#ffffff33", color: "#fff", fontWeight: "bold" }}>
                    {username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <span style={{ fontSize: "16px" }}>
                    Bienvenido, <strong>{username}</strong>
                  </span>
                </>
              ) : (
                <UserOutlined style={{ fontSize: "18px", color: "white" }} />
              )}
            </div>
          </Dropdown>

          {!showSider && (
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: "24px", color: "white" }} />}
              onClick={() => setCollapsed(false)}
              style={{ display: "block", marginRight: "auto" }}
            />
          )}


        {/* Centro: Texto centrado absolutamente */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              fontWeight: "bold",
              fontSize: "24px"
            }}
          >
            Gestión de Cortinas
          </div>

          {/* Contenedor de los botones alineados a la derecha */}
          {/* Botón de Cerrar sesión y enlace de retroceso */}
          <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
            <Button
              onClick={goBack}
              style={{
                background: "transparent",
                color: "white",
                border: "2px solid white",
                padding: "5px 15px",
                fontSize: "14px",
                borderRadius: "5px",
                display: "inline-flex",
                alignItems: "center",
                transition: "background 0.3s, color 0.3s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#F5F5F5";
                e.target.style.color = "#D32F2F";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "white";
              }}
            >
              Volver
            </Button>
            <Button
              onClick={goHomePage}
              style={{
                background: "transparent",
                color: "white",
                border: "2px solid white",
                padding: "5px 15px",
                fontSize: "14px",
                borderRadius: "5px",
                display: "inline-flex",
                alignItems: "center",
                transition: "background 0.3s, color 0.3s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#F5F5F5";
                e.target.style.color = "#D32F2F";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "white";
              }}
            >
              Registrarse
            </Button>

            <Button
              onClick={goChangePassword}
              style={{
                background: "transparent",
                color: "white",
                border: "2px solid white",
                padding: "5px 15px",
                fontSize: "14px",
                borderRadius: "5px",
                display: "inline-flex",
                alignItems: "center",
                transition: "background 0.3s, color 0.3s"
              }}
              disabled={!localStorage.getItem("token")} // Deshabilitar si no hay token
              onMouseEnter={(e) => {
                e.target.style.background = "#F5F5F5";
                e.target.style.color = "#D32F2F";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "white";
              }}
            >
              Cambiar contraseña
            </Button>

            <Button
              onClick={handleLogout}    // confirmLogout
              style={{
                background: "transparent",
                color: "white",
                border: "2px solid white",
                padding: "5px 15px",
                fontSize: "14px",
                borderRadius: "5px",
                display: "inline-flex",
                alignItems: "center",
                transition: "background 0.3s, color 0.3s"
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#F5F5F5";
                e.target.style.color = "#D32F2F";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "white";
              }}
            >
              Cerrar sesión
            </Button>
          </div>
        </Header>

        {/* Contenido de la página */}
        {/*<Content style={{ margin: "20px", padding: "20px", background: "white", borderRadius: "10px", 
        // Ajusta según la altura de Header. Version del scroll sin usar css
        //  height: "calc(100vh - 112px)",    //  → ajusta el alto para ocupar el resto de la pantalla quitando la altura del header (usa 112px o el valor real de tu header).
        //  overflowY: "auto"                 //  → habilita el scroll solo en el contenido.
        // }}> 
        //</Layout>  {children} 
        //</Content> */}

        {/* version del scroll usando css */}  
        <Content className="scrollable-content" >
          {children}
        </Content>
          

        {/* Footer siempre visible */}
        {/*<AppFooter /> */}

        {/* Footer solo visible si NO hay usuario logueado */}
        {(!userRole || showFooter) && <AppFooter />}
      </Layout>
    </Layout>
  );
};

export default AppLayout;
