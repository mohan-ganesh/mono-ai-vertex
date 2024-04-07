import { createClient } from "redis";
let redisClient;
/**
 * Connect to Redis server
 */
export async function redisConnect() {
  try {
    console.log("Connecting to Redis server...");

    const redisOptions = {
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
    };
    redisClient = await createClient(redisOptions)
      .on("error", (err) => console.log("Redis Client Error", err))
      .on("connect", () => {
        console.log("Connected to Redis server.");
      })
      .connect();
  } catch (error) {
    console.error("Error connecting to DB:", error);
    throw error;
  }
}
/**
 * Set a key in Redis
 * @param {string} key
 * @param {string} value
 * @param {number} expiration
 * @returns {string} response
 */
export async function setKey(key, value, expiration = 5) {
  try {
    return await redisClient.set(key, value, { EX: expiration });
  } catch (error) {
    console.error("Error setting key in Redis:", error);
    throw error;
  }
}
/**
 * Get a key from Redis
 * @param {string} key
 * @returns {string} value
 */
export async function getKey(key) {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error("Error getting key from Redis:", error);
    throw error;
  }
}

export async function insertIntoList(key, value) {
  try {
    return await redisClient.rPush(key, value);
  } catch (error) {
    console.error("Error inserting into list in Redis:", error);
    throw error;
  }
}

export async function getFromList(key, start, end) {
  try {
    return await redisClient.lRange(key, start, end);
  } catch (error) {
    console.error("Error getting from list in Redis:", error);
    throw error;
  }
}
