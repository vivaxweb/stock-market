import { ASSETS } from './marketData.js';

// Standard normal cumulative distribution function (CDF approximation)
function normalCDF(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - prob : prob;
}

// Black-Scholes approximation for European Options
function calculateBlackScholes(S, K, T = 0.05, r = 0.065, sigma = 0.16) {
  const d1 = (Math.log(S / K) + (r + (sigma * sigma) / 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  const callPrice = S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
  const putPrice = K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);

  const deltaCall = normalCDF(d1);
  const deltaPut = deltaCall - 1;
  const theta = -(S * sigma * 0.3989423 * Math.exp(-d1 * d1 / 2)) / (2 * Math.sqrt(T)) / 365;

  return {
    callPrice: Math.max(parseFloat(callPrice.toFixed(2)), 1.50),
    putPrice: Math.max(parseFloat(putPrice.toFixed(2)), 1.50),
    deltaCall: parseFloat(deltaCall.toFixed(2)),
    deltaPut: parseFloat(deltaPut.toFixed(2)),
    theta: parseFloat(theta.toFixed(2))
  };
}

export function getOptionsChain(underlyingSymbol = "NIFTY 50") {
  const asset = ASSETS.find(a => a.symbol === underlyingSymbol) || ASSETS.find(a => a.symbol === "NIFTY 50");
  const spotPrice = asset.price;
  const step = underlyingSymbol === "BANK NIFTY" ? 100 : 50;
  const lotSize = underlyingSymbol === "BANK NIFTY" ? 15 : 25;

  // Round spot price to nearest step
  const atmStrike = Math.round(spotPrice / step) * step;
  const strikes = [];

  // Generate 7 strikes ITM and 7 strikes OTM
  for (let i = -6; i <= 6; i++) {
    const strike = atmStrike + (i * step);
    const bs = calculateBlackScholes(spotPrice, strike);

    strikes.push({
      strikePrice: strike,
      isATM: strike === atmStrike,
      call: {
        symbol: `${underlyingSymbol.replace(/\s+/g, '')}24DEC${strike}CE`,
        strikePrice: strike,
        optionType: 'CE',
        premium: bs.callPrice,
        change: parseFloat(((Math.random() - 0.45) * 8).toFixed(2)),
        delta: bs.deltaCall,
        theta: bs.theta,
        iv: 14.8,
        lotSize
      },
      put: {
        symbol: `${underlyingSymbol.replace(/\s+/g, '')}24DEC${strike}PE`,
        strikePrice: strike,
        optionType: 'PE',
        premium: bs.putPrice,
        change: parseFloat(((Math.random() - 0.45) * 8).toFixed(2)),
        delta: bs.deltaPut,
        theta: bs.theta,
        iv: 15.2,
        lotSize
      }
    });
  }

  return {
    underlying: underlyingSymbol,
    spotPrice,
    expiry: "Weekly (Thursday)",
    lotSize,
    strikes
  };
}
