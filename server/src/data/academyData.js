export const ACADEMY_TRACKS = [
  {
    id: "basics",
    title: "Stock Market 101",
    icon: "📚",
    description: "Learn what a stock is, how prices move, and how buyers and sellers interact.",
    lessons: [
      {
        id: "lesson_1",
        title: "Stock Market 101: How Markets Work",
        content: "A stock represents fractional ownership in a publicly traded company. When you buy 1 share of Apple or Reliance, you own a piece of that business and participate in its financial growth.\n\nBids & Asks: The Bid is the highest price a buyer is willing to pay. The Ask is the lowest price a seller will accept. The difference is called the Spread.\n\nGoing 'Long' means buying expecting prices to rise. Going 'Short' means selling borrowed shares first and buying them back cheaper later when prices fall. You can profit in both bull and bear markets!",
        quiz: {
          question: "What does going 'Short' on a stock mean?",
          options: [
            "Holding a stock for a very short period of time",
            "Borrowing shares to sell high now and buy back lower later",
            "Buying shares at market close",
            "Investing in companies with small market cap"
          ],
          correctIndex: 1,
          explanation: "Shorting allows traders to profit from market crashes by selling first and buying back lower."
        },
        rewardCash: 1000,
        rewardXp: 100
      }
    ]
  },
  {
    id: "candlesticks",
    title: "Candlestick Mastery",
    icon: "🕯️",
    description: "Read price action like a book using Japanese candlestick patterns.",
    lessons: [
      {
        id: "lesson_2",
        title: "Candlestick Anatomy & Hammer Reversals",
        content: "Every candlestick shows 4 critical prices: Open, High, Low, and Close (OHLC). Green candles mean the close was higher than open (bulls won). Red candles mean bears won.\n\nA Hammer pattern has a small body at the top and a long lower wick (at least 2x the body). It shows sellers pushed prices down, but buyers fiercely rejected lower prices. When seen at the bottom of a downtrend, it signals a strong bullish reversal!",
        quiz: {
          question: "What does a Hammer candlestick at the bottom of a downtrend indicate?",
          options: [
            "Continuation of the downward trend",
            "Strong bullish price reversal upward",
            "The market has closed for the day",
            "A stock split is occurring"
          ],
          correctIndex: 1,
          explanation: "The long lower wick shows aggressive buyer rejection of low prices, triggering a bullish reversal."
        },
        rewardCash: 1500,
        rewardXp: 150
      }
    ]
  },
  {
    id: "indicators",
    title: "Technical Indicators",
    icon: "📉",
    description: "Use RSI and MACD oscillators to pinpoint precise entries and exits.",
    lessons: [
      {
        id: "lesson_3",
        title: "RSI & MACD Momentum Trading",
        content: "Relative Strength Index (RSI) measures speed and momentum on a 0 to 100 scale. RSI above 70 indicates Overbought (potential pullback), while RSI below 30 indicates Oversold (bargain buying opportunity).\n\nMACD (Moving Average Convergence Divergence) signals trend shifts. When the MACD line crosses above the Signal line, momentum is turning bullish!",
        quiz: {
          question: "An RSI reading below 30 typically signifies what market condition?",
          options: [
            "Overbought condition",
            "Oversold condition (potential buying bounce)",
            "High volatility breakout",
            "Market liquidity freeze"
          ],
          correctIndex: 1,
          explanation: "RSI < 30 means selling pressure has been exhausted, often creating a high-probability bounce."
        },
        rewardCash: 2000,
        rewardXp: 200
      }
    ]
  },
  {
    id: "options",
    title: "Indian F&O & Derivatives",
    icon: "🇮🇳",
    description: "Trade Nifty 50 and Bank Nifty Options like professional DIIs and FIIs.",
    lessons: [
      {
        id: "lesson_4",
        title: "Calls (CE), Puts (PE) & The Greeks",
        content: "In Indian stock market (NSE), Options allow you to control 25 Nifty shares or 15 Bank Nifty shares with a small premium.\n\nCall (CE): Buy when you expect the index to surge up.\nPut (PE): Buy when you expect the index to fall.\n\nDelta tells you how much your option premium moves for every 1-point move in the index. Theta measures time decay—as weekly Thursday expiry nears, options lose value fast!",
        quiz: {
          question: "If you expect the Nifty 50 index to surge upward today, which option should you buy?",
          options: [
            "Put Option (PE)",
            "Call Option (CE)",
            "Future Short",
            "Sell Call"
          ],
          correctIndex: 1,
          explanation: "Buying a Call Option (CE) allows you to profit from upward price movements with limited risk."
        },
        rewardCash: 2500,
        rewardXp: 250
      }
    ]
  },
  {
    id: "psychology",
    title: "Risk Psychology & 1% Rule",
    icon: "🧠",
    description: "Master the mental discipline and position sizing of legendary traders.",
    lessons: [
      {
        id: "lesson_5",
        title: "The 1% Rule & Avoiding Revenge Trading",
        content: "Never risk more than 1% to 2% of your account on a single trade. If you have $100,000 or ₹10,00,00, your maximum stop-loss should never exceed $1,000 or ₹10,000.\n\nRisk-to-Reward: Aim for 1:2 R:R. If you risk ₹1,000, aim for ₹2,000 profit. You can be wrong half the time and still make a fortune!\n\nRevenge Trading: Doubling down immediately after a loss is why retail traders fail. Discipline is the only holy grail in trading.",
        quiz: {
          question: "With a 1:2 Risk-to-Reward ratio, how much should your target profit be if your risk is $500?",
          options: [
            "$250",
            "$500",
            "$1,000",
            "$5,000"
          ],
          correctIndex: 2,
          explanation: "A 1:2 R:R means target profit is twice the risk amount ($500 x 2 = $1,000)."
        },
        rewardCash: 3000,
        rewardXp: 300
      }
    ]
  }
];

export const ACADEMY_LESSONS = ACADEMY_TRACKS.flatMap(t => t.lessons);
