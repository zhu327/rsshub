const got = require('@/utils/got');

const { apiClubRootUrl, processItems, fetchData, rootUrl } = require('./util');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 20;

    const apiUrl = new URL('briefColumn/getContentListByCategoryId', apiClubRootUrl).href;
    const currentUrl = new URL(`club/${id}.html`, rootUrl).href;

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            brief_column_id: id,
            pagesize: limit,
        },
    });

    const datalist = response.data.datalist;
    ctx.state.json = datalist;
    const items = await processItems(datalist, limit, ctx.cache.tryGet);

    const data = await fetchData(currentUrl);

    ctx.state.data = {
        item: items,
        ...data,
    };
};
