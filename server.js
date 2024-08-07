const express = require('express');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const connectMongoDb = require('./services/mongodb.connect');
const routes = require('./routes');

dotenv.config();

const app = express();
app.use(express.json());

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', apiLimiter);
app.use('/api/', routes);

(async () => {
    try {
        await connectMongoDb();
        app.listen(3000, () => console.log('API server running on port 3000'));
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
})();
