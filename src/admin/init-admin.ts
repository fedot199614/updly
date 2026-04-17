import AdminJS, { AdminJSOptions } from 'adminjs';
import { buildAuthenticatedRouter } from '@adminjs/express';
import provider from '@/admin/auth-provider';

const initializeAdminApp = async ({ options }: { options: AdminJSOptions }) => {

  const admin = new AdminJS(options);

  if (process.env.NODE_ENV === 'production') {
    await admin.initialize();
  } else {
    admin.watch();
  }

  if (!process.env.COOKIE_SECRET) {
    throw new Error("COOKIE_SECRET is not defined");
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