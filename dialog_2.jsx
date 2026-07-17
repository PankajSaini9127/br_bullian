<Dialog
        open={bhavcutModalOpen}
        onClose={() => setBhavcutModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle sx={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {formData.type === 'buy' ? <ShoppingCartIcon /> : <SellIcon />}
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Bhav Cuts ({pageTitle})
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3, mt: 1 }}>
          <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 600 }}>
              Your {formData.type === 'buy' ? 'purchase' : 'sales'} weight exceeds the remaining pending sauda by <strong>{bhavcutWeight}g</strong>. The excess will be processed as a Bhavcut.
            </Typography>
            <TextField
              fullWidth
              label="Bhavcut Weight (g)"
              type="number"
              value={bhavcutWeight}
              disabled
              size="small"
            />
            <TextField
              fullWidth
              label="Bhavcut Date *"
              type="date"
              value={bhavcutDate}
              onChange={(e) => setBhavcutDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              size="small"
            />
            <TextField
              fullWidth
              label="Bhavcut Rate"
              type="number"
              value={bhavcutRate}
              onChange={(e) => setBhavcutRate(e.target.value)}
              size="small"
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setBhavcutModalOpen(false)}
            variant="outlined"
            sx={{
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                background: 'rgba(99, 102, 241, 0.08)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBhavcutSubmit}
            variant="contained"
            sx={{
              background: gradients.success,
              color: '#fff',
              fontWeight: 600,
              '&:hover': {
                background: gradients.successHover,
                boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
              },
            }}
          >
            Submit Bhavcut
          </Button>
        </DialogActions>
      </Dialog>