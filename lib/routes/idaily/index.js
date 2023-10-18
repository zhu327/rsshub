const got = require('@/utils/got');

module.exports = async (ctx) => {
    const respData = await got({
        method: 'get',
        url: 'http://idaily-cdn.idailycdn.com/api/list/v3/iphone/zh-hans?page=1&ver=iphone',
    }).json();

    const firstItem = respData[0];
    const data = respData.filter((item) => item.title === firstItem.title && item.ui_sets && item.ui_sets.caption_subtitle);

    // 用于存储生成的HTML字符串
    var html = '';

    // 遍历data数组
    data.forEach(function (item) {
        // 生成每个项的HTML字符串
        var itemHtml = `<div><h2>${item.ui_sets.caption_subtitle}</h2>${item.content}<br><img src='${item.cover_landscape}'></div>`;

        // 将当前项的HTML字符串添加到总的HTML字符串中
        html += itemHtml;
    });

    ctx.state.data = {
        title: `iDaily 每日环球视野`,
        description: 'iDaily 每日环球视野',
        item: [{
            title: firstItem.title,
            description: html,
            pubDate: new Date(firstItem.pubdate_timestamp * 1000).toUTCString(),
            link: firstItem.link_share,
        }],
    };
};
