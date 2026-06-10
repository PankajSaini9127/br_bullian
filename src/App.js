import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import NavBar from './components/NavBar';
import PartyList from './pages/PartyList';
import Sauda from './pages/Sauda';
import Invoice from './pages/Invoice';
import SaudaCheck from './pages/SaudaCheck';
import SalesInvoice from './pages/SalesInvoice';
import Dashboard from './pages/Dashboard';
import PaggaList from './pages/PaggaList';
import PartyLedger from './pages/PartyLedger';
import CaseBook from './pages/CaseBook';
import Case from './pages/Case';
import ProtectedRoute from './components/ProtectedRoute';
import useAutoLogout from './hooks/useAutoLogout';

function App() {
  const token = localStorage.getItem('token');
  useAutoLogout(token);
  return (
    <AuthProvider>
      
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <NavBar>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/party-list" element={<PartyList />} />
                    <Route path="/sauda" element={<Sauda />} />
                    <Route path="/invoice" element={<Invoice />} />
                    <Route path="/sales-invoice" element={<SalesInvoice />} />
                    <Route path="/sauda-check" element={<SaudaCheck />} />
                    <Route path="/pagga-list" element={<PaggaList />} />
                    <Route path="/party-ledger" element={<PartyLedger />} />
                    <Route path="/case-book" element={<CaseBook />} />
                    <Route path="/case" element={<Case />} />
                    <Route path="/settings" element={<div>Settings Page</div>} />
                  </Routes>
                </NavBar>
              </ProtectedRoute>
            }
          />
        </Routes>
      
      <ToastContainer />
    </AuthProvider>
  );
}

export default App;
