import { serveFile } from "https://deno.land/std@0.203.0/http/file_server.ts";
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { connect, StringCodec } from "https://deno.land/x/nats@v1.20.1/src/mod.ts";
import { fromFileUrl } from "https://deno.land/std@0.203.0/path/mod.ts";

const nc = await connect({ servers: "nats:4222" });
const sc = StringCodec();

let latestBTC = null;
let latestETH = null;
let latestCorr = null;

const subBTC = nc.subscribe("crypto.price.BTCUSDT");
const subETH = nc.subscribe("crypto.price.ETHUSDT");
const subCORR = nc.subscribe("crypto.correlation.btc_eth");

;(async () => { for await (const m of subBTC) latestBTC = JSON.parse(sc.decode(m.data)); })();
;(async () => { for await (const m of subETH) latestETH = JSON.parse(sc.decode(m.data)); })();
;(async () => { for await (const m of subCORR) latestCorr = JSON.parse(sc.decode(m.data)); })();

console.log("🚀 Dashboard running at http://localhost:8000");

serve(async (req) => {
    const url = new URL(req.url);

    if (url.pathname === "/events") {
        console.log("🔌 SSE client connected");
        const encoder = new TextEncoder();
        let closed = false;

        const body = new ReadableStream({
            start(controller) {
                const interval = setInterval(() => {
                    if (closed || req.signal.aborted) {
                        clearInterval(interval);
                        console.log("❌ SSE connection closed");
                        return;
                    }

                    let payloadStr;
                    if (latestBTC && latestETH && latestCorr) {
                        const payload = {
                            btc: latestBTC.price,
                            eth: latestETH.price,
                            correlation: latestCorr.correlation,
                            timestamp: new Date().toISOString(),
                        };
                        console.log("📤 Sending event:", payload);
                        payloadStr = `data: ${JSON.stringify(payload)}\n\n`;
                    } else {
                        console.log("💓 Heartbeat");
                        payloadStr = `: heartbeat\n\n`;
                    }

                    try {
                        controller.enqueue(encoder.encode(payloadStr));
                    } catch (err) {
                        console.error("🔥 Failed to enqueue SSE:", err);
                        clearInterval(interval);
                        closed = true;
                    }
                }, 1000);

                req.signal.addEventListener("abort", () => {
                    console.log("🚪 SSE request aborted");
                    clearInterval(interval);
                    closed = true;
                });
            },
            cancel() {
                console.log("🧹 SSE stream canceled");
                closed = true;
            }
        });

        return new Response(body, {
            headers: {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            },
        });
    }

    return serveFile(req, fromFileUrl(new URL("./static/index.html", import.meta.url)));
}, { port: 8000 });
