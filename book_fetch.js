
function parseData(text, url) {
    const doc = HTMLParser.parse(text);
    let summary = doc.querySelector('.detail-desc').text;
    let authors = doc.querySelectorAll('.detail-main-info-author a');
    let alist = [];
    for (let a of authors) {
        alist.push(a.text);
    }
    let subtitle = alist.join(',');

    let links = doc.querySelectorAll('#tempc > ul > li > a');
    let list = [];
    for (let link of links) {
        let item = {
            link: new URL(link.getAttribute('href'), url).toString(),
        };
        let title = link.querySelector('.detail-list-2-info-title');
        if (title) {
            item.title = title.text.replace(/ +/, ' ') 
        } else {
            item.title = link.text.replace(/ +/, ' ');
        }
        if (link.querySelector('.detail-list-2-info-right')) 
            item.subtitle = 'VIP';
        list.push(item);
    }

    return {
        subtitle: subtitle,
        summary: summary,
        list: list,
    };
}

module.exports = async function(url) {
    let res = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Mobile Safari/537.36',
        }
    });
    let text = await res.text();

    return parseData(text, url);
}