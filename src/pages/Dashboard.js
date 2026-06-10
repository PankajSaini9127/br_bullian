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
} from '@mui/icons-material';
import salesInvoiceService from '../services/salesInvoiceService';

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
    dukanStock: { totalPuggas: 0, totalFine: 0 },
    incoming: { totalInvoices: 0, totalPuggas: 0, totalFine: 0 },
    sales: { totalInvoices: 0, totalPuggas: 0, totalFine: 0 },
    stock: { totalPuggas: 0, totalFine: 0 },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await salesInvoiceService.getDashboard({ date: selectedDate });
        
        setDashboardData({
          dukanStock: response?.data?.dukanStock || { totalPuggas: 0, totalFine: 0 },
          incoming: response?.data?.incoming || { totalInvoices: 0, totalPuggas: 0, totalFine: 0 },
          sales: response?.data?.sales || { totalInvoices: 0, totalPuggas: 0, totalFine: 0 },
          stock: response?.data?.stock || { totalPuggas: 0, totalFine: 0 },
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

      // Total pending sauda (you can define your own logic for pending)
      const totalPendingSauda = saudaList.length;

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
        border: '1px solid #e2e8f0',
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
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
          {title}
        </Typography>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </Box>
      <CardContent sx={{ pt: 3 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: color,
            mb: 0.5,
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              fontWeight: 500,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 2 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
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
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ minWidth: { xs: '100%', sm: 200 } }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: '#64748b' }}>
          Overview of your business metrics
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3} lg={3}>
          <MetricCard
            title="Incoming"
            value={`Invoices: ${dashboardData.incoming.totalInvoices}`}
            subtitle={`Fine: ${dashboardData.incoming.totalFine}g | Paggas: ${dashboardData.incoming.totalPuggas}`}
            icon={<IncomingIcon sx={{ color: '#fff', fontSize: 28 }} />}
            color="#10b981"
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={3}>
          <MetricCard
            title="Sales"
            value={`Invoices: ${dashboardData.sales.totalInvoices}`}
            subtitle={`Fine: ${dashboardData.sales.totalFine}g | Paggas: ${dashboardData.sales.totalPuggas}`}
            icon={<SalesIcon sx={{ color: '#fff', fontSize: 28 }} />}
            color="#ef4444"
            gradient="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={3}>
          <MetricCard
            title="Stock"
            value={`Paggas: ${dashboardData.stock.totalPuggas}`}
            subtitle={`Fine: ${dashboardData.stock.totalFine}g`}
            icon={<PurchaseIcon sx={{ color: '#fff', fontSize: 28 }} />}
            color="#6366f1"
            gradient="linear-gradient(135deg, #6366f1 0%, #4338ca 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={3}>
          <MetricCard
            title="Dukan Stock"
            value={`Paggas: ${dashboardData.dukanStock.totalPuggas}`}
            subtitle={`Fine: ${dashboardData.dukanStock.totalFine}g`}
            icon={<DukanStockIcon sx={{ color: '#fff', fontSize: 28 }} />}
            color="#8b5cf6"
            gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3} lg={3}>
          <MetricCard
            title="Total Pending Sauda"
            value={metrics.totalPendingSauda}
            icon={<PendingIcon sx={{ color: '#fff', fontSize: 28 }} />}
            color="#f59e0b"
            gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
