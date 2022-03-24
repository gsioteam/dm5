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
                    "title": "更新",
                    "id": "update",
                    "url": "https://manhua.dmzj.com/update_1.shtml"
                },
            ]
        };
    }
}

module.exports = IndexController;