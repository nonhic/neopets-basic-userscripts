// ==UserScript==
// @name         SDB Training Tokens
// @version      20240818
// @description  Remember what tokens you need to pay for training classes when visiting SDB
// @author       nonhic
// @match        *://*.neopets.com/safetydeposit.phtml*
// @match        *://*.neopets.com/island/training.phtml*
// @match        *://*.neopets.com/pirates/academy.phtml*
// @match        *://*.neopets.com/island/fight_training.phtml*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

// script inspired by and cobbled from @senerio's https://github.com/senerio/neopets-userscripts/raw/main/lastswprice.user.js

const numberStorage = {
    'key': 'last_itemnumber',
    'get': function(name) {
        const items = JSON.parse(localStorage?.getItem(this.key)) || {};
        return name ? items[name] : items;
    },
    'set': function(name, number) {
        const items = numberStorage.get();
        items[name] = number;
        localStorage?.setItem(this.key, JSON.stringify(items));
    },
    'reset': function() {
		localStorage.removeItem(this.key);
		console.log("Cleared local storage of last_itemnumber.");
	}
}

function markItems(page) {
    const intl = new Intl.NumberFormat();
    const style = 'font-size: xx-small; color: grey; margin: auto; white-space: nowrap; font-weight: normal; font-style:italic;';

    let itemNameObject;
    if(typeof(page.itemNameObject) == 'string') {
        itemNameObject = $(page.itemNameObject);
    }
    else {
        itemNameObject = page.itemNameObject;
    }

    itemNameObject.each(function() {
        const item = $(this);
        const itemName = (page.itemNameMatch ? item.text().match(page.itemNameMatch)[1] : item.text()).trim()
        const number = numberStorage.get(itemName);

	if(number) {
            const numberHTML = `<p style="${style}" class="item_no">Count: ${number}</p>`
            if(page.insert) {
                page.insert(item, numberHTML);
            }
            else {
                item.parent().append(numberHTML);
            }
            if(page.style) {
                GM_addStyle(page.style);
            }
        }
    });
}

// pages
const pages = [
    {
        name: 'sdb',
        pageMatcher: /safetydeposit/,
        itemNameObject: $('.content form>table').eq(1).find('tr:not(:first-child):not(:last-child) td:nth-child(2) > b').map((i,v) => v.firstChild)
    },
    {
        name: 'island training',
        pageMatcher: /training/,
        itemNameObject: $('img[src*="/items/"]').parent().find('b').map((i, v) => v.firstChild)
    },
    {
        name: 'pirate academy',
        pageMatcher:/academy/,
        itemNameObject: $('img[src*="/items/"]').parent().parent().find('b')
    }
]

const loc = window.location.href;

// store numbers for each token type
if(loc.match(/training.phtml/) || loc.match(/academy.phtml/)) {
    numberStorage.reset(); //delete storage on training page refresh
    let itemName, itemNumber = 0;
    
    // collect codestone numbers
    if ($("form[action='process_training.phtml']").length ) {
        let tempName = $('img[src*="/items/"]').parent().find('b').map((i, v) => v.firstChild).text().split(/(Codestone)/);
        for ( var j=0; j<tempName.length; j++ ) {
            if (!tempName[j].match(/(Codestone)/) && tempName[j].match(/[A-Za-z]/)) {
                itemName = tempName[j].trim() + " Codestone";
                if (itemName) {
                    let tempNumber = 0;
                    if (typeof numberStorage.get(itemName) !== "undefined") tempNumber = numberStorage.get(itemName);
                    itemNumber = 1 + tempNumber;
                    console.log("storing: " + itemName + " - " + itemNumber);
                }
                if (itemNumber) {
                    numberStorage.set(itemName, itemNumber);
                } else console.log("skipping " + tempName[j]);
            }
        }
    }

    // collect dubloon number (I don't think you ever get more than one per session?)
    else if ($("form[action='process_academy.phtml']").length) {
        let tempName = $('img[src*="/items/"]').parent().parent().find('b').text().split(/(Dubloon\ Coin)/);
        for ( var i=0; i<tempName.length; i++ ) {
            if (!tempName[i].match(/(Dubloon\ Coin)/) && tempName[i].match(/[A-Za-z]/)) {
                itemName = tempName[i].trim() + " Dubloon Coin";
                if (itemName) {
                    let tempNumber = 0;
                    if (typeof numberStorage.get(itemName) !== "undefined") tempNumber = numberStorage.get(itemName);
                    itemNumber = 1 + tempNumber;
                    console.log("storing: " + itemName + " - " + itemNumber);
                }
                if (itemNumber) {
                    numberStorage.set(itemName, itemNumber);
                } else console.log("skipping " + tempName[i]);
            }
        }
    }
}

// display count
if(localStorage.hasOwnProperty(numberStorage.key)) {
    const page = pages.find((i) => {
        return loc.match(i.pageMatcher)
    });
    if( ['inventory'].includes(page?.name) ) { // for pages that fetch items with ajax call
        $(document).on('ajaxSuccess', function(event, xhr, settings, data) {
            if(settings.url.includes('/np-templates/ajax/inventory.php')) {
                markItems(page);
            }
        });
    }
    else if(page) {
        markItems(page);
    }
}
