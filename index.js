class IndexController extends Controller {
    load() {
        this.data = {
            tabs: [
                {
                    "title": "更新",
                    "id": "update",
                    "url": "https://m.dm5.com/"
                },
                {
                    "title": "日韩",
                    "id": "japan",
                    "url": "https://m.dm5.com/dm5.ashx?pagesize={1}&pageindex={0}&sort=2&areaid=36&action=getclasscomics"
                },
                {
                    "title": "港台",
                    "id": "hongkong",
                    "url": "https://m.dm5.com/dm5.ashx?pagesize={1}&pageindex={0}&sort=2&areaid=35&action=getclasscomics"
                },
                {
                    "title": "大陆",
                    "id": "china",
                    "url": "https://m.dm5.com/dm5.ashx?pagesize={1}&pageindex={0}&sort=2&areaid=37&action=getclasscomics"
                },
                {
                    "title": "欧美",
                    "id": "europe",
                    "url": "https://m.dm5.com/dm5.ashx?pagesize={1}&pageindex={0}&sort=2&areaid=52&action=getclasscomics"
                }, 
            ]
        };
    }
}

module.exports = IndexController;