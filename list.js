class ListController extends Controller {

    load(data) {
        this.url = data.link;
        let list = [];

        this.data = {
            title: data.title,
            subtitle: data.subtitle,
            picture: data.picture,
            pictureHeaders: {
                Referer: 'http://manhua.dmzj.com/'
            },
            list: list,
            loading: false,
        };

        this.userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Mobile Safari/537.36';

        this.reload();

    }

    async onPressed(index) {
        await this.navigateTo('book', {
            data: this.data.list[index]
        });
    }

    onRefresh() {
        this.reload();
    }

    async reload() {
        this.setState(() => {
            this.data.loading = true;
        });
        try {
            let items = [];
            let url = this.url;
            let res = await fetch(url, {
                headers: {
                    'User-Agent': this.userAgent,
                }
            });
            let text = await res.text();
            items = this.parseData(text, url); //获取信息
            this.setState(()=>{
                this.data.list = items;
                this.data.loading = false;
            });
        } catch (e) {
            showToast(`${e}\n${e.stack}`);
            this.setState(()=>{
                this.data.loading = false;
            });
        }
    }

    parseData(text, url) {
        const json = JSON.parse(text);
        let results = [];
        if (url.search('/UCenter/author/') == -1) { //若不为作者信息
            for (let comic of json['data']['comics']) {
                results.push({
                    title: comic['name'],
                    link: `http://api.dmzj.com/dynamic/comicinfo/${comic['id']}.json`,
                    picture: comic['cover'],
                    pictureHeaders: {
                        Referer: 'http://manhua.dmzj.com/'
                    },
                    subtitle: comic['recommend_brief'],
                });
            }
        } else {
            for (let comic of json['data']) {
                results.push({
                    title: comic['name'],
                    link: `http://api.dmzj.com/dynamic/comicinfo/${comic['id']}.json`,
                    picture: comic['cover'],
                    pictureHeaders: {
                        Referer: 'http://manhua.dmzj.com/'
                    },
                    subtitle: '',
                });
            }
        }
        return results;
    }
}

module.exports = ListController;