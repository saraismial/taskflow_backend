require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5050;
const MONGODB_URI = process.env.MONGODB_URI;

(async () => {
    await connectDB(MONGODB_URI);

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
})();