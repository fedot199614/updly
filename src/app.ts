import { createServer } from "@/backend/server/init-server";
import routes from "@/backend/routes/api.routes";

import initializeDb from "@/backend/db/init-db";
import initializeAdminApp from "@/admin/init-admin";
import adminOptions from "@/admin/options";
import { appConfig } from "@/app.config";

const start = async () => {
  try {
    const { db } = await initializeDb();

    const { admin, router: adminRouter } = await initializeAdminApp({
      options: await adminOptions(db),
    });

    const app = createServer();

    // Routes
    app.use(admin.options.rootPath, adminRouter);
    app.use("/api", routes);

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