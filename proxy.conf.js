const protractor = require('./protractor.conf.js')

const proxy_remote_server_address = 'https://dev-beerbox.npmgroup.ru';
//const proxy_remote_server_address = 'https://beerbox.npmgroup.ru';

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
            '/get_csrf',
            '/export'
        ],
        target: proxy_remote_server_address,
        secure: false,
        changeOrigin: true
    },
    {
        context: '/ws/',
        pathRewrite: {
            '^/ws*': '/wss',
        },
        target: proxy_remote_server_address,
        secure: false,
        ws: true,
        changeOrigin: true
    }
]

module.exports = PROXY_CONFIG
