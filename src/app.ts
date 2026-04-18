import "@/env.helper.js";
import { createServer } from "@/backend/server/init-server.js";
import routes from "@/backend/routes/api.routes.js";
import { errorHandler } from "@/backend/server/middlewares/error.js";
import { notFound } from "@/backend/server/middlewares/not-found.js";

import initializeDb from "@/backend/db/init-db.js";
import initializeAdminApp from "@/admin/init-admin.js";
import adminOptions from "@/admin/options.js";
import { appConfig } from "@/app.config.js";
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

import { monitorQueue } from "@/queue/queues/monitor.queue.js";

const start = async () => {
  try {
    const { db } = await initializeDb();

    const { admin, router: adminRouter } = await initializeAdminApp({
      options: await adminOptions(db),
    });

    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath("/admin/queues");

    createBullBoard({
      queues: [new BullMQAdapter(monitorQueue)],
      serverAdapter,
    });

    const app = createServer();

    // Routes
    app.use(admin.options.rootPath + "/queues", serverAdapter.getRouter());
    app.use(admin.options.rootPath, adminRouter);
    app.use("/api", routes);
    app.use(notFound);
    app.use(errorHandler);

    // Start
    app.listen(appConfig.PORT, () => {
      console.log(
        `Server running at http://localhost:${appConfig.PORT}${admin.options.rootPath}`
      );
    });

  } catch (error) {
    console.error("Error starting the application:", error);
  }
};

start();