const got = require('@/utils/got');
const cheerio = require('cheerio');
const { fixArticleContent } = require('@/utils/wechat-mp');

let cachedDefuddle;
const getDefuddle = async () => (cachedDefuddle ??= (await import('defuddle/node')).Defuddle);

/** @param {string} hostname */
const isSkippedHost = (hostname) => hostname === 'ichouti.cn' || hostname.endsWith('.ichouti.cn') || hostname === 'weibo.cn' || hostname.endsWith('.weibo.cn') || hostname === 'weibo.com' || hostname.endsWith('.weibo.com');

const WECHAT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.34(0x16082222) NetType/WIFI Language/zh_CN',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'Accept-Language': 'zh-CN,zh;q=0.9',
};

/**
 * 为 RSS item 抓取全文内容。
 * 规则：
 *   1. ichouti.cn 链接 → 跳过
 *   2. weibo.cn / weibo.com 链接 → 跳过
 *   3. mp.weixin.qq.com → 用微信 UA 请求 + fixArticleContent 提取
 *   4. 其他链接 → defuddle 提取
 *   失败时保留原始 description 不变。
 *
 * @param {Object} item - RSS item（需包含 link 和 description）
 * @param {Object} cache - ctx.cache
 * @returns {Promise<Object>} 填充了全文的 item
 */
const fetchFullText = async (item, cache) => {
    try {
        if (isSkippedHost(new URL(item.link).hostname)) {
            return item;
        }
    } catch {
        return item;
    }

    return await cache.tryGet(`chouti-fulltext-${item.link}`, async () => {
        try {
            if (/mp\.weixin\.qq\.com/i.test(item.link)) {
                const { data: html } = await got(item.link, { headers: WECHAT_HEADERS });
                const $ = cheerio.load(html);
                const content = fixArticleContent($('#js_content'));
                if (content?.trim()) {
                    item.description = content;
                }
                return item;
            }

            const Defuddle = await getDefuddle();
            const { data: html } = await got(item.link);
            const result = await Defuddle(html, item.link, { markdown: false });
            if (result?.content?.trim()) {
                item.description = result.content;
                if (result.author && !item.author) {
                    item.author = result.author;
                }
            }
        } catch {
            // 抓取失败，保留原始 description
        }
        return item;
    });
};

module.exports = { fetchFullText };
