import { connect, StringCodec, NatsConnection } from "https://deno.land/x/nats@v1.20.1/src/mod.ts";

const sc = StringCodec();
const WINDOW_SIZE = 60; // number of points

type PriceEvent = {
    symbol: string;
    price: number;
    timestamp: number;
};

const btcPrices: PriceEvent[] = [];
const ethPrices: PriceEvent[] = [];

const updateWindow = (prices: PriceEvent[], priceEvent: PriceEvent) => {
    prices.push(priceEvent);
    if (prices.length >  WINDOW_SIZE) prices.shift();
}

const computeCorrelation = (): number | null => {
    if (btcPrices.length < WINDOW_SIZE || ethPrices.length < WINDOW_SIZE) return null;

    const btc = btcPrices.map((p) => p.price);
    const eth = ethPrices.map((p) => p.price);

    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const avgBtc = mean(btc);
    const avgEth = mean(eth);

    const numerator = btc.reduce((sum, b, i) => sum + (b - avgBtc) * (eth[i] - avgEth), 0);
    const denominator = Math.sqrt(
        btc.reduce((sum, b) => sum + (b - avgBtc) ** 2, 0) *
        eth.reduce((sum, e) => sum + (e - avgEth) ** 2, 0),
    );

    return denominator === 0 ? 0 : +(numerator / denominator).toFixed(4);
}

// Main setup
const nc: NatsConnection = await connect({ servers: "nats:4222" });

const subBtc = nc.subscribe("crypto.price.BTCUSDT");
const subEth = nc.subscribe("crypto.price.ETHUSDT");

// Consume in background
(async () => {
    for await (const msg of subBtc) {
        const event: PriceEvent = JSON.parse(sc.decode(msg.data));
        updateWindow(btcPrices, event);
    }
})();
(async () => {
    for await (const msg of subEth) {
        const event: PriceEvent = JSON.parse(sc.decode(msg.data));
        updateWindow(ethPrices, event);
    }
})();

// Periodically compute correlation
setInterval(() => {
    const correlation = computeCorrelation();
    if (correlation !== null) {
        const payload = {
            correlation,
            timestamp: Date.now(),
        };
        nc.publish("crypto.correlation.btc_eth", sc.encode(JSON.stringify(payload)));
        console.log("Published correlation:", payload);
    }
}, 3000); // every 3 seconds