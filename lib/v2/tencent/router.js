module.exports = (router) => {
    router.get('/news/author/:mid', require('./news/author'));
    router.get('/news/coronavirus/data/:province?/:city?', require('./news/coronavirus/data'));
    router.get('/news/coronavirus/total', require('./news/coronavirus/total'));
    router.get('/pvp/newsindex/:type', require('./pvp/newsindex'));
    router.get('/qq/sdk/changelog/:platform', require('./qq/sdk/changelog'));
    router.get('/news/tag/:mid', require('./news/tag'));
};
