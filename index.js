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
                    "title": "随便看看",
                    "id": "random",
                    "url": "https://nnv3api.muwai.com/recommend/batchUpdate?category_id=50"
                },
                {
                    "title": "国漫也精彩",
                    "id": "chinese",
                    "url": "https://nnv3api.muwai.com/recommend/batchUpdate?category_id=52"
                },
                {
                    "title": "美漫大事件",
                    "id": "american",
                    "url": "https://nnv3api.muwai.com/recommend/batchUpdate?category_id=53"
                },
                {
                    "title": "热门连载",
                    "id": "ongoing",
                    "url": "https://nnv3api.muwai.com/recommend/batchUpdate?category_id=54"
                },
                {
                    "title": "条漫专区",
                    "id": "webtoon",
                    "url": "https://nnv3api.muwai.com/recommend/batchUpdate?category_id=55"
                },
                {
                    "title": "最新上架",
                    "id": "new",
                    "url": "https://v3api.dmzj.com/v3/recommend.json"
                },
                {
                    "title": "最新更新",
                    "id": "update",
                    "url": "https://manhua.dmzj.com/update_1.shtml"
                },
            ]
        };
    }
}

module.exports = IndexController;