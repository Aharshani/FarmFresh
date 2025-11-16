const notFound = (req, res, next) => {
    res.status(404);
    res.json({ message: 'Not Found' });
};

const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

const requestLogger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};

const cors = (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
};

const bodyParser = (req, res, next) => {
    if (req.is('application/json')) {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            try {
                req.body = JSON.parse(data);
            } catch (e) {
                req.body = {};
            }
            next();
        });
    } else {
        next();
    }
};

module.exports = {
    notFound,
    errorHandler,
    requestLogger,
    cors,
    bodyParser,
}; 