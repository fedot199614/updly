import { DefaultAuthProvider } from 'adminjs';
import { componentLoader } from './components/component-loader.js';
import { DEFAULT_ADMIN } from './constants.js';


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
