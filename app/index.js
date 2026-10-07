const Redis = require("ioredis");

const redis = new Redis({
  sentinels: [
    {
      host: process.env.SENTINEL_HOST || "localhost",
      port: Number(process.env.SENTINEL_PORT || 26379),
    },
  ],
  name: "mymaster",
});

redis.on("connect", () => console.log("connected to master"));
redis.on("close", () => console.log("connection closed"));
redis.on("reconnecting", () => console.log("reconnecting via sentinel..."));
redis.on("error", (err) => console.error("redis error:", err.message));

let count = 0;

// 1초마다 write/read — failover 중 동작 확인용
setInterval(async () => {
  try {
    count += 1;
    await redis.set("counter", count);
    const value = await redis.get("counter");
    const master = redis.stream.remoteAddress;
    console.log(`[${new Date().toISOString()}] counter=${value} (master ${master})`);
  } catch (err) {
    console.error("command failed:", err.message);
  }
}, 1000);
