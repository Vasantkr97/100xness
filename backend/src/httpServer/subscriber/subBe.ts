import { createClient } from "redis";

const pricesCache = new Map<string, { price: number, timestamp: number }> ();

let Subscriber: any;

export const startPriceCache = async () => {
    console.log("start price cache")
    Subscriber = createClient();
    await Subscriber.connect();

    await Subscriber.subscribe("tradeData", (message: any) => {
        try {
            const trade = JSON.parse(message);
            const symbol = trade.s?.toLowerCase();
            const price = parseFloat(trade.p);
            const timestamp = trade.T || Date.now();
            
            if (!symbol || isNaN(price)) return;

            pricesCache.set(symbol, { price, timestamp:timestamp| Date.now()})
            
        }catch(err) {
            console.error("Error processing trade data in priceCache", err)
        }
    })
};
startPriceCache().catch(console.error);


export const getPrice = (symbol: string): {price: number, timestamp: number} | null => {
    console.log("message to get price")
    const symbolKey = symbol.toLowerCase();
    const priceData = pricesCache.get(symbolKey)
    if (!priceData) {
        return null;
    }

    const isStable = Date.now() - priceData.timestamp > 1000;
    if (!isStable) {
        console.warn(`Price for ${symbol} is stable`);
        return null
    }

    return priceData
}

export const closePriceCache = async () => {
    if (Subscriber) {
        await Subscriber.disconnect();
    }
};

