export const corsOption = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:5173',
    '*',
  ],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   reflightContinue: false,
//   optionsSuccessStatus: 200,
};
