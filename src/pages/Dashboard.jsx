import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
} from '@mui/material';
import {
  ShoppingCart as PurchaseIcon,
  Sell as SalesIcon,
  AccountBalanceWallet as CaseInHandIcon,
  AccountBalance as BankIcon,
  SyncAlt as ChorsaIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import salesInvoiceService from '../services/salesInvoiceService';
import { gradients } from '../theme';
import { useThemeMode } from '../context/ThemeContext';

const Dashboard = () => {
  const { mode } = useThemeMode();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    kachi: { purchaseWeight: 0, purchaseFine: 0, sellWeight: 0, sellFine: 0 },
    exchange: { kachiWeight: 0, kachiFine: 0, badlaWeight: 0, givenSilver: 0 },
    chorsa: { buyWeight: 0, sellWeight: 0, stockToday: 0, stockYesterday: 0 },
    bank: { buyWeight: 0, sellWeight: 0, stockToday: 0, stockYesterday: 0 },
    cashInHand: { today: 0, yesterday: 0 },
    kachiStock: { todayPuggas: 0, todayFine: 0, yesterdayPuggas: 0, yesterdayFine: 0 }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await salesInvoiceService.getDashboard({ date: selectedDate });
        const data = res?.data?.data || res?.data || {};
        
        setDashboardData({
          kachi: data.kachi || { purchaseWeight: 0, purchaseFine: 0, sellWeight: 0, sellFine: 0 },
          exchange: data.exchange || { kachiWeight: 0, kachiFine: 0, badlaWeight: 0, givenSilver: 0 },
          chorsa: data.chorsa || { buyWeight: 0, sellWeight: 0, stockToday: 0, stockYesterday: 0 },
          bank: data.bank || { buyWeight: 0, sellWeight: 0, stockToday: 0, stockYesterday: 0 },
          cashInHand: data.cashInHand || { today: 0, yesterday: 0 },
          kachiStock: data.kachiStock || { todayPuggas: 0, todayFine: 0, yesterdayPuggas: 0, yesterdayFine: 0 }
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedDate]);

  const MetricCard = ({ title, value, icon, color, subtitle }) => (
    <Card
      sx={{
        borderRadius: 3,
        borderLeft: `6px solid ${color}`,
        boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
        background: mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff',
        borderTop: mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : 'none',
        borderRight: mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : 'none',
        borderBottom: mode === 'dark' ? '1px solid rgba(255,255,255,0.05)' : 'none',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: mode === 'dark' ? '0 6px 24px rgba(0,0,0,0.5)' : '0 6px 16px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography
            variant="subtitle2"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' }
            }}
          >
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>
            {React.cloneElement(icon, { sx: { color: color, fontSize: { xs: 20, sm: 24 } } })}
          </Box>
        </Box>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 0.5,
            fontSize: { xs: '1.05rem', sm: '1.25rem', md: '1.45rem' },
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
              fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.80rem' },
              mt: 0.5,
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
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>Loading dashboard analytics...</Typography>
        </Box>
      ) : (
        <Grid container spacing={{ xs: 1.5, sm: 3 }}>
          {/* Row 1: Today's Transactions */}
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Kachi Transactions (Today)"
              value={`Buy: ${dashboardData.kachi.purchaseFine.toFixed(1)}g / Sell: ${dashboardData.kachi.sellFine.toFixed(1)}g`}
              icon={<PurchaseIcon />}
              color="#4f46e5"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Metal Exchange (Today)"
              value={`Kachi Recv: ${dashboardData.exchange.kachiFine.toFixed(1)}g`}
              subtitle={`Badla Wt: ${dashboardData.exchange.badlaWeight.toFixed(1)}g | Silver Given: ${dashboardData.exchange.givenSilver.toFixed(1)}g`}
              icon={<SwapHorizIcon />}
              color="#10b981"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Chorsa 999 (Today)"
              value={`Buy: ${dashboardData.chorsa.buyWeight.toFixed(1)}g / Sell: ${dashboardData.chorsa.sellWeight.toFixed(1)}g`}
              icon={<ChorsaIcon />}
              color="#f59e0b"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Bank 9999 (Today)"
              value={`Buy: ${dashboardData.bank.buyWeight.toFixed(1)}g / Sell: ${dashboardData.bank.sellWeight.toFixed(1)}g`}
              icon={<BankIcon />}
              color="#ec4899"
            />
          </Grid>

          {/* Row 2: Stocks & Cash in Hand (with yesterday's comparison) */}
          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Kachi Stock"
              value={`${dashboardData.kachiStock.todayFine.toFixed(1)}g`}
              subtitle={`Paggas: ${dashboardData.kachiStock.todayPuggas} (Yesterday: ${dashboardData.kachiStock.yesterdayFine.toFixed(1)}g)`}
              icon={<PurchaseIcon />}
              color="#6366f1"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Cash in Hand"
              value={`₹${Math.trunc(dashboardData.cashInHand.today).toLocaleString('en-IN')}`}
              subtitle={`Yesterday: ₹${Math.trunc(dashboardData.cashInHand.yesterday).toLocaleString('en-IN')}`}
              icon={<CaseInHandIcon />}
              color={dashboardData.cashInHand.today >= 0 ? '#0891b2' : '#ef4444'}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Chorsa 999 Stock"
              value={`${dashboardData.chorsa.stockToday.toLocaleString('en-IN')}g`}
              subtitle={`Yesterday: ${dashboardData.chorsa.stockYesterday.toLocaleString('en-IN')}g`}
              icon={<ChorsaIcon />}
              color="#f59e0b"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <MetricCard
              title="Bank 9999 Stock"
              value={`${dashboardData.bank.stockToday.toLocaleString('en-IN')}g`}
              subtitle={`Yesterday: ${dashboardData.bank.stockYesterday.toLocaleString('en-IN')}g`}
              icon={<BankIcon />}
              color="#ec4899"
            />
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard;
