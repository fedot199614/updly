import AdminJS, { AdminJSOptions } from 'adminjs';
import { buildAuthenticatedRouter } from '@adminjs/express';
import provider from '@/admin/auth-provider';
import { adminConfig } from '@/admin/config/admin.config';

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
      cookiePassword: adminConfig.COOKIE_SECRET,
      cookieName: adminConfig.COOKIE_NAME,
      provider,
    },
    null,
    {
      secret: adminConfig.COOKIE_SECRET,
      saveUninitialized: true,
      resave: true,
    },
  );

  return { admin, router };
};

export default initializeAdminApp;