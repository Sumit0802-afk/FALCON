// The backend as a Vercel function. Vercel calls the exported app for every request
// (see vercel.json, which sends them all here); nothing listens on a port.
// A server with a disk starts from server.ts instead.
import { createApp } from "../app";

export default createApp();
