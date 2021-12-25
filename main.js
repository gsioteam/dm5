const PER_PAGE = 40;

class MainController extends Controller {

    load(data) {
        this.id = data.id;
        this.url = data.url;
        this.page = 0;

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
            hasMore: this.id !== 'update'
        };

        this.userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Mobile Safari/537.36';

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
                this.data.hasMore = items.length >= PER_PAGE;
            });
        } catch (e) {
            showToast(`${e}\n${e.stack}`);
            this.setState(()=>{
                this.data.loading = false;
            });
        }
        
    }

    makeURL(page) {
        return this.url.replace('{0}', page + 1).replace('{1}', PER_PAGE);
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
            let items = this.parseData(text, url);
            this.page = 0;
            localStorage['cache_' + this.id] = JSON.stringify({
                time: new Date().getTime(),
                items: items,
            });
            this.setState(()=>{
                this.data.list = items;
                this.data.loading = false;
                this.data.hasMore = this.id !== 'update' && items.length >= PER_PAGE;
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
        if (this.id === 'update') {
            return this.parseHomeData(text, url);
        } else {
            return this.parsePageData(text, url);
        } 
    }

    parseHomeData(html, url) {
        const doc = HTMLParser.parse(html);

        let list = doc.querySelectorAll('.manga-list');

        let results = [];

        for (let node of list) {
            results.push({
                header: true,
                title: node.querySelector('.manga-list-title').text.match(/[^\ ]+/)[0],
                picture: 'https://css99tel.cdndm5.com/v202008141414/dm5/images/sd/index-title-1.png'
            });

            let book_nodes = node.querySelectorAll('.swiper-slide > li');
            for (let book_node of book_nodes) {
                let link = book_node.querySelector('a');
                let subtitle = book_node.querySelector(".manga-list-1-tip")
                if (!subtitle) {
                    subtitle = book_node.querySelector(".manga-list-2-tip")
                }
                if (!subtitle) {
                    subtitle = book_node.querySelector(".rank-list-info-right-subtitle")
                }

                results.push({
                    title: link.getAttribute('title'),
                    link: new URL(link.getAttribute('href'), url).toString(),
                    picture: book_node.querySelector('img').getAttribute('data-cfsrc'),
                    pictureHeaders: {
                        Referer: url
                    },
                    subtitle: subtitle == null ? null : subtitle.text,
                });
            }
        }

        return results;
    }

    parsePageData(text, url) {
        const json = JSON.parse(text);
        let items = json['UpdateComicItems'];

        let results = [];
        for (let item of items) {
            results.push({
                title: item['Title'],
                subtitle: item['Author'].join(','),
                picture: item['ShowPicUrlB'],
                pictureHeaders: {
                    Referer: url
                },
                link: new URL(`/${item['UrlKey']}`, url).toString(),
            });
        }
        return results;
    }

}

module.exports = MainController;