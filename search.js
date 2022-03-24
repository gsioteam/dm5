
class SearchController extends Controller {

    load() {
        let str = localStorage['hints'];
        let hints = [];
        if (str) {
            let json = JSON.parse(str);
            if (json.push) {
                hints = json;
            }
        }
        this.data = {
            list: [],
            focus: false,
            hints: hints,
            text: '',
            loading: false,
            hasMore: false,
        };
    }

    makeURL(word) {
        return `http://sacg.dmzj.com/comicsum/search.php?s=${word}`;
    }

    onSearchClicked() {
        this.findElement('input').submit();
    } 

    onTextChange(text) {
        this.data.text = text;
    }

    async onTextSubmit(text) {
        let hints = this.data.hints;
        if (text.length > 0) {
            if (hints.indexOf(text) < 0) {
                this.setState(()=>{
                    hints.unshift(text);
                    while (hints.length > 30) {
                        hints.pop();
                    }
    
                    localStorage['hints'] = JSON.stringify(hints);
                });
            }
            
            this.setState(()=>{
                this.data.loading = true;
            });
            try {
                let list = await this.request(this.makeURL(text));
                this.key = text;
                this.setState(()=>{
                    this.data.list = list;
                    this.data.loading = false;
                });
            } catch(e) {
                showToast(`${e}\n${e.stack}`);
                this.setState(()=>{
                    this.data.loading = false;
                });
            }
        }
    }

    onTextFocus() {
        this.setState(()=>{
            this.data.focus = true;
        });
    }

    onTextBlur() {
        this.setState(()=>{
            this.data.focus = false;
        });
    }

    async onPressed(index) {
        await this.navigateTo('book', {
            data: this.data.list[index]
        });
    }

    onHintPressed(index) {
        let hint = this.data.hints[index];
        if (hint) {
            this.setState(()=>{
                this.data.text = hint;
                this.findElement('input').blur();
                this.onTextSubmit(hint);
            });
        }
    }

    async onRefresh() {
        let text = this.key;
        if (!text) return;
        try {
            let list = await this.request(this.makeURL(text));
            this.setState(()=>{
                this.data.list = list;
                this.data.loading = false;
            });
        } catch(e) {
            showToast(`${e}\n${e.stack}`);
            this.setState(()=>{
                this.data.loading = false;
            });
        }
    }

    async onLoadMore() {

    }

    //获取查找结果
    async request(url) {
        let items = [];
        //如果查找关键字为id:数字，则显示为此id的漫画及其相似推荐
        if (url.search("id:") != -1) {
            url = `http://api.dmzj.com/dynamic/comicinfo/${url.substring(46,url.length)}.json`;
            let res = await fetch(url);
            let text = await res.text();
            let json = JSON.parse(text);
            items.push({
                title: json['data']['info']['title'],
                subtitle: json['data']['info']['authors'],
                picture: json['data']['info']['cover'],
                pictureHeaders: {
                    Referer: 'http://manhua.dmzj.com/'
                },
                link: `http://api.dmzj.com/dynamic/comicinfo/${json['data']['info']['id']}.json`,
            });
            for (let similar of json['data']['similar']) {
                items.push({
                    title: similar['title'],
                    subtitle: '',
                    picture: similar['cover'],
                    pictureHeaders: {
                        Referer: 'http://manhua.dmzj.com/'
                    },
                    link: `http://api.dmzj.com/dynamic/comicinfo/${similar['id']}.json`,
                });
            }
        } else {
            let res = await fetch(url);
            let text = await res.text();
            let json = JSON.parse(text.substring(20,text.length-1));
            for (let result of json) {
                items.push({
                    title: result['comic_name'],
                    subtitle: result['comic_author'],
                    picture: result['comic_cover'],
                    pictureHeaders: {
                        Referer: 'http://manhua.dmzj.com/'
                    },
                    link: `http://api.dmzj.com/dynamic/comicinfo/${result['id']}.json`,
                });
            }
        }
        return items;
    }
}

module.exports = SearchController;