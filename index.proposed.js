// partse URL, get querystring league value

// fn()s

/**
 * 
 */
function getLeague() {
    league = parseURL(window.location).searchObject.league

    if (!league) { league = "Standard" }

    document.getElementById('league').innerHTML = decodeURIComponent(league);

    return league;
}

/**
 * @source https://www.abeautifulsite.net/parsing-urls-in-javascript
 * @param {*} url string
 */
function parseURL(url) {
    var parser = document.createElement('a'),
        searchObject = {},
        queries, split, i;
    // Let the browser do the work
    parser.href = url;
    // Convert query string to object
    queries = parser.search.replace(/^\?/, '').split('&');
    for (i = 0; i < queries.length; i++) {
        split = queries[i].split('=');
        searchObject[split[0]] = split[1];
    }

    return {
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash
    };
}

/**
 * 
 */
function PollTradeSite(baseUrl, league, itemName) {
    return new Promise(resolve => 
        setTimeout(async function () {
            returnData = {}
            url = baseUrl + 'search/' + league;
            body = JSON.stringify({
                "query": {
                    "status": {
                        "option": "online"
                    },
                    "name": itemName
                },
                "sort": {
                    "price": "asc"
                }
            })

            itemData = await searchItem(url, body);

            try {
                itemMarketData = await getItemMarketData(baseUrl, itemData.id, itemData.result[0])
            } catch (err) {
                console.log(err);
            }

            itemMarketInstanceData = await extractDesiredItemData_v2(itemMarketData)

            returnData = {
                "name": itemName,
                "currency": itemMarketInstanceData.currency,
                "amount": itemMarketInstanceData.amount,
                "wiki_url": "https://pathofexile.gamepedia.com/" + encodeURIComponent(itemName),
                "trade_url": "https://www.pathofexile.com/trade/search/" + encodeURIComponent(league) + "/" + itemData.id
            }

            resolve(returnData)
        }, timer += 1200)
    );
}

/**
 * 
 * @param {*} data string
 */
function currencyConverter(data) {
    returnData = data;

    // keep this first check as chaos is the default
    if (data.currency == "chaos") {
    } else if (data.currency == "exa") {
        returnData.amount = (data.amount * 100)
    } else {
        returnData.amount = 0.1
    }

    return returnData;
}

/**
 * 
 * @param {*} rowData array
 */
function calProfit(rowData) {
    returnData = {'profit': 0}
    if (rowData[2].amount > 0 && rowData[1].amount > 0 && rowData[0].amount > 0) {
        returnData = {'profit': Math.round(rowData[2].amount - rowData[1].amount - rowData[0].amount)}
    }

    return returnData;
}

/**
 * source: https://www.w3schools.com/jsref/met_node_appendchild.asp
 * @param {*} data string
 */
async function printToDom(data, elem_id = 'data') {

    var node = document.createElement("span");
    var textnode = document.createTextNode(data);
    node.appendChild(textnode);
    document.getElementById(elem_id).appendChild(node);
}

/**
 * 
 * @param {*} url string
 * @param {*} body string
 * @return promise
 */
