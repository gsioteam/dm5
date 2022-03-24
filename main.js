class MainController extends Controller {

    load(data) {
        this.id = data.id;
        this.url = data.url;

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
        }
        const json = JSON.parse(text);
        let items = []
        if (this.id === 'recently') {
            items = json[1]['data'];
        } else if (this.id === 'new') {
            items = json[8]['data'];
        } else {
            items = json['data']['data']
        }
        let results = [];
        for (let item of items) {
            if (this.id == 'new' || this.id == 'random'){
                results.push({
                    title: item['title'],
                    subtitle: item['authors'],
                    picture: item['cover'],
                    pictureHeaders: {
                        Referer: url
                    },
                    link: `http://api.dmzj.com/dynamic/comicinfo/${item['id']}.json`,
                });
            } else {
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
                subtitle: '',
            });
        }
    }
}

module.exports = MainController;