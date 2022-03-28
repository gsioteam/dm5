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
        const doc = HTMLParser.parse(text);

        let list = doc.querySelectorAll('.book-list li');

        let results = [];
        for (let item of list) {
            let picture_url = item.querySelector('img').getAttribute('data-cfsrc');
            if (typeof picture_url == 'undefined') {
                picture_url = item.querySelector('img').getAttribute('src');
            }
            results.push({
                title: item.querySelector('.book-list-info-title').text,
                subtitle: '',
                picture: picture_url,
                pictureHeaders: {
                    Referer: url
                },
                link: `https://m.dm5.com${item.querySelector('a').getAttribute('href')}`,
            });
        }
        return results;
    }
}

module.exports = ListController;