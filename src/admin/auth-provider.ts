import { DefaultAuthProvider } from 'adminjs';
import { componentLoader } from '@/admin/components/component-loader';
import { DEFAULT_ADMIN } from '@/admin/constants';


const provider = new DefaultAuthProvider({
  componentLoader,
  authenticate: async ({ email, password }) => {
    if (email === DEFAULT_ADMIN.email) {
      return { email };
    }

    return null;
  },
});

export default provider;
