//获取漫画信息
function parseData(text, url) {
    const json = JSON.parse(text);
    let summary = json['data']['info']['description'];
    let subtitle = json['data']['info']['authors'];

    let links = json['data']['list'];
    let list = [];
    for (let link of links) {
        let item = {
            link: `https://m.dmzj.com/chapinfo/${link['comic_id']}/${link['id']}.html`,
        };
        item.title = link['chapter_name'];
        let createtime = new Date(parseInt(link['createtime']) * 1000).toLocaleString().replace(/:\d{1,2}$/,' ');
        item.subtitle = createtime.substring(0, 10);
        list.push(item);
    }

    return {
        subtitle: subtitle,
        summary: summary,
        list: list.reverse(),
    };
}

module.exports = async function(url) {
    if (url.search('json') == -1) {
        let res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Mobile Safari/537.36',
            }
        });
        let text = await res.text();
        const doc = HTMLParser.parse(text);
        let book_id = doc.querySelector('#comic_id').textContent;
        url = `http://api.dmzj.com/dynamic/comicinfo/${book_id}.json`
    }
    let res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Mobile Safari/537.36',
        }
    });
    let text = await res.text();
    return parseData(text, url);
}