async function searchItem(url, body) {
    return fetch(url, {
        method: 'post',
        body: body,
        headers: { 'Content-Type': 'application/json' },
    })
    .then((response) => response.json())
    .then((data) => {
        return data;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

/**
 * Example URL: https://www.pathofexile.com/api/trade/fetch/c84fa4b129d5271cf8b8bc4b736688bbe149830fed0086d80f508f778917077d?query=WqmMQzTm
 * 
 * @param {*} baseUrl string
 * @param {*} item_id string
 * @param {*} item_instance_id string
 * @return promise
 */
async function getItemMarketData(baseUrl, item_id, item_instance_id) {
    return fetch(baseUrl + 'fetch/' + item_instance_id + '?query=' + item_id, {
        method: 'get'
    })
    .then((response) => response.json())
    .then((data) => {
        return data;
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

/**
 * 
 * @param {*} data JSON
 */
async function extractDesiredItemData(data) {
    returnData = {};
    returnData.amount = data.result[0].listing.price.amount
    returnData.currency = data.result[0].listing.price.currency;
    returnData.id = data.result[0].item.id;
    return returnData;
}

/**
 * 
 * @param {*} data JSON
 */
async function extractDesiredItemData_v2(data) {
    
    returnData = {};
    if (data.result[0].listing.price) {
        returnData.amount   = data.result[0].listing.price.amount
        returnData.currency = data.result[0].listing.price.currency
        returnData.id       = data.result[0].item.id
    } else {
        returnData = {
            "amount": 0,
            "currency": "NA",
            "id": "NA"
        }
    }
    
    return returnData;
}

function tableRowFromJson(data) {
    // https://www.encodedna.com/javascript/populate-json-data-to-html-table-using-javascript.htm
        var col = [];

    // Extract value from table header. 
    // ('Book ID', 'Book Name', 'Category' and 'Price')

    var myCol = [
        'Prophecy', 'Amount', 'Wiki', 'Trade',
        'Ingredient', 'Amount', 'Wiki', 'Trade',
        'Result', 'Amount', 'Wiki', 'Trade',
        'Profit', 'Region', 'Map'
    ]

    for (var i = 0; i < myCol.length; i++) {
        if (col.indexOf(i) === -1) {
            col.push(i);
        }
    }

    // Create table header row using the extracted headers above.
    var tr = table.insertRow(-1);                   // table row.

    // first row of data is expected to be table header row
    for (var i = 0; i < myCol.length; i++) {
        var th = document.createElement("th");      // table header.
        th.innerHTML = myCol[i];
        tr.appendChild(th);
    }

    // add json data to the table as rows.
//    tr = table.insertRow(-1);
	
        var tabItemZeroName = tr.insertCell(-1);
        tabItemZeroName.innerHTML = data[0].name
        var tabItemZeroAmount = tr.insertCell(-1);
        tabItemZeroAmount.innerHTML = data[0].amount
        var tabItemZeroWiki = tr.insertCell(-1);
        tabItemZeroWiki.innerHTML = "<a href=\""+data[0].wiki_url+"\">Wiki</a>";
        var tabItemZeroTrade = tr.insertCell(-1);
        tabItemZeroTrade.innerHTML = "<a href=\""+data[0].trade_url+"\">Trade</a>";
	
        var tabItemOneName = tr.insertCell(-1);
        tabItemOneName.innerHTML = data[1].name
        var tabItemOneAmount = tr.insertCell(-1);
        tabItemOneAmount.innerHTML = data[1].amount
        var tabItemOneWiki = tr.insertCell(-1);
        tabItemOneWiki.innerHTML = "<a href=\""+data[1].wiki_url+"\">Wiki</a>";
        var tabItemOneTrade = tr.insertCell(-1);
        tabItemOneTrade.innerHTML = "<a href=\""+data[1].trade_url+"\">Trade</a>";
	
        var tabItemTwoName = tr.insertCell(-1);
        tabItemTwoName.innerHTML = data[2].name
        var tabItemTwoAmount = tr.insertCell(-1);
        tabItemTwoAmount.innerHTML = data[2].amount
        var tabItemTwoWiki = tr.insertCell(-1);
        tabItemTwoWiki.innerHTML = "<a href=\""+data[2].wiki_url+"\">Wiki</a>";
        var tabItemTwoTrade = tr.insertCell(-1);
        tabItemTwoTrade.innerHTML = "<a href=\""+data[2].trade_url+"\">Trade</a>";
	
        var tabProfit = tr.insertCell(-1);
        tabProfit.innerHTML = data[3]
        var tabRegion = tr.insertCell(-1);
        tabRegion.innerHTML = data[4]
        var tabMap = tr.insertCell(-1);
        tabMap.innerHTML = data[5]

    tr = table.insertRow(
        tr.appendChild(tabItemZeroName.innerHTML),
        tr.appendChild(tabItemZeroAmount.innerHTML),
        tr.appendChild(tabItemZeroWiki.innerHTML),
        tr.appendChild(tabItemZeroTrade.innerHTML),
        
        tr.appendChild(tabItemOneName.innerHTML),
        tr.appendChild(tabItemOneAmount.innerHTML),
        tr.appendChild(tabItemOneWiki.innerHTML),
        tr.appendChild(tabItemOneTrade.innerHTML),
        
        tr.appendChild(tabItemTwoName.innerHTML),
        tr.appendChild(tabItemTwoAmount.innerHTML),
        tr.appendChild(tabItemTwoWiki.innerHTML),
        tr.appendChild(tabItemTwoTrade.innerHTML),
        
        tr.appendChild(tabProfit.innerHTML),
        tr.appendChild(tabRegion.innerHTML),
        tr.appendChild(tabMap.innerHTML)
    )

    // Now, add the newly created table with json data, to a container.
//    var divShowData = document.getElementById('showData');
//    divShowData.innerHTML = "";
//    divShowData.appendChild(table);
    
}

// vars

var baseUrl = "https://www.pathofexile.com/api/trade/"
var CompleteTable = [
     ["Fire and Ice","Hrimsorrow","Hrimburn","Act 1","Boss @ Tidal Island"],
     ["The Snuffed Flame","Kaltenhalt","Kaltensoul","Act 1","Lower Prison"],
     ["Heavy Blows","Craghead","Cragfall","Act 2","The Old Fields"],
//     ["Ancient Doom","Doomfletch","Doomfletch's Prism","Act 2","Boss @ Ancient Pyramid"],
//     ["Winter's Mournful Melodies","Hrimnor's Hymn","Hrimnor's Dirge","Act 2","The Fellshrine Ruins"],
//     ["The Beginning and the End","Realmshaper","Realm Ender","Act 2","The Crypt Level 2"],
//     ["The Silverwood","Silverbranch","Silverbough","Act 2","Riverways"],
//     ["Nature's Resilience","Springleaf","The Oak","Act 2","Southern Forest"],
//     ["The Servant's Heart","Storm Cloud","The Tempest","Act 2","Boss @ Chamber of Sins"],
//     ["Dying Cry","Deidbell","Deidbellow","Act 3","Boss @ The Ebony Barracks"],
//     ["Trapped in the Tower","Fencoil","Mirebough","Act 3","The Sceptre of God"],
//     ["Fire and Brimstone","Blackgleam","The Signal Fire","Act 3","The Crematorium"],
//     ["Power Magnified","Reverberation Rod","Amplification Rod","Act 3","Piety @ The Lunaris Temple Level 2"],
//     ["End of the Light","Icetomb","Crystal Vault","Act 4","Boss @ The Brine King's Reef"],
//     ["The Bowstring's Music","Death's Harp","Death's Opus","Act 4","Dried Lake"],
//     ["Agony at Dusk","Dusktoe","Duskblight","Act 4","Maligaro @ The Harvest"],
//     ["The King's Path","Kaom's Sign","Kaom's Way","Act 4","Boss @ Kaom's Stronghold"],
//     ["A Forest of False Idols","Araku Tiki","Ngamahu Tiki","Act 4","Kaom's Dream"],
//     ["The Misunderstood Queen","Queen's Decree","Queen's Escape","Act 4","The Belly of the Beast"],
//     ["The Flow of Energy","Shavronne's Pace","Shavronne's Gambit","Act 4","Shavronne @ The Harvest"],
//     ["Severed Limbs","Limbsplit","The Cauteriser","Act 4","The Mines Level 2"],
//     ["The Apex Predator","The Screaming Eagle","The Gryphon","Act 4","Boss @ Aqueduct"],
//     ["Mouth of Horrors","Chalice of Horrors","Thirst for Horrors","Act 4","Doedre @ The Harvest"],
//     ["The King and the Brambles","Bramblejack","Wall of Brambles","Act 4","Daresso @ Grand Arena"],
//     ["A Dishonourable Death","Hyrri's Bite","Hyrri's Demise","Act 6","The Mud Flats"],
//     ["Dark Instincts","Foxshade","Fox's Fortune","Act 7","The Temple of Decay Level 2"],
//     ["The Bloody Flowers Redux","Ezomyte Peak","Ezomyte Hold","Act 8","Boss @ The Grain Gate"],
//     ["The Karui Rebellion","Karui Ward","Karui Charge","Act 8","Boss @ The Grain Gate"],
//     ["Sun's Punishment","Sundance","Sunspite","Act 8","Boss @ The Solaris Temple Level 2"],
//     ["The Great Mind of the North","The Magnate","The Tactician","Act 8","The Bath House"],
//     ["Song of the Sekhema","Asenath's Mark","Asenath's Chant","Act 9","Boss @ The Quarry"],
//     ["The Great Leader of the North","The Magnate","The Nomad","Act 9","The Foothills"],
//     ["Cold Blooded Fury","Bloodboil","Winterweave","T01","Beach Map"],
//     ["A Rift in Time","Blackheart","Voidheart","T02","Laboratory Map"],
//     ["Faith Exhumed","Chober Chaber","Chaber Cairn","T02","Mausoleum Map"],
//     ["The Bishop's Legacy","Geofri's Crest","Geofri's Legacy","T02","Cursed Crypt Map"],
//     ["Blind Faith","The Ignomon","The Effigon","T02","Haunted Mansion"],
//     ["A Rift in Time","Timeclasp","Timetwist","T02","Laboratory Map"],
//     ["Last of the Wildmen","Briskwrap","Wildwrap","T02","Strand"],
//     ["Cold Greed","Cameria's Maul","Cameria's Avarice","T03","Waterways"],
//     ["Blinding Light","Eclipse Solaris","Corona Solaris","T03","Temple Map"],
//     ["The Dreaded Rhoa","Redbeak","Dreadbeak","T03","Bog Map"],
//     ["Black Devotion","Geofri's Baptism","Geofri's Devotion","T03","Relic Chambers Map"],
//     ["Greed's Folly","Wondertrap","Greedtrap","T03","Vault Map"],
//     ["Crimson Hues","Goredrill","Sanguine Gambol","T03","Overgrown Ruin Map"],
//     ["Dance of Steel","The Dancing Dervish","The Dancing Duo","T03","Arsenal"],
//     ["The Malevolent Witch","Doedre's Tenure","Doedre's Malevolence","T04","Phantasmagoria Map"],
//     ["A Vision of Ice and Fire","Heatshiver","Frostferno","T04","Estuary Map"],
//     ["Battle Hardened","Iron Heart","The Iron Fortress","T04","Colonnade"],
//     ["The Mentor","Matua Tupuna","Whakatutuki o Matua","T05","Basilica Map"],
//     ["The Fall of an Empire","Quecholli","Panquetzaliztli","T09","Maze Map"],
//     ["The Nightmare Awakens","Malachai's Simula","Malachai's Awakening","T11","Core"],
//     ["Darktongue's Shriek","Windscream","Windshriek","T11","Sepulchre Map"],
//     ["Pleasure and Pain","Crown of Thorns","Martyr's Crown","T12","Core Map"],
//     ["The Storm Spire","The Stormheart","The Stormwall","T13","Plateau Map"],
//     ["Burning Dread","Dreadarc","Dreadsurge","T14","Shrine Map"],
//     ["The Queen's Sacrifice","Atziri's Mirror","Atziri's Reflection","Uber","The Alluring Abyss"],
]
var outputData = []
var RowNumber = 0

// core logic

/**
 * page has loaded and is ready
 */
window.onload = async function () {
    league = getLeague()
    timer = 0;
    
    // Create a table.
    var table = document.createElement("table");

    // loop each row
    const trs = CompleteTable.reduce(function (RowArray, RowNumber) {
        outputData[RowNumber] = []
        Item1 = RowArray[0]
        Item2 = RowArray[1]
        Item3 = RowArray[2]
        Region = RowArray[3]
        Map = RowArray[4]
        WorkResult = GatherInfoAsync(Item1,Item2,Item3,Region,Map,RowNumber)
        return WorkResult

    })
};

async function GatherInfoAsync(Item1,Item2,Item3,Region,Map,RowNumber) {
    Item1Test = await PollTradeSite(baseUrl, league, Item1).then((data) => {return currencyConverter(data)})
    Item2Test = await PollTradeSite(baseUrl, league, Item2).then((data) => {return currencyConverter(data)})
    Item3Test = await PollTradeSite(baseUrl, league, Item3).then((data) => {return currencyConverter(data)})

    RowCalc = [Item1Test,Item2Test,Item3Test] 
    RowCalc.push = calProfit(RowCalc)

    ToPrint = [Item1Test,Item2Test,Item3Test,RowCalc.push.profit,Region,Map]

    printToDom(RowNumber+'..', 'processing')
    tableFromJson(ToPrint)
}
