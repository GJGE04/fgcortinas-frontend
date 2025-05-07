// Archivo principal de la app

// import logo from './logo.svg';
import './App.css';

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Importa React Router
import AppLayout from "./layouts/AppLayout";
import './styles.css';

import Register from './pages/Register';  // Asegúrate de que estos componentes estén importados
import LoginPage from './pages/LoginPage';
// import LoginPage from './pages/LoginPage2';
// import LoginPage from './pages/LoginPage1';
// import LoginComponent from './components/Login';

import DashboardPage from './pages/DashboardPage'; // Importa la página del Dashboard
import PrivateRoute from './components/PrivateRoute'; // Importa el PrivateRoute

// Importa las páginas y componentes
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import OrderPage from './pages/OrderPage';
import AdminPanel from './pages/AdminPanel';
import ProductTypesPage from './pages/ProductTypesPage';
// import ProductsPage from './pages/ProductsPage';  // usando mocks
import ProductsPage from './pages/ProductsPage2';
import ClientsPage from './pages/ClientsPage';
import WorksPage from './pages/WorksPage';
import OldWorksPage from './pages/OldWorksPage';
import UsersPage from './pages/UsersPage2';
import UsersForm from './components/UsersForm2';
import BudgetsPage from './pages/Budgets/BudgetsTable';

// Página para crear un usuario inicial
import CrearUsuarioInicial from './pages/CrearUsuarioInicial'; // Asegúrate de tener esta ruta
import ForgotPasswordPage from './pages/ForgotPasswordPage'; 

import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';

import CalendarPage from './pages/CalendarPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChangePasswordPage from './pages/ChangePasswordPage';

// import CalendarioVisitas from "./components/CalendarioVisitas"; // o tu ruta real


function App() {
  return (
    <Router>  {/* Envuelve todo en el Router */}
      <AppLayout> {/* Envuelve las rutas dentro del layout */}
        <Routes> {/* Define las rutas dentro del layout. Se reemplaza Switch con Routes */}

          <Route path="/register" element={<Register />} /> {/* Esta es la ruta de registro */}
          <Route path="/login" element={<LoginPage />} /> {/* Ruta para la página principal. Se usa 'element' en lugar de 'component' */}
          <Route exact path="/dashboard" element={<DashboardPage />} /> {/* Usa PrivateRoute para proteger el Dashboard */}

          <Route path="/create-initial-user" element={<CrearUsuarioInicial />} /> {/* Ruta para la página principal. Se usa 'element' en lugar de 'component' */}
          
          {/* Rutas CRUD de usuarios */}
          <Route
            path="/users"
            element={
              <PrivateRoute allowedRoles={['Admin', 'Superadmin']}> {/* Solo los admins pueden acceder */}
                <UsersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-user"
            element={
              <PrivateRoute allowedRoles={['Admin', 'Superadmin']}>
                <UsersForm isEditMode={false} /> {/* Crear usuario */}
              </PrivateRoute>
            }
          />
          <Route
            path="/edit-user/:id"
            element={
              <PrivateRoute allowedRoles={['Admin', 'Superadmin']}>
                <UsersForm isEditMode={true} /> {/* Editar usuario */}
              </PrivateRoute>
            }
          />

          {/* Otras rutas */}
          <Route path="/" element={<HomePage />} /> {/* Ruta para la página principal. Se usa 'element' en lugar de 'component' */}
          <Route path="/catalog" element={<CatalogPage />} /> {/* Ruta para la página de catálogo */}
          <Route path="/order" element={<OrderPage />} /> {/* Ruta para la página de pedidos */}
          <Route path="/admin" element={<AdminPanel />} /> {/* Ruta para el panel de administración */}
          <Route path="/product-types" element={<ProductTypesPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/works" element={<WorksPage />} />
          
          {/* Product routes */}
          <Route path="/productsList" element={<ProductListPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
          <Route path="/create-product" element={<ProductsPage />} />
          
          
          <Route path="/old-works" element={<OldWorksPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />

          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['Admin', 'Superadmin']}>
                <AdminPanel />
              </PrivateRoute>
            }
          />

          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />

      {/*    <Route path="/calendario" element={<CalendarioVisitas />} />  */}

        </Routes>
      </AppLayout>
    </Router>
  );
}


/*
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}
*/

export default App;
