const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = app=> {
    app.use('/api', createProxyMiddleware({
        target: 'http://175.27.138.160:8880',
        changeOrigin: true,
        pathRewrite: {
            '^/api':''
        }
    }));
    app.use('/socket.io', createProxyMiddleware({
        target: 'wss://175.27.138.160',
        changeOrigin: true,
        ws: true
    }));
}