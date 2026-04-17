import mongoose from 'mongoose';
import { dark, light, noSidebar } from '@adminjs/themes'
import { AdminJSOptions } from 'adminjs';
import { Database, Resource } from '@adminjs/mongoose';
import AdminJS from 'adminjs';

import { componentLoader } from '@/admin/components/component-loader.js';
import { photoResourceOptions } from '@/admin/resources/photo.js';
import { userResources } from '@/admin/resources/user.js';
import { profileResources } from '@/admin/resources/profile.js';

AdminJS.registerAdapter({ Database, Resource });

const adminOptions = async (db_connection: mongoose.Mongoose): Promise<AdminJSOptions> => {
  return {
    componentLoader,
    rootPath: '/admin',
    defaultTheme: dark.id,
    availableThemes: [dark, light, noSidebar],
    resources: [
      photoResourceOptions(),
      profileResources(),
      userResources(),
    ],
    databases: [db_connection],
  };
};

export default adminOptions;
