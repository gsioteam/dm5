class IndexController extends Controller {
    load() {
        this.data = {
            tabs: [
                {
                    "title": "推荐",
                    "id": "recommend",
                    "url": "https://v3api.dmzj.com/v3/recommend.json"
                },
                {
                    "title": "少年漫画",
                    "id": "category-shaonian",
                    "url": "http://manhua.dmzj.com/tags/shaonian.shtml"
                },
                {
                    "title": "少女漫画",
                    "id": "category-shaonv",
                    "url": "http://manhua.dmzj.com/tags/shaonv.shtml"
                },
                {
                    "title": "青年漫画",
                    "id": "category-qingnian",
                    "url": "http://manhua.dmzj.com/tags/qingnian.shtml"
                },
                {
                    "title": "日漫",
                    "id": "category-riben",
                    "url": "http://manhua.dmzj.com/tags/riben.shtml"
                },
                {
                    "title": "美漫",
                    "id": "category-oumei",
                    "url": "http://manhua.dmzj.com/tags/oumei.shtml"
                },
                {
                    "title": "更新",
                    "id": "update",
                    "url": "https://manhua.dmzj.com/update_1.shtml"
                },
                {
                    "title": "总人气排行",
                    "id": "rank-total",
                    "url": "https://manhua.dmzj.com/rank/"
                },
                {
                    "title": "本月人气排行",
                    "id": "rank-month",
                    "url": "https://manhua.dmzj.com/rank/month-block-1.shtml"
                },
                {
                    "title": "本周人气排行",
                    "id": "rank-week",
                    "url": "https://manhua.dmzj.com/rank/week-block-1.shtml"
                },
                {
                    "title": "本日人气排行",
                    "id": "rank-block",
                    "url": "https://manhua.dmzj.com/rank/day-block-1.shtml"
                },
                {
                    "title": "订阅排行",
                    "id": "rank-subscribe",
                    "url": "https://manhua.dmzj.com/rank/subscribe/block-1.shtml"
                },
            ]
        };
    }
}

module.exports = IndexController;