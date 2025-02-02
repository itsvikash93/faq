const redis = require("redis");
const {createClient} = require("redis")
const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 13047
    }
});

client.on("connect", () => console.log("Redis Connected"));
client.on("error", (err) => console.error("Redis Error", err));

client.connect();
module.exports = client;
