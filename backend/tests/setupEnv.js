// Runs before any module is loaded in each test file. dotenv never overrides
// variables that already exist, so these win over anything in backend/.env.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.OPENAI_API_KEY = "";
process.env.FRONTEND_URL = "http://localhost:5173";
