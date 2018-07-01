/**
 * @description declaring url variable to hold free currency converter
 */
let url = 'http://www.apilayer.net/api/live?access_key=81114525181954e239c08ff2ea960d53&format=1';

// TODO: register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
            console.log('Registeration Worked!', registration);
        }).catch((err) => {
            console.log('Registration Failed!', err);
        });
    });
}

/**
 * @description Returning resolved and rejected promises fetched from currency converter api.
 */
let getPost = (url) => {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then((res) => {
                //console.log("MY JSON: ", res.json());
                resolve(res.json());
            }).catch((err) => reject(err))
    });

};

/**
 * @description Grabbing and returning currency class html select tag
 */
let fromCurrency = () => {
    return document.getElementById("currency").value;
};

/**
 * @description Grabbing toCurrency class html select tag
 */
let toCurrency = () => {
    return document.getElementById("toCurrency").value;
};

/**
 * @description Calling getPost function, manipulate and calculate rendered 
 * +currency rate from api and output to HTML.
 */
let getResult = () => {
    getPost(url).then((response) => {
        const rate = `${fromCurrency()}${toCurrency()}`;
        let actualConvertion;
        for (let k in response.quotes) {
            if (k === rate) {
                actualConvertion = document.querySelector('.dollar').value * response.quotes[k];
            }
        }
        console.log("Converted Rate: ", actualConvertion.toFixed(3));
        //document.getElementById("demo").innerHTML = `${actualConvertion.toFixed(3)}  ${document.getElementById("toCurrency").value}`;
        document.getElementById('convert').value = `${actualConvertion.toFixed(3)}`;
    }).catch((err) => {
        console.log("Error occured ", err);
    });
};

/**
 * @description Click Listener for html id convertButton 
 */
document.getElementById("convertButton").addEventListener("click", getResult);

/**
 * @description fetching JSON from freecurrencyconverterapi creating db converter
 * +open currency - converter indexeddb for storing currency converter
 * +Store data to converter indexeddb
 * +Retrieve stored data from converter indexeddb
 */
let dbAll = () => {
    fetch('http://www.apilayer.net/api/live?access_key=81114525181954e239c08ff2ea960d53&format=1').then(response => {
        return response.json();
    }).then(items => {
        let jsonMessages = Object.entries(items.quotes);
        let sourceMessages = items.source;

        let currencyDbPromise = idb.open('currency-converter', 3, (upgradeDb) => {
            switch (upgradeDb.oldVersion) {
                case 0:
                    upgradeDb.createObjectStore('converter', {
                        keyPath: 'id'
                    });
                case 1:
                    let store = upgradeDb.transaction.objectStore('converter');
                    store.createIndex('quote', 'rate');
                case 2:
                    let sourceStore = upgradeDb.transaction.objectStore('converter');
                    store.createIndex('fromCountry', 'source');

            }
        });

        // Storing data to db converter
        currencyDbPromise.then((db) => {
            let tx = db.transaction('converter', 'readwrite');
            let store = tx.objectStore('converter');
            jsonMessages.map((message) => {
                let [a, b] = message;

                store.put({
                    id: a,
                    rate: b,
                    source: sourceMessages
                });
            });
            return tx.complete;
        }).then(() => {
            console.log('JSON DB Added');
        });

        // Retrieve stored data from db converter
        currencyDbPromise.then(function(db) {
            let tx = db.transaction('converter');
            let store = tx.objectStore('converter');
            let fromCountryIndex = store.index('fromCountry');

            return fromCountryIndex.getAll();
        }).then(function(converter) {
            console.log('converter:', converter);
        });

    }).catch(error => console.log(error));
}

/**
 * @description Calling dbAll function
 */
dbAll();