const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const config = require('@/config').value;
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const mid = ctx.params.mid;
    const tagId = encodeURIComponent(mid);
    const homePageInfoUrl = `https://i.news.qq.com/web_backend/v2/getTagInfo?tagId=${tagId}`;
    const data = await ctx.cache.tryGet(homePageInfoUrl, async () => (await got(homePageInfoUrl)).data.data, config.cache.routeExpire, false);
    const title = data.lead;
    const abstract = data.shareAbstract;

    const news = data.tabs[0].articleList;
    const items = await Promise.all(
        news.map((item) => {
            const title = item.title;
            const pubDate = parseDate(item.publish_time, 'YYYY-MM-DD HH:mm:ss');
            const itemUrl = item.link_info.url;
            const author = item.media_info.chl_name;
            const abstract = item.desc;

            return item.articletype === '4'
                ? {
                      title,
                      description: abstract,
                      link: itemUrl,
                      author,
                      pubDate,
                  }
                : ctx.cache.tryGet(itemUrl, async () => {
                      const response = await got(itemUrl);
                      const $ = cheerio.load(response.data);
                      const data = JSON.parse(
                          $('script:contains("window.DATA")')
                              .text()
                              .match(/window\.DATA = ({.+});/)[1]
                      );
                      const $data = cheerio.load(data.originContent.text, null, false);

                      $data('*')
                          .contents()
                          .filter((_, elem) => elem.type === 'comment')
                          .replaceWith((_, elem) =>
                              art(path.join(__dirname, '../templates/news/image.art'), {
                                  attribute: elem.data.trim(),
                                  originAttribute: data.originAttribute,
                              })
                          );

                      return {
                          title,
                          description: $data.html() || abstract,
                          link: itemUrl,
                          author,
                          pubDate,
                      };
                  });
        })
    );

    ctx.state.data = {
        title,
        abstract,
        link: `https://news.qq.com/tag/${mid}`,
        item: items,
    };
};
