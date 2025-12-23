const apiKeyMiddleware = (req, res, next) => {
    // Skip API key check for OPTIONS requests (CORS pre-flight)
    if (req.method === 'OPTIONS') {
        return next();
    }

    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.APP_API_KEY;

    if (!apiKey || apiKey !== validApiKey) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Invalid or missing API key.'
        });
    }

    next();
};

module.exports = apiKeyMiddleware;
