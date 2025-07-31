FROM denoland/deno:alpine-1.39.1

WORKDIR /app

COPY ingestor /app/ingestor

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "--allow-write", "ingestor/main.ts"]
