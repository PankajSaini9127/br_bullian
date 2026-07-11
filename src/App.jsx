import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { ThemeModeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import BRLoader from './components/BRLoader';
import PageLoader from './components/PageLoader';
import Login from './pages/Login';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import useAutoLogout from './hooks/useAutoLogout';

const PartyList = lazy(() => import('./pages/PartyList'));
const Sauda = lazy(() => import('./pages/Sauda'));
const Invoice = lazy(() => import('./pages/Invoice'));
const SaudaCheck = lazy(() => import('./pages/SaudaCheck'));
const SalesInvoice = lazy(() => import('./pages/SalesInvoice'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const PaggaList = lazy(() => import('./pages/PaggaList'));
const PartyLedger = lazy(() => import('./pages/PartyLedger'));
const CaseBook = lazy(() => import('./pages/CaseBook'));
const Case = lazy(() => import('./pages/Case'));
const CreditDebitNote = lazy(() => import('./pages/CreditDebitNote'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const StockVerification = lazy(() => import('./pages/StockVerification'));
const MetalPalta = lazy(() => import('./pages/MetalPalta'));

function App() {
  const token = localStorage.getItem('token');
  useAutoLogout(token);
  return (
    <ThemeModeProvider>
      <AuthProvider>
      
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <NavBar>
                  <Suspense fallback={<PageLoader />}>
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
                      <Route path="/credit-debit-note" element={<CreditDebitNote />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/stock-verification" element={<StockVerification />} />
                      <Route path="/metal-palta" element={<MetalPalta />} />
                      <Route path="/settings" element={<div>Settings Page</div>} />
                    </Routes>
                  </Suspense>
                </NavBar>
              </ProtectedRoute>
            }
          />
        </Routes>
      
      <ToastContainer />
      <BRLoader />
      </AuthProvider>
    </ThemeModeProvider>
  );
}

export default App;
