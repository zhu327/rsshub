const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const url = `https://agora0.gitlab.io/news/${id}/`;
    const response = await got.get(url);
    const $ = cheerio.load(response.data);

    const title = $("title").text();

    const out = $("h4 > a")
        .map(function () {
            let pubDate = $($(this).parent().prevAll()[1]).text();
            pubDate = new Date(pubDate).toUTCString();

            const info = {
                title: $(this).text(),
                link: $(this).attr('href'),
                pubDate: pubDate,
            };
            return info;
        })
        .get();

    ctx.state.data = {
        title,
        url,
        item: out,
    };
};
