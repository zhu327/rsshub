const got = require('@/utils/got');
const cheerio = require('cheerio');

const { domain, fetchItem } = require('./util');

module.exports = async (ctx) => {
    const limit = ctx.query.limit ? parseInt(ctx.query.limit, 10) : 5;

    const url = `https://tophub.today`;
    const listRes = await got({
        method: 'get',
        url,
    });

    const $ = cheerio.load(listRes.data);

    const anchor = $(`[href='/n/5VaobgvAj1']`);
    const title = anchor.find(".cc-cd-lb > span").text().trim();

    const list = anchor.parents(".cc-cd").find(".cc-cd-cb-l > a")
        .map(function () {
            const info = {
                title: $(this).find('.t').text(),
                link: $(this).attr('href'),
                guid: $(this).attr('href'),
            };
            return info;
        })
        .get().slice(0, limit);

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.guid, async () => {
                if (!new RegExp(domain, 'i').test(new URL(item.link).hostname)) {
                    return item;
                } else if (!item.guid.startsWith('huxiu-moment')) {
                    return await fetchItem(item);
                }

                return item;
            })
        )
    );

    ctx.state.data = {
        title: title,
        url,
        description: '聚合优质的创新信息与人群，捕获精选 | 深度 | 犀利的商业科技资讯。在虎嗅，不错过互联网的每个重要时刻。',
        item: items,
    };
};
