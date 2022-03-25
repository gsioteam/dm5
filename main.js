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
            hasMore: this.id != 'recommend'
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
                this.data.hasMore = this.id != 'recommend' && items.length > 0;
            });
        } catch (e) {
            showToast('没有更多了');
            this.setState(()=>{
                this.data.loading = false;
            });
        }
        
    }

    makeURL(page) {
        if (page == 0) {
            return this.url;
        } else {
            if (this.id == 'rank-total') {
                return this.url + `total-block-${page + 1}.shtml`;
            } else if (this.id == 'update') {
                return this.url.replace('update_1', `update_${page + 1}`);
            } else if (this.id.search('rank') != -1) {
                return this.url.replace('block-1', `block-${page + 1}`);
            } else if (this.id.search('category') != -1) {
                return this.url.replace('.shtml', `/${page + 1}.shtml`);
            } else {
                return this.url;
            }
        }
    }

    async reload() {
        this.setState(() => {
            this.data.loading = true;
        });
        try {
            let items = [];
            let url = this.makeURL(0);
            if (this.id == 'recommend') {
                this.text_recommend = []; //储存推荐页的json数据
                this.list_recommend = [47, 52, 53, 54, 55, 56]; //推荐页类别标志
                for (let id of this.list_recommend) {
                    if (id != 56) {
                        let url_rcommend = `https://nnv3api.muwai.com/recommend/batchUpdate?category_id=${id}`;
                        let res = await fetch(url_rcommend, {
                            headers: {
                                'User-Agent': this.userAgent,
                            }
                        });
                        let text = await res.text();
                        this.text_recommend.push(text);
                    } else {
                        let res = await fetch(url, {
                            headers: {
                                'User-Agent': this.userAgent,
                            }
                        });
                        let text = await res.text();
                        this.text_recommend.push(text);
                    }
                }
                items = this.parseRecommendData(url);
            } else {
                let res = await fetch(url, {
                    headers: {
                        'User-Agent': this.userAgent,
                    }
                });
                let text = await res.text();
                items = this.parseData(text, url); //获取信息
            }
            this.page = 0;
            //存至本地作为缓存
            localStorage['cache_' + this.id] = JSON.stringify({
                time: new Date().getTime(),
                items: items,
            });
            this.setState(()=>{
                this.data.list = items;
                this.data.loading = false;
                this.data.hasMore = this.id != 'recommend' && items.length > 0;
            });
        } catch (e) {
            showToast('没有更多了');
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
        } else if (this.id.search('rank') != -1) {
            return this.parseRankData(text, url);
        } else if (this.id.search('category') != -1) {
            return this.parseCategoryData(text, url);
        }
    }

    //分类界面，通过网页获取
    parseCategoryData(text, url) {
        const doc = HTMLParser.parse(text);
        let list = doc.querySelector('.tcaricature_block2').querySelectorAll('ul');
        let results = [];
        for (let node of list) {
            let info = node.querySelector('a');
            results.push({
                title: info.getAttribute('title'),
                link: `https://manhua.dmzj.com${info.getAttribute('href')}`,
                picture: node.querySelector('img').getAttribute('src'),
                pictureHeaders: {
                    Referer: url
                },
                subtitle: node.querySelector('.black_font12').textContent,
            });
        }
        return results;
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
    parseRecommendData(url){
        let results = [];
        let image_list = ['https://m.dmzj.com/images/icon_h2_1.png', 'https://m.dmzj.com/images/icon_h2_5.png',
                            'https://m.dmzj.com/images/icon_h2_6.png', 'https://m.dmzj.com/images/icon_h2_7.png',
                            'https://m.dmzj.com/images/icon_h2_8.png', 'https://m.dmzj.com/images/icon_h2_9.png'];
        for (let text of this.text_recommend) {
            let json = JSON.parse(text);
            if (this.list_recommend[this.text_recommend.indexOf(text)] == 56) {
                results.push({
                    header: true,
                    title: json[8]['title'],
                    picture: image_list[this.text_recommend.indexOf(text)]
                });
                for (let data of json[8]['data']) {
                    results.push({
                        title: data['title'],
                        subtitle: data['authors'],
                        picture: data['cover'],
                        pictureHeaders: {
                            Referer: url
                        },
                        link: `http://api.dmzj.com/dynamic/comicinfo/${data['id']}.json`,
                    });
                }
            } else {
                results.push({
                    header: true,
                    title: json['data']['title'],
                    picture: image_list[this.text_recommend.indexOf(text)]
                });
                for (let data of json['data']['data']){
                    if (data['type'] == 1) {
                        let sub_title = data['sub_title'];
                        sub_title = sub_title.substring(3,sub_title.length)
                        results.push({
                            title: data['title'],
                            subtitle: sub_title,
                            picture: data['cover'],
                            pictureHeaders: {
                                Referer: url
                            },
                            link: `http://api.dmzj.com/dynamic/comicinfo/${data['obj_id']}.json`,
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
