import mongoose from 'mongoose';
import { dark, light, noSidebar } from '@adminjs/themes'
import { AdminJSOptions } from 'adminjs';
import { Database, Resource } from '@adminjs/mongoose';
import AdminJS from 'adminjs';

import { componentLoader } from '@/admin/components/component-loader';
import { photoResourceOptions } from '@/admin/resources/photo';
import { userResources } from '@/admin/resources/user';
import { profileResources } from '@/admin/resources/profile';

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
