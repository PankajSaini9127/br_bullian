import { createTheme } from '@mui/material/styles';

// Shared gradients used across the application (mode-agnostic)
export const gradients = {
  primary: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
  primaryHover: 'linear-gradient(135deg, #4338ca 0%, #be185d 100%)',
  primaryLight: 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
  danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  dangerHover: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
  successHover: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  successDark: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  successDarkHover: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  warningHover: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
  warningLight: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  warningRowHover: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  successLight: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
  rowHover: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  sidebar: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
  sidebarDark: 'linear-gradient(180deg, #1e1e2e 0%, #181825 100%)',
  loginPage: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
  loginCard: 'linear-gradient(145deg, #ffffff, #f8fafc)',
  loginCardDark: 'linear-gradient(145deg, #1e1e2e, #181825)',
  avatarPrimary: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
  purple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  primaryDark: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
  rowHoverDark: 'linear-gradient(135deg, #2a2a3e 0%, #252535 100%)',
};

// Color tokens that change based on mode
export const getModeColors = (mode) => {
  const isDark = mode === 'dark';
  return {
    background: {
      default: isDark ? '#0a0a12' : '#f8fafc',
      paper: isDark ? 'rgba(20, 20, 32, 0.72)' : '#ffffff',
      sidebar: isDark ? 'rgba(15, 15, 26, 0.85)' : gradients.sidebar,
      cardGradient: isDark ? gradients.loginCardDark : gradients.loginCard,
    },
    text: {
      primary: isDark ? '#e8eaf0' : '#1e293b',
      secondary: isDark ? '#8892b0' : '#64748b',
      heading: isDark ? '#f1f5f9' : '#1e293b',
      listItem: isDark ? '#cbd5e1' : '#424242',
    },
    border: isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0',
    rowHover: isDark ? 'rgba(99, 102, 241, 0.08)' : gradients.rowHover,
    tableHeader: isDark ? 'rgba(99, 102, 241, 0.12)' : gradients.primary,
    tableHeaderSuccess: isDark ? 'rgba(16, 185, 129, 0.12)' : gradients.successDark,
    tableHeaderWarning: isDark ? 'rgba(245, 158, 11, 0.12)' : gradients.warning,
    tableHeaderDanger: isDark ? 'rgba(239, 68, 68, 0.12)' : gradients.danger,
    iconColor: isDark ? '#818cf8' : '#6366f1',
    chipBg: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)',
    inputBg: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
    subtleBg: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
    glass: isDark
      ? { backdropFilter: 'blur(12px)', background: 'rgba(20, 20, 32, 0.72)', border: '1px solid rgba(255, 255, 255, 0.08)' }
      : {},
  };
};

export const getTheme = (mode) => {
  const isDark = mode === 'dark';
  const mc = getModeColors(mode);

  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#6366f1',
        light: '#818cf8',
        dark: '#4338ca',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#ec4899',
        light: '#f472b6',
        dark: '#be185d',
        contrastText: '#ffffff',
      },
      error: {
        main: '#ef4444',
        dark: '#dc2626',
      },
      background: {
        default: mc.background.default,
        paper: mc.background.paper,
      },
      text: {
        primary: mc.text.primary,
        secondary: mc.text.secondary,
      },
      divider: mc.border,
    },
    typography: {
      fontFamily: 'Arial, "Segoe UI", Roboto, Helvetica, sans-serif',
      h4: {
        fontWeight: 700,
      },
      h5: {
        fontWeight: 700,
        color: mc.text.heading,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            border: `1px solid ${mc.border}`,
            ...(isDark && {
              backdropFilter: 'blur(12px)',
              background: mc.background.paper,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }),
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            fontWeight: 600,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              background: mc.rowHover,
            },
            ...(isDark && {
              '&.MuiTableRow-head': {
                background: `${mc.tableHeader} !important`,
                '& .MuiTableCell-root': {
                  color: '#a5b4fc !important',
                },
              },
            }),
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: mc.background.sidebar,
            ...(isDark && {
              backdropFilter: 'blur(16px)',
              borderRight: '1px solid rgba(255, 255, 255, 0.06)',
            }),
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            ...(isDark && {
              backdropFilter: 'blur(16px)',
              background: 'rgba(20, 20, 32, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
            }),
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            fontWeight: 700,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            ...(isDark && {
              backdropFilter: 'blur(12px)',
              background: 'rgba(15, 15, 26, 0.8)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }),
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            ...(isDark && {
              '& .MuiOutlinedInput-root': {
                background: 'rgba(255, 255, 255, 0.04)',
              },
            }),
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          ...(isDark && {
            body: {
              background: '#0a0a12',
              backgroundImage: 'radial-gradient(circle at 20% 0%, rgba(99, 102, 241, 0.08) 0%, transparent 50%), radial-gradient(circle at 80% 100%, rgba(236, 72, 153, 0.06) 0%, transparent 50%)',
              backgroundAttachment: 'fixed',
            },
          }),
        },
      },
    },
  });
};

// Default export for backward compatibility (light mode)
const theme = getTheme('light');
export default theme;
