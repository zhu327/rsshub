const got = require('@/utils/got');

const { apiClubRootUrl, processItems, fetchClubData } = require('./util');

module.exports = async (ctx) => {
    const { id } = ctx.params;
    const limit = ctx.query.limit ? Number.parseInt(ctx.query.limit, 10) : 20;

    const apiUrl = new URL('club/briefList', apiClubRootUrl).href;

    const data = await fetchClubData(id);

    const { data: response } = await got.post(apiUrl, {
        form: {
            platform: 'www',
            club_id: id,
            pagesize: limit,
        },
    });

    const datalist = response.data.datalist;
    ctx.state.json = datalist;
    const items = await processItems(datalist, limit, ctx.cache.tryGet);

    ctx.state.data = {
        item: items,
        ...data,
    };
};
