export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/*', '/api/*'],
            },
        ],
        sitemap: 'https://spi-smart-campus.vercel.app/sitemap.xml',
    };
}
