import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, Layout, Button } from "antd";
import { jwtDecode } from "jwt-decode";

// import { HomeOutlined, AppstoreOutlined, ShoppingCartOutlined, SettingOutlined } from "@ant-design/icons";
// import Footer from "../components/Footer"; // Importa el Footer (v1)
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
    FileTextOutlined
  } from "@ant-design/icons";

  import logo from "../assets/logo.png"; // Asegúrate de que la ruta del logo sea correcta

const { Header, Sider, Content } = Layout;

const AppLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation(); // Obtener la ruta actual
  const navigate = useNavigate(); // Usamos navigate para redirigir al usuario
  const [userRole, setUserRole] = useState(null); // Estado para almacenar el rol del usuario
  const [isLoading, setIsLoading] = useState(true); // Estado de carga mientras obtenemos el rol

  // Verificar el rol al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);    // Decodificamos el token
        setUserRole(decoded.role);            // Asumimos que el rol está en decoded.role
        console.log("Rol decodificado:", decoded.role);  // Verifica que el rol se decodifica correctamente
      } catch (error) {
        console.error("Error al decodificar el token:", error);
      }
    }
    setIsLoading(false);  // Actualizamos el estado de carga una vez procesado el token
  }, []);

  // Función de cerrar sesión
  const handleLogout = () => {
    // Elimina el token o cualquier otro dato de sesión (como JWT)
    localStorage.removeItem("token"); // O sessionStorage, según corresponda
    navigate("/login");     // Redirige al usuario a la página de login
  };

  // Función para ir a la página anterior
  const goBack = () => {
    navigate(-1); // Navega hacia la página anterior
  };

  // Verificar si la ruta es de las páginas donde no quieres mostrar la barra lateral
  const showSider = !["/login", "/register", "/welcome", "/"].includes(location.pathname);

  // Mostrar el menu lateral solo si el rol es admin o superadmin
  const showAdminMenu = userRole === "Admin" || userRole === "Superadmin";

  if (isLoading) {
    return <div>Cargando...</div>;  // Muestra algo mientras se carga el estado
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Menú lateral */}
      {/* Menú lateral solo si la ruta no es login, register o welcome */}
      {showSider && (
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} style={{ background: "#D32F2F" }}>
      <div className="logo" style={{ color: "white", textAlign: "center", padding: "20px", fontSize: "20px" }}>
          {/* Logo en el Sidebar */}
          <img src={logo} alt="Logo" style={{ width: "120px", marginBottom: "10px" }} /> {/* Aumenté el tamaño del logo */}
          <div style={{ fontSize: "24px" }}>FG Cortinas</div> {/* Aumenté el tamaño de la fuente */}
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>

          <Menu.Item key="1" icon={<HomeOutlined />}>
            <Link to="/dashboard">Inicio</Link>
          </Menu.Item>

          <Menu.Item key="2" icon={<UnorderedListOutlined />}>
            <Link to="/product-types">Tipos de productos</Link>
          </Menu.Item>

          <Menu.Item key="3" icon={<AppstoreOutlined />}>
            <Link to="/products">Productos</Link>
          </Menu.Item>

          <Menu.Item key="4" icon={<ShoppingCartOutlined />}>
            <Link to="/order">Pedidos</Link>
          </Menu.Item>

          {/* Mostrar el menú de "Usuarios" solo si el rol es admin o superadmin */}
          {showAdminMenu && (
              <Menu.Item key="5" icon={<UserOutlined />}>
                <Link to="/users">Usuarios</Link>
              </Menu.Item>
          )}

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

          {/* Sección de Administrador */}
          {/* Mostrar el menú de administración solo si el rol es admin o superadmin */}
          {showAdminMenu && (
              <Menu.Item key="10" icon={<SettingOutlined />}>
                <Link to="/admin">Admin</Link>
              </Menu.Item>
            )}
        </Menu>
      </Sider>
      )}

      <Layout>
        {/* Barra de navegación superior */}
        <Header style={{ background: "#D32F2F", padding: "0 20px", color: "white", fontSize: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        
        {/* Texto centrado */}
        <div style={{
            flex: 1, // Esto hace que ocupe todo el espacio disponible
            textAlign: "center", // Alineamos el texto al centro
            paddingLeft: "180px", // Ajuste para mover el texto más a la derecha
          }}>
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
              onClick={handleLogout}
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
        <Content style={{ margin: "20px", padding: "20px", background: "white", borderRadius: "10px" }}>
          {children}
        </Content>

        {/* Footer siempre visible */}
        <AppFooter />
      </Layout>
    </Layout>
  );
};

export default AppLayout;
