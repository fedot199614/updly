import {server, admin} from './server/server.js';

const port = process.env.PORT || 3000;

const start = async () => {
  try {

    server.listen(port, () => {
      console.log(`Server available at http://localhost:${port}${admin.options.rootPath}`);
    });

  } catch (error) {
    console.error('Error starting the application:', error);
  }
};

start();
