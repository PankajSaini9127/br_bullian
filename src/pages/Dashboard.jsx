import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
} from '@mui/material';
import {
  TrendingUp as IncomingIcon,
  TrendingDown as OutgoingIcon,
  ShoppingCart as PurchaseIcon,
  Sell as SalesIcon,
  Pending as PendingIcon,
  Inventory as DukanStockIcon,
  AccountBalanceWallet as CaseInHandIcon,
} from '@mui/icons-material';
import salesInvoiceService from '../services/salesInvoiceService';
import { gradients } from '../theme';

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [metrics, setMetrics] = useState({
    todayFineIncoming: 0,
    todayFineOutgoing: 0,
    todayPurchaseSauda: 0,
    todaySalesSauda: 0,
    totalPendingSauda: 0,
  });
  const [dashboardData, setDashboardData] = useState({
    cashInHand: { openingBalance: 0, balanceWeight: 0, openingFine: 0, balanceFine: 0 },
    stock: { totalPuggas: 0, totalFine: 0, openingFine: 0, balanceFine: 0 },
    dukanStock: { totalPuggas: 0, totalFine: 0 },
    incoming: { totalInvoices: 0, totalPuggas: 0, totalFine: 0 },
    sales: { totalInvoices: 0, totalPuggas: 0, totalFine: 0 },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await salesInvoiceService.getDashboard({ date: selectedDate });
        const data = response?.data?.data || response?.data || {};
        setDashboardData({
          cashInHand: data?.cashInHand || { openingBalance: 0, balanceWeight: 0, openingFine: 0, balanceFine: 0 },
          stock: data?.stock || { totalPuggas: 0, totalFine: 0, openingFine: 0, balanceFine: 0 },
          dukanStock: data?.dukanStock || { totalPuggas: 0, totalFine: 0 },
          incoming: data?.incoming || { totalInvoices: 0, totalPuggas: 0, totalFine: 0 },
          sales: data?.sales || { totalInvoices: 0, totalPuggas: 0, totalFine: 0 },
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchDashboardData();
  }, [selectedDate]);

  useEffect(() => {
    // Calculate metrics from local storage or API
    // For now, using placeholder values
    const calculateMetrics = () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get data from localStorage (you can replace with API calls)
      const saudaList = JSON.parse(localStorage.getItem('saudaList') || '[]');
      const invoiceList = JSON.parse(localStorage.getItem('invoiceList') || '[]');
      const salesInvoiceList = JSON.parse(localStorage.getItem('salesInvoiceList') || '[]');

      // Today's fine from incoming invoices
      const todayFineIncoming = invoiceList
        .filter(inv => inv.date === today)
        .reduce((sum, inv) => sum + (parseFloat(inv.totalFine) || 0), 0);

      // Today's fine from outgoing (sales) invoices
      const todayFineOutgoing = salesInvoiceList
        .filter(inv => inv.date === today)
        .reduce((sum, inv) => sum + (parseFloat(inv.totalFine) || 0), 0);

      // Today's purchase sauda
      const todayPurchaseSauda = saudaList
        .filter(sauda => sauda.saudaDate === today && sauda.type === 'purchase')
        .reduce((sum, sauda) => sum + (parseFloat(sauda.totalAmount) || 0), 0);

      // Today's sales sauda
      const todaySalesSauda = saudaList
        .filter(sauda => sauda.saudaDate === today && sauda.type === 'sales')
        .reduce((sum, sauda) => sum + (parseFloat(sauda.totalAmount) || 0), 0);

      // Total pending sauda (booked qty - delivered qty)
      const totalPendingSauda = saudaList.reduce((sum, sauda) => {
        const bookedQty = parseFloat(sauda.quantity) || 0;
        const deliveredQty = parseFloat(sauda.deliveredQuantity) || parseFloat(sauda.delivered) || 0;
        return sum + (bookedQty - deliveredQty);
      }, 0);

      setMetrics({
        todayFineIncoming,
        todayFineOutgoing,
        todayPurchaseSauda,
        todaySalesSauda,
        totalPendingSauda,
      });
    };

    calculateMetrics();
  }, []);

  const MetricCard = ({ title, value, icon, color, gradient, subtitle }) => (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
        border: '1px solid', borderColor: 'divider',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(99, 102, 241, 0.2)',
          transition: 'all 0.3s ease',
        },
      }}
    >
      <Box
        sx={{
          background: gradient,
          p: { xs: 1.5, sm: 2, md: 3 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#fff', 
            fontWeight: 600,
            fontSize: { xs: '0.75rem', sm: '0.95rem', md: '1.1rem' }
          }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            width: { xs: 32, sm: 40, md: 48 },
            height: { xs: 32, sm: 40, md: 48 },
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {React.cloneElement(icon, { sx: { color: '#fff', fontSize: { xs: 18, sm: 22, md: 28 } } })}
        </Box>
      </Box>
      <CardContent sx={{ pt: { xs: 1.5, sm: 2, md: 3 }, pb: { xs: 1.5, sm: 2, md: 3 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: color,
            mb: 0.5,
            fontSize: { xs: '1rem', sm: '1.25rem', md: '1.75rem' },
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              fontSize: { xs: '0.65rem', sm: '0.7rem', md: '0.8rem' },
              lineHeight: 1.2,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 }, py: { xs: 1, md: 1 } }}>
      <Box sx={{ mb: { xs: 1, md: 1 } }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 1, mb: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
              background: gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Dashboard
          </Typography>
          <TextField
            type="date"
            label="Select Date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 200 }, width: { xs: '100%', sm: 'auto' } }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
          Overview of your business metrics
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 1.5, sm: 3 }}>
        <Grid item xs={6} sm={6} md={3} lg={3}>
          <MetricCard
            title="Incoming"
            value={`Invoices: ${dashboardData.incoming.totalInvoices}`}
            subtitle={`Fine: ${dashboardData.incoming.totalFine}g | Paggas: ${dashboardData.incoming.totalPuggas}`}
            icon={<IncomingIcon />}
            color="#10b981"
            gradient={gradients.successDark}
          />
        </Grid>

        <Grid item xs={6} sm={6} md={3} lg={3}>
          <MetricCard
            title="Sales"
            value={`Invoices: ${dashboardData.sales.totalInvoices}`}
            subtitle={`Fine: ${dashboardData.sales.totalFine}g | Paggas: ${dashboardData.sales.totalPuggas}`}
            icon={<SalesIcon />}
            color="#ef4444"
            gradient={gradients.danger}
          />
        </Grid>

        <Grid item xs={6} sm={6} md={3} lg={3}>
          <MetricCard
            title="Stock"
            value={`Paggas: ${dashboardData.stock.totalPuggas}`}
            subtitle={`Fine: ${dashboardData.stock.totalFine}g | Bal: ${dashboardData.stock.balanceFine}g`}
            icon={<PurchaseIcon />}
            color="#6366f1"
            gradient={gradients.primaryDark}
          />
        </Grid>

        <Grid item xs={6} sm={6} md={3} lg={3}>
          <MetricCard
            title="Dukan Stock"
            value={`Paggas: ${dashboardData.dukanStock.totalPuggas}`}
            subtitle={`Fine: ${dashboardData.dukanStock.totalFine}g`}
            icon={<DukanStockIcon />}
            color="#8b5cf6"
            gradient={gradients.purple}
          />
        </Grid>

        <Grid item xs={6} sm={6} md={3} lg={3}>
          <MetricCard
            title="Total Pending Sauda"
            value={metrics.totalPendingSauda}
            icon={<PendingIcon />}
            color="#f59e0b"
            gradient={gradients.warning}
          />
        </Grid>

        <Grid item xs={6} sm={6} md={3} lg={3}>
          <MetricCard
            title="Case in Hand"
            value={`\u20B9${Math.trunc(dashboardData.cashInHand.balanceAmount || 0).toLocaleString('en-IN')}`}
            subtitle={`Bal Fine: ${Math.trunc(dashboardData.cashInHand.balanceFine || 0).toLocaleString('en-IN')}g`}
            icon={<CaseInHandIcon />}
            color={(dashboardData.cashInHand.balanceAmount || 0) >= 0 ? '#0891b2' : '#ef4444'}
            gradient={(dashboardData.cashInHand.balanceAmount || 0) >= 0 ? 'linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)' : gradients.danger}
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
