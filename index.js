class IndexController extends Controller {
    load() {
        this.data = {
            tabs: [
                {
                    "title": "近期必看",
                    "id": "recently",
                    "url": "https://v3api.dmzj.com/v3/recommend.json"
                },
                {
                    "title": "国漫也精彩",
                    "id": "chinese",
                    "url": "https://v3api.dmzj.com/v3/recommend.json"
                },
                {
                    "title": "美漫大事件",
                    "id": "american",
                    "url": "https://v3api.dmzj.com/v3/recommend.json"
                },
                {
                    "title": "热门连载",
                    "id": "ongoing",
                    "url": "https://v3api.dmzj.com/v3/recommend.json"
                },
                {
                    "title": "条漫专区",
                    "id": "webtoon",
                    "url": "https://v3api.dmzj.com/v3/recommend.json"
                },
                {
                    "title": "最新上架",
                    "id": "new",
                    "url": "https://v3api.dmzj.com/v3/recommend.json"
                },
            ]
        };
    }
}

module.exports = IndexController;