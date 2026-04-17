import { createServer } from "./server/create-server.js";
import routes from "./server/routes/api.routes.js";

import initializeDb from "./db/create-db.js";
import initializeAdminApp from "./admin/create-admin.js";
import adminOptions from "./admin/options.js";

const port = process.env.PORT || 3000;

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
    app.listen(port, () => {
      console.log(
        `Server running at http://localhost:${port}${admin.options.rootPath}`
      );
    });

  } catch (error) {
    console.error("Error starting the application:", error);
  }
};

start();