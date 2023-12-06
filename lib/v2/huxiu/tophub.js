const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
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
            };
            return info;
        })
        .get().slice(0, 10);

    ctx.state.data = {
        title: title,
        url,
        description: '聚合优质的创新信息与人群，捕获精选 | 深度 | 犀利的商业科技资讯。在虎嗅，不错过互联网的每个重要时刻。',
        item: list,
    };
};
