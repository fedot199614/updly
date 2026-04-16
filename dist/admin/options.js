import { dark, light, noSidebar } from '@adminjs/themes';
import { Database, Resource } from '@adminjs/mongoose';
import AdminJS from 'adminjs';
import { componentLoader } from './components/component-loader.js';
import { photoResourceOptions } from './resources/photo.js';
import { userResources } from './resources/user.js';
import { profileResources } from './resources/profile.js';
AdminJS.registerAdapter({ Database, Resource });
const adminOptions = async (db_connection) => {
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
