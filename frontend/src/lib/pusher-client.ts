import Pusher from "pusher-js";

const key = import.meta.env.VITE_PUSHER_KEY;
const cluster = import.meta.env.VITE_PUSHER_CLUSTER;

if (!key || !cluster) {
  throw new Error("Missing VITE_PUSHER_KEY or VITE_PUSHER_CLUSTER");
}

const pusher = new Pusher(key, { cluster });
export default pusher;