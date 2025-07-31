import { connect, StringCodec } from "https://deno.land/x/nats@v1.20.1/src/mod.ts";

const symbols = ["btcusdt", "ethusdt"]
const nc = await connect({ servers: "nats:4222" })
const sc = StringCodec()

for (const symbol of symbols) {
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol}@trade`);
    ws.onmessage = (msg) => {
        const raw = JSON.parse(msg.data);
        const payload = {
            symbol: raw.s,
            price: parseFloat(raw.p),
            timestamp: raw.T,
        };
        nc.publish(`crypto.price.${payload.symbol}`, sc.encode(JSON.stringify(payload)));
        console.log("Published", payload);
    };
}