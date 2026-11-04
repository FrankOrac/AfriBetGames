import type { IncomingMessage, ServerResponse } from "node:http";
import { createApplication } from "./app";

const application = createApplication();

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await application;
  return app(req, res);
}
