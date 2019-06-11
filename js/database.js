$( function() {
    const STORE_NAME = "favorites";
    const FAVICON_URL = "https://www.google.com/s2/favicons?domain=";     //favicon = FAVICON_URL + dataFormat.url
    var request = window.indexedDB.open("dialog");

    // example
    var data = [
        {name: 'naver', url: 'https://naver.com', favicon: 'https://naver.com/favicon.ico'}
    ];

    const dataFormat = {
        name: null,
        url: null,
        favicon: null
    };

    const rowFormat = '<div class="row">{0}</div>';
    const cardFormat = '<div class="card col-md-3" onclick="javascript:location.href=\'{2}\'">\n' +
        '                <img src="{0}" class="card-img-top" alt="...">\n' +
        '                <div class="card-body">\n' +
        '                    <p class="card-text">{1}</p>\n' +
        '                </div>\n' +
        '            </div>';
    const addFavoritesIconFormat = '<div class="card col-md-3" id="addFavorites">\n' +
        '                <img src="./img/plus_icon.png" class="card-img-top" alt="...">\n' +
        '            </div>';

    $('#addFavorites')[0].addEventListener("click", showAddFavoritesModal);
    $('#saveFavorites')[0].addEventListener("click", addFavorites);

    /** database section **/
    var db;
    request.onupgradeneeded = function(event) {
        db = event.target.result;
        db.createObjectStore(STORE_NAME, { keyPath: "url"});
    };

    request.onsuccess = function(event) {
        db = request.result;
    }

    request.onerror = function() {
        alert('error');
    };

    function getObjectStore(store_name, mode) {
        var tx = db.transaction(store_name, mode);
        return tx.objectStore(store_name);
    }


    /** common **/
    String.format = function() {
        let theString = arguments[0];
        for (let i = 1; i < arguments.length; i++) {
            let regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
            theString = theString.replace(regEx, arguments[i]);
        }
        return theString;
    };

    /** event listener section **/
    function showAddFavoritesModal() {
        $('#exampleModalCenter').modal('show');
    }

    function addFavorites() {
        let url = $('input[name="url"]').val();
        let name = $('input[name="name]').val();

        let objectStore = getObjectStore(STORE_NAME, "readwrite");

        let data = $.extend({}, dataFormat);
        data['url'] = url;
        data['name'] = name;
        data['favicon'] = FAVICON_URL.data['url'];

        let result = objectStore.add(data);

        result.onsuccess = function(e) {
            console.log("success");
        };

        result.onerror = function(e) {
            console.log("error::"+e.target.error.name);
        };
    }

    /** display **/
    function display() {
        var store = getObjectStore(STORE_NAME, "readonly");

        $('.icons').empty();

        let req = store.openCursor();

        let i = 0;
        let cardlist = [];
        req.onsuccess = function(evt) {
            let cursor = evt.target.result;

            // If the cursor is pointing at something, ask for the data
            if (cursor) {
                req = store.get(cursor.key);
                req.onsuccess = function (evt) {
                    let value = evt.target.result;
                    let card = String.format(cardFormat, value['favicon'], value['name'], value['url']);
                    cardlist.push(card);
                };

                if(i !== 0 && i % 4 === 0) {
                    let cards = cardlist.join('');
                    let value = String.format(rowFormat, cards);
                    let row = $(value);
                    $('.icons').append(row);
                    cardlist = [];
                }

                i++;
                // move to next
                cursor.continue();
            } else {
                cardlist.push($(addFavoritesIconFormat));
                let cards = cardlist.join('');
                let value = String.format(rowFormat, cards);
                let row = $(value);
                $('.icons').append(row);
                cardlist = [];

                console.log("No more entries");
            }
        };
    }
} );

