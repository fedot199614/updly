import { DefaultAuthProvider } from 'adminjs';
import { componentLoader } from '@/admin/components/component-loader';
import { adminConfig } from '@/admin/config/admin.config';


const provider = new DefaultAuthProvider({
  componentLoader,
  authenticate: async ({ email, password }) => {
    if (email === adminConfig.DEFAULT_ADMIN.email) {
      return { email };
    }

    return null;
  },
});

export default provider;
