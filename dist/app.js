import express from 'express';
import initializeDb from './db/index.js';
import initializeAdminApp from './admin/admin-app.js';
import adminOptions from './admin/options.js';
const port = process.env.PORT || 3000;
const start = async () => {
    try {
        const app = express();
        const { db } = await initializeDb();
        const { admin, router } = await initializeAdminApp({ options: await adminOptions(db) });
        app.use(admin.options.rootPath, router);
        app.listen(port, () => {
            console.log(`AdminJS available at http://localhost:${port}${admin.options.rootPath}`);
        });
    }
    catch (error) {
        console.error('Error starting the application:', error);
    }
};
start();
