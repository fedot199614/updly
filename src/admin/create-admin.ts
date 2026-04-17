import AdminJS, { AdminJSOptions } from 'adminjs';
import { buildAuthenticatedRouter } from '@adminjs/express';
import provider from './auth-provider.js';

const initializeAdminApp = async ({ options }: { options: AdminJSOptions }) => {  

   const admin = new AdminJS(options);

    if (process.env.NODE_ENV === 'production') {
        await admin.initialize();
    } else {
        admin.watch();
    }

      const router = buildAuthenticatedRouter(
        admin,
        {
          cookiePassword: process.env.COOKIE_SECRET,
          cookieName: 'adminjs',
          provider,
        },
        null,
        {
          secret: process.env.COOKIE_SECRET,
          saveUninitialized: true,
          resave: true,
        },
      );

  return { admin, router };
};

export default initializeAdminApp;