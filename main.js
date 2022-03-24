const PAGE_NUM = 10; //最大页数

class MainController extends Controller {

    load(data) {
        this.id = data.id;
        this.url = data.url;
        this.page = 0;

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
            hasMore: this.id !== 'recommend'
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
        this.setState(() => {
            this.data.loading = true;
        });
        try {

            let page = this.page + 1;
            let url = this.makeURL(page);
            let res = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                }
            });
            let text = await res.text();
            this.page = page;
            let items = this.parseData(text, url);
    
            this.setState(()=>{
                for (let item of items) {
                    this.data.list.push(item);
                }
                this.data.loading = false;
                this.data.hasMore = this.page + 1 < PAGE_NUM;
            });
        } catch (e) {
            showToast(`${e}\n${e.stack}`);
            this.setState(()=>{
                this.data.loading = false;
            });
        }
        
    }

    makeURL(page) {
        if (this.id == 'rank' && page != 0) {
            return this.url + `total-block-${page + 1}.shtml`;
        } else if (this.id == 'update') {
            return this.url.replace('update_1', `update_${page + 1}`);
        } else {
            return this.url;
        }
    }

    async reload() {
        this.setState(() => {
            this.data.loading = true;
        });
        try {
            let url = this.makeURL(0);
            let res = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                }
            });
            let text = await res.text();
            let items = this.parseData(text, url); //获取信息
            this.page = 0;
            //存至本地作为缓存
            localStorage['cache_' + this.id] = JSON.stringify({
                time: new Date().getTime(),
                items: items,
            });
            this.setState(()=>{
                this.data.list = items;
                this.data.loading = false;
                this.data.hasMore = this.id !== 'recommend' && this.page + 1 < PAGE_NUM;
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
        } else if (this.id == 'rank') {
            return this.parseRankData(text, url);
        }
    }

    //排行页面，通过网页获取
    parseRankData(text, url){
        const doc = HTMLParser.parse(text);
        let list = doc.querySelectorAll('.middlerighter1');
        let results = [];
        for (let node of list) {
            let info = node.querySelector('a');
            results.push({
                title: info.getAttribute('title'),
                link: info.getAttribute('href'),
                picture: node.querySelector('img').getAttribute('src'),
                pictureHeaders: {
                    Referer: url
                },
                subtitle: node.querySelectorAll('.righter-mr')[1].querySelector('span').textContent,
            });
        }
        return results;
    }

    //推荐页面，通过api获取
    parseRecommendData(text, url){
        const json = JSON.parse(text);
        let results = [];
        for (let category of json) {
            let list = [47, 52, 53, 54, 55, 56]; //限定类别
            let image_list = ['https://m.dmzj.com/images/icon_h2_1.png', 'https://m.dmzj.com/images/icon_h2_5.png',
                            'https://m.dmzj.com/images/icon_h2_6.png', 'https://m.dmzj.com/images/icon_h2_7.png',
                            'https://m.dmzj.com/images/icon_h2_8.png', 'https://m.dmzj.com/images/icon_h2_9.png'];
            if (list.indexOf(category['category_id']) > -1){
                results.push({
                    header: true,
                    title: category['title'],
                    picture: image_list[list.indexOf(category['category_id'])]
                });
                let items = category['data'];
                if (category['category_id'] == 56) {
                    for (let item of items) {
                        results.push({
                            title: item['title'],
                            subtitle: item['authors'],
                            picture: item['cover'],
                            pictureHeaders: {
                                Referer: url
                            },
                            link: `http://api.dmzj.com/dynamic/comicinfo/${item['id']}.json`,
                        });
                    }
                } else {
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
        }
        return results;
    }

    //更新页面，通过网页获取
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
        return results;
    }
}

module.exports = MainController;