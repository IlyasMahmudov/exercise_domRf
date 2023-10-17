import { useEffect, useState } from 'react';
import './App.css';
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  ThemeProvider as MuiThemeProvider,
  Typography,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface Rates {
  base: string;
  date: string;
  rates: Record<string, number>;
}

interface RechartsData {
  rates: Record<string, Record<string, number>>;
}

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: { default: '#fff' },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: { default: '#333' },
  },
});

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [rates, setRates] = useState<Rates | null>(null);
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<RechartsData | null>(null);
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate, setEndDate] = useState('2022-12-31');
  const [selectedCurrency, setSelectedCurrency] = useState('');
  const [selectedCurrency1, setSelectedCurrency1] = useState<string>('');
  const [selectedCurrency2, setSelectedCurrency2] = useState<string>('');
  const [amount, setAmount] = useState(1);
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);

  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    fetchRates();
    fetchRecharts();
  }, []);

  async function fetchRates(): Promise<void> {
    try {
      const response = await fetch('https://api.frankfurter.app/latest');
      if (!response.ok) {
        throw new Error('Failed to fetch rates');
      }

      const result: Rates = await response.json();
      setRates(result);
      setLoading(false);
    } catch (error) {
      console.error('Error while fetching rates:', error);
    }
  }

  async function fetchRecharts(): Promise<void> {
    try {
      const response = await fetch(
        `https://api.frankfurter.app/${startDate}..${endDate}`
      );
      if (!response.ok) {
        throw new Error('Failed to fetch recharts data');
      }

      const resultRecharts: RechartsData = await response.json();
      setRawData(resultRecharts);
    } catch (error) {
      console.error('Error while fetching recharts data:', error);
    }
  }

  const data = rawData
    ? Object.keys(rawData.rates).map((date) => ({
        date,
        ...rawData.rates[date],
      }))
    : [];

  useEffect(() => {
    if (!loading && selectedCurrency1 && selectedCurrency2 && amount) {
      const rate1 = rates ? rates.rates[selectedCurrency1] : 0;
      const rate2 = rates ? rates.rates[selectedCurrency2] : 0;
      const converted = ((amount / rate1) * rate2).toFixed(2);
      setConvertedAmount(parseFloat(converted));
    }
  }, [loading, selectedCurrency1, selectedCurrency2, amount, rates]);

  return (
    <MuiThemeProvider theme={theme}>
      <Box style={{ background: theme.palette.background.default }}>
        <Button
          style={{
            top: '1px',
            right: '1px',
            border: '1px solid',
            margin: '5px',
          }}
          onClick={() => setDarkMode(!darkMode)}
        >
          Смена темы
        </Button>

        <Grid
          container
          spacing={1}
          direction="row"
          style={{ marginTop: '5px' }}
        >
          <Grid item md={6} sm={12} xs={12}>
            <TextField
              select
              label="Currency 1"
              value={selectedCurrency1}
              onChange={(e) => setSelectedCurrency1(e.target.value)}
              fullWidth
            >
              {loading ? (
                <MenuItem value="">Loading...</MenuItem>
              ) : rates ? (
                Object.keys(rates.rates).map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))
              ) : null}
            </TextField>
          </Grid>
          <Grid item md={6} sm={12} xs={12}>
            <TextField
              select
              label="Currency 2"
              value={selectedCurrency2}
              onChange={(e) => setSelectedCurrency2(e.target.value)}
              fullWidth
            >
              {loading ? (
                <MenuItem value="">Loading...</MenuItem>
              ) : rates ? (
                Object.keys(rates.rates).map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency}
                  </MenuItem>
                ))
              ) : null}
            </TextField>
          </Grid>
        </Grid>
        <TextField
          label="Amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value))}
          style={{ marginTop: '10px' }}
          fullWidth
        />
        <Typography
          style={{ margin: '10px', color: darkMode ? '#fff' : '#000' }}
        >
          Converted Amount: {convertedAmount ?? 0} {selectedCurrency2}
        </Typography>

        {loading ? (
          <Typography>Loading...</Typography>
        ) : rates ? (
          <Grid
            container
            style={{
              width: '100%',
              marginTop: '1rem',
              marginBottom: '1rem',
            }}
          >
            <Typography
              style={{ margin: '10px', color: darkMode ? '#fff' : '#000' }}
            >
              Базовая валюта --- {rates.base}
            </Typography>
            <Typography
              style={{ margin: '10px', color: darkMode ? '#fff' : '#000' }}
            >
              Дата курса --- {rates.date}
            </Typography>
            <Grid container item xs={12}>
              {Object.keys(rates.rates).map((currency, index) => (
                <Grid
                  key={index}
                  item
                  xs={12 / 5}
                  style={{ border: '1px solid gray', padding: '0.5rem' }}
                >
                  <Typography style={{ color: darkMode ? '#fff' : '#000' }}>
                    {currency}: {rates.rates[currency]}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ) : null}
        <TextField
          label="From Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          style={{ marginTop: '10px' }}
        />

        <TextField
          label="To Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
          style={{ marginTop: '10px', marginLeft: '10px' }}
        />
        <TextField
          select
          label="Выберите валюту"
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          fullWidth
          style={{ marginTop: '10px' }}
        >
          {loading ? (
            <MenuItem value="">Loading...</MenuItem>
          ) : rates ? (
            Object.keys(rates.rates).map((currency) => (
              <MenuItem key={currency} value={currency}>
                {currency}
              </MenuItem>
            ))
          ) : null}
        </TextField>
        <Button
          variant="contained"
          color="primary"
          onClick={() => fetchRecharts()}
          style={{ marginTop: '10px' }}
        >
          Построить график
        </Button>
        <LineChart
          style={{ marginTop: '10px' }}
          width={600}
          height={400}
          data={data}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {selectedCurrency && (
            <Line
              type="monotone"
              dataKey={selectedCurrency}
              stroke="#8884d8"
              name={selectedCurrency}
            />
          )}
        </LineChart>
      </Box>
    </MuiThemeProvider>
  );
}

export default App;
