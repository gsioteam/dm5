const bookFetch = require('./book_fetch');

/**
 * @property {String}key need override the key for caching
 * @method load need override,
 * @method checkNew need override
 */
class MangaProcessor extends Processor {

    // The key for caching data
    get key() {
        return this.data.link;
    }

    /**
     * 
     * Start load pictures
     * 
     * @param {*} state The saved state.
     */
    async load(state) {
        try {
            let url = this.data.link;
            let res = await fetch(url);
            let text = await res.text();
            const that = this;
            function getImage(text, url) {
                const json = JSON.parse(text);
                let data = [];
                for (let img_url of json['page_url']) { //获取图片链接列表
                    data.push({
                        url: img_url,
                        headers: {
                            Referer: url
                        }
                    });
                }
                console.log(`setData ${JSON.stringify(data)}`);
                that.setData(data);
                return true;
            }
            if (getImage(text, url)) this.save(true, state);
            
            this.loading = false;
        } catch (e) {
            console.log(`err ${e}\n${e.stack}`);
            this.loading = false;
        }
    }

    async fetch(url) {
        console.log(`request ${url}`);
        let res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Mobile Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9',
            }
        });
        let text = await res.text();
        return text;
    }

    // Called in `dispose`
    unload() {

    }

    // Check for new chapter
    async checkNew() {
        let url = this.data.link;
        let data = await bookFetch(url);
        var item = data.list[data.list.length - 1];
        /**
         * @property {String}title The last chapter title.
         * @property {String}key The unique identifier of last chpater.
         */
        return {
            title: item.title,
            key: item.link,
        };
    }
}

module.exports = MangaProcessor;