const protractor = require('./protractor.conf.js')

const PROXY_CONFIG = [
    {
        context: [
            '/en',
            '/fr',
            '/ru'
        ],
        target: protractor.config.baseUrl,
        secure: false,
        pathRewrite: {
            '^/en': '',
            '^/fr': '',
            '^/ru': ''
        }
    },
    {
        context: [
            '/api',
            '/get_csrf'
        ],
        target: 'https://beerbox.npmgroup.ru',
        secure: false,
        changeOrigin: true
    },
    {
        context: '/ws/',
        pathRewrite: {
            '^/ws*': '/wss',
        },
        target: 'https://beerbox.npmgroup.ru',
        secure: false,
        ws: true,
        changeOrigin: true
    }
]

module.exports = PROXY_CONFIG
