class MainController extends Controller {

    load(data) {
        this.id = data.id;
        this.url = data.url;
        this.page = 1;

        //查找缓存
        var cached = this.readCache();
        let list;
        if (cached) {
            list = cached.items;
        } else {
            list = [];
        }

        this.data = {
            list: list,
            loading: false,
            hasMore: false
        };

        this.userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Mobile Safari/537.36';

        //判断是否重新加载
        if (cached) {
            let now = new Date().getTime();
            if (now - cached.time > 30 * 60 * 1000) {
                this.reload();
            }
        } else {
            this.reload();
        }

    }

    async onPressed(index) {
        await this.navigateTo('book', {
            data: this.data.list[index]
        });
    }

    onRefresh() {
        this.reload();
    }

    async onLoadMore() {

    }

    async reload() {
        this.setState(() => {
            this.data.loading = true;
        });
        try {
            let url = this.url;
            let res = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                }
            });
            let text = await res.text();
            let items = this.parseData(text, url); //获取信息
            //存至本地作为缓存
            localStorage['cache_' + this.id] = JSON.stringify({
                time: new Date().getTime(),
                items: items,
            });
            this.setState(()=>{
                this.data.list = items;
                this.data.loading = false;
                this.data.hasMore = false;
            });
        } catch (e) {
            showToast(`${e}\n${e.stack}`);
            this.setState(()=>{
                this.data.loading = false;
            });
        }
    }

    readCache() {
        let cache = localStorage['cache_' + this.id];
        if (cache) {
            let json = JSON.parse(cache);
            return json;
        }
    }

    parseData(text, url) {
        if (this.id == 'update') {
            return this.parseUpdateData(text, url);
        } else if (this.id == 'recommend') {
            return this.parseRecommendData(text, url);
        }
        return results;
    }

    parseRecommendData(text, url){
        const json = JSON.parse(text);
        let results = [];
        for (let category of json) {
            let list = [47, 52, 53, 54, 55]; //限定类别
            if (list.indexOf(category['category_id']) > -1){
                results.push({
                    header: true,
                    title: category['title'],
                    picture: 'https://css99tel.cdndm5.com/v202008141414/dm5/images/sd/index-title-1.png'
                });
                let items = category['data'];
                for (let item of items) {
                    let sub_title = item['sub_title'];
                    sub_title = sub_title.substring(3,sub_title.length)
                    results.push({
                        title: item['title'],
                        subtitle: sub_title,
                        picture: item['cover'],
                        pictureHeaders: {
                            Referer: url
                        },
                        link: `http://api.dmzj.com/dynamic/comicinfo/${item['obj_id']}.json`,
                    });
                }
            }
        }
        return results;
    }

    parseUpdateData(text, url){
        const doc = HTMLParser.parse(text);
        let list = doc.querySelectorAll('.boxdiv1');
        let results = [];
        for (let node of list) {
            let info = node.querySelector('a');
            results.push({
                title: info.getAttribute('title'),
                link: `https://manhua.dmzj.com/${info.getAttribute('href')}`,
                picture: node.querySelector('img').getAttribute('src'),
                pictureHeaders: {
                    Referer: url
                },
                subtitle: node.querySelector('.gray12').textContent,
            });
        }
        return results
    }
}

module.exports = MainController;