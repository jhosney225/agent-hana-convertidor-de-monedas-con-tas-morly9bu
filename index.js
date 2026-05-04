
```javascript
import Anthropic from "@anthropic-ai/sdk";
import * as readline from "readline";

const client = new Anthropic();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to prompt user for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

// Define tools for currency conversion
const tools = [
  {
    name: "get_exchange_rates",
    description:
      "Get current exchange rates between currencies. Returns exchange rates from a base currency to multiple target currencies.",
    input_schema: {
      type: "object",
      properties: {
        base_currency: {
          type: "string",
          description:
            "The base currency code (e.g., USD, EUR, GBP). Default is USD.",
        },
        target_currencies: {
          type: "array",
          items: {
            type: "string",
          },
          description:
            "Array of target currency codes to get rates for (e.g., [EUR, GBP, JPY])",
        },
      },
      required: ["base_currency", "target_currencies"],
    },
  },
  {
    name: "convert_currency",
    description:
      "Convert an amount from one currency to another using current exchange rates.",
    input_schema: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "The amount to convert",
        },
        from_currency: {
          type: "string",
          description: "The source currency code (e.g., USD)",
        },
        to_currency: {
          type: "string",
          description: "The target currency code (e.g., EUR)",
        },
      },
      required: ["amount", "from_currency", "to_currency"],
    },
  },
];

// Mock exchange rate data - simulating real-time rates
const exchangeRates = {
  USD: {
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.5,
    CAD: 1.36,
    AUD: 1.53,
    CHF: 0.88,
    CNY: 7.24,
    INR: 83.12,
    MXN: 17.05,
    BRL: 4.97,
  },
  EUR: {
    USD: 1.09,
    GBP: 0.86,
    JPY: 162.5,
    CAD: 1.48,
    AUD: 1.66,
    CHF: 0.96,
    CNY: 7.87,
    INR: 90.35,
    MXN: 18.55,
    BRL: 5.41,
  },
  GBP: {
    USD: 1.27,
    EUR: 1.16,
    JPY: 189.0,
    CAD: 1.72,
    AUD: 1.94,
    CHF: 1.12,
    CNY: 9.16,
    INR: 105.0,
    MXN: 21.58,
    BRL: 6.29,
  },
  JPY: {
    USD: 0.0067,
    EUR: 0.0062,
    GBP: 0.0053,
    CAD: 0.0091,
    AUD: 0.0102,
    CHF: 0.0059,
    CNY: 0.0485,
    INR: 0.556,
    MXN: 0.114,
    BRL: 0.0333,
  },
};

// Function to simulate getting exchange rates
function getExchangeRates(baseCurrency, targetCurrencies) {
  const rates = {};
  const baseCurrencyUpper = baseCurrency.toUpperCase();

  if (!exchangeRates[baseCurrencyUpper]) {
    return {
      error: `Base currency ${baseCurrency} not supported`,
      supported_currencies: Object.keys(exchangeRates[baseCurrencyUpper] || {}),
    };
  }

  for (const targetCurrency of targetCurrencies) {
    const targetUpper = targetCurrency.toUpperCase();
    if (baseCurrencyUpper === targetUpper) {
      rates[targetUpper] = 1.0;
    } else if (exchangeRates[baseCurrencyUpper][targetUpper]) {
      rates[targetUpper] = exchangeRates[baseCurrencyUpper][targetUpper];
    }
  }

  return {
    base_currency: baseCurrencyUpper,
    rates: rates,
    timestamp: new Date().toISOString(),
  };
}

// Function to simulate currency conversion
function convertCurrency(amount, fromCurrency, toCurrency) {
  const fromUpper = fromCurrency.toUpperCase();
  const toUpper = toCurrency.toUpperCase();

  if (fromUpper === toUpper) {
    return {
      amount: amount,
      from_currency: fromUpper,
      to_currency: toUpper,
      converted_amount: amount,
      exchange_rate: 1.0,
    };
  }

  // First convert to USD as intermediate
  let amountInUSD = amount;
  if (fromUpper !== "USD") {
    if (!exchangeRates["USD"][fromUpper]) {
      return {
        error: `Currency ${fromCurrency} not supported`,
      };
    }
    amountInUSD = amount / exchangeRates["USD"][fromUpper];
  }

  // Then convert from USD to target
  let convertedAmount = amountInUSD;
  if (toUpper !== "USD") {
    if (!exchangeRates["USD"][toUpper]) {
      return {
        error