FROM denoland/deno:alpine-1.39.1

WORKDIR /app

COPY correlator /app/correlator

CMD ["run", "--allow-net", "--allow-read", "correlator/main.ts"]
