import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

export const route: Route = {
    path: ['/:language?'],
    name: '每日环球视野',
    example: '/idaily',
    maintainers: ['zphw', 'nczitzk'],
    parameters: { language: '语言，见下表，默认为简体中文' },
    radar: [
        {
            source: ['idai.ly/'],
        },
    ],
    handler,
    description: `| 简体中文 | 繁体中文 |
  | -------- | -------- |
  | zh-hans  | zh-hant  |`,
};

async function handler(ctx) {
    const { language = 'zh-hans' } = ctx.req.param();
    const limit = ctx.req.query('limit') ? Number.parseInt(ctx.req.query('limit'), 10) : 100;

    const rootUrl = 'https://idaily-cdn.idailycdn.com';
    const apiUrl = new URL(`api/list/v3/iphone/${language}`, rootUrl).href;
    const currentUrl = 'https://idai.ly';

    const { data: response } = await got(apiUrl);
    const firstItem = response[0];
    const data = response.filter((item) => item.title === firstItem.title && item.ui_sets && item.ui_sets.caption_subtitle);

    // 用于存储生成的HTML字符串
    var html = '';

    // 遍历data数组
    data.forEach(function (item) {
        // 生成每个项的HTML字符串
        var itemHtml = `<div><h2>${item.ui_sets.caption_subtitle}</h2>${item.content}<br><img src='${item.cover_landscape}'></div>`;

        // 将当前项的HTML字符串添加到总的HTML字符串中
        html += itemHtml;
    });

    const { data: currentResponse } = await got(currentUrl);

    const $ = load(currentResponse);

    const title = $('title').text();
    const image = new URL('img/idaily/logo_2x.png', currentUrl).href;

    return {
        item: [{
            title: firstItem.title,
            link: firstItem.link_share,
            description: firstItem.title,
            guid: firstItem.link_share,
            pubDate: new Date(firstItem.pubdate_timestamp * 1000).toUTCString(),
        }],
        title: `iDaily 每日环球视野`,
        description: 'iDaily 每日环球视野',
        link: currentUrl,
        language: 'zh',
        image,
        subtitle: $('meta[name="keywords"]').prop('content'),
        author: title.split(/\s/)[0],
        allowEmpty: true,
    };
}
