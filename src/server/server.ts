import express from "express";
import routes from "./routes/routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFound } from "./middlewares/not-found.middleware.js";
import initializeAdminApp from "../admin/admin-app.js";
import adminOptions from "../admin/options.js";
import initializeDb from '../db/index.js';


const server = express();

const { db } = await initializeDb();
const { admin, router } = await initializeAdminApp({ options: await adminOptions(db) });

server.use(express.json());
server.use(admin.options.rootPath, router);
server.use("/api", routes);

server.use(notFound);
server.use(errorHandler);


export {server, admin};