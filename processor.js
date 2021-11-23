const bookFetch = require('./book_fetch');

/**
 * @property {String}key need override the key for caching
 * @method load need override,
 * @method checkNew need override
 */
class MangaProcesser extends Processor {

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
            function parseDoc(doc, url) {
                let scripts = doc.querySelectorAll('script:not([src])');
                let script;
                for (let s of scripts) {
                    if (s.text.match(/^eval\(/))
                      script = s.text
                }
                if (script) {
                    let env = new ScriptContext();
                    env.eval(script);
                    let arr = env.eval('newImgs');
                    let data = [];
                    for (let i = 0, t = arr.length; i < t; ++i) {
                        data.push({
                            url: arr[i],
                        });
                    }
                    console.log(`setData ${JSON.stringify(data)}`);
                    that.setData(data);
                    return true;
                } else {
                    console.log('Can not find script');
                    return false;
                }
            }
            const doc = HTMLParser.parse(text);
            if (parseDoc(doc, url)) this.save(true, state);
            
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
        return HTMLParser.parse(text);
    }

    // Called in `dispose`
    unload() {

    }

    // Check for new chapter
    async checkNew() {
        let url = this.data.link + '?waring=1';
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

module.exports = MangaProcesser;