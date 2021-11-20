const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = app=> {
    app.use('/socket.io', createProxyMiddleware({
        target: 'wss://localhost:443',
        changeOrigin: true,
        ws: true
    }))
}