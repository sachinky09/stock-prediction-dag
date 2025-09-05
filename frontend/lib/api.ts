export interface StockDataPoint {
  datetime: string;
  close: number;
}

export async function fetchStockData(symbol: string): Promise<StockDataPoint[]> {
  try {
    // Note: Replace 'demo' with your actual TwelveData API key
    const apiKey = process.env.NEXT_PUBLIC_TWELVEDATA_API_KEY || 'demo';
    const response = await fetch(
      `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1min&outputsize=30&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock data');
    }
    
    const data = await response.json();
    
    if (data.status === 'error') {
      console.warn(`TwelveData API error for ${symbol}:`, data.message);
      // Return mock data for demo purposes
      return generateMockStockData();
    }
    
    if (!data.values || !Array.isArray(data.values)) {
      return generateMockStockData();
    }
    
    return data.values.map((point: any) => ({
      datetime: point.datetime,
      close: parseFloat(point.close)
    })).reverse(); // Reverse to get chronological order
    
  } catch (error) {
    console.error('Error fetching stock data:', error);
    // Return mock data as fallback
    return generateMockStockData();
  }
}

function generateMockStockData(): StockDataPoint[] {
  const data: StockDataPoint[] = [];
  const basePrice = 150 + Math.random() * 100;
  const now = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const datetime = new Date(now.getTime() - i * 60000);
    const variation = (Math.random() - 0.5) * 5;
    const price = Math.max(basePrice + variation, 10);
    
    data.push({
      datetime: datetime.toISOString(),
      close: parseFloat(price.toFixed(2))
    });
  }
  
  return data;
}