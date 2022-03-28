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
        if (this.id == 'booklist') {
            await this.navigateTo('list', {
                data: this.data.list[index]
            });
        } else {
            await this.navigateTo('book', {
                data: this.data.list[index]
            });
        }
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
        } else if (this.id == 'booklist') {
            return this.parseBookData(text, url);
        } else {
            return this.parsePageData(text, url);
        } 
    }

    parseBookData(html, url) {
        const doc = HTMLParser.parse(html);

        let list = doc.querySelectorAll('.manga-list-1 li');

        let results = [];

        for (let item of list) {
            let picture_url = item.querySelector('img').getAttribute('data-cfsrc');
            if (typeof picture_url == 'undefined') {
                picture_url = item.querySelector('img').getAttribute('src');
            }
            results.push({
                subject: true,
                title: item.querySelector('.manga-list-1-title').text,
                subtitle: item.querySelector('.manga-list-1-tip').text,
                picture: picture_url,
                pictureHeaders: {
                    Referer: url
                },
                link: `https://m.dm5.com${item.querySelector('a').getAttribute('href')}`,
            });
        }
        return results;
    }

    parseHomeData(html, url) {
        const doc = HTMLParser.parse(html);

        let list = doc.querySelectorAll('.manga-list');

        let results = [];

        for (let node of list) {
            if (list.indexOf(node) == 3) {
                continue;
            }
            let get_title = node.querySelector('.manga-list-title').text.match(/[^\ ]+/)[0];
            if (list.indexOf(node) != 6) {
                get_title = get_title.substring(0, get_title.length - 2)
            } 
            results.push({
                header: true,
                title: get_title,
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
                let picture_url = book_node.querySelector('img').getAttribute('data-cfsrc');
                if (typeof picture_url == 'undefined') {
                    picture_url = book_node.querySelector('img').getAttribute('src');
                }
                results.push({
                    title: link.getAttribute('title'),
                    link: new URL(link.getAttribute('href'), url).toString(),
                    picture: picture_url,
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