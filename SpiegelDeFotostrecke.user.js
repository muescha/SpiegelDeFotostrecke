// ==UserScript==
// @name           Spiegel.de Fotostrecke Auf Einer Seite
// @namespace      https://github.com/muescha/SpiegelDeFotostrecke
// @description    Zeigt die Fotostrecke auf einer Seite an.
// @include        http://www.spiegel.de/fotostrecke/*
// @version        2012-05-26
// ==/UserScript==

window.spiegelDeFotostrecke = {

    getElementByClassName:function (node, className, tagName) {
        tagName = tagName || 'div';
        var divs = node.getElementsByTagName(tagName);
        var nodes = new Array();
        for (var i = 0, j = 0; i < divs.length; i++) {
            if (divs[i].className == className) {
                nodes[j++] = divs[i];
            }
        }
        return nodes;
    },

    genImageId:function (imageId) {
        return "image" + imageId;
    },

    getImage:function (imageId, url) {

        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onreadystatechange = function () {
            if (this.readyState == this.DONE) {
                spiegelDeFotostrecke.extractImage(imageId, this.responseText);
            }
        };
        request.send('');
    },

    extractImage:function (imageId, html) {

        var htmlImage = html.replace(/(\r|\n)/g, '').replace(/^.+<div id="spBigaBild" style="width:\d*px;">(.+?)<\/div>.+/, '$1');
        var htmlDescription = html.replace(/(\r|\n)/g, '').replace(/^.+<div id="spBigaBildunterschrift">(.+?)<\/div>.+/, '$1');

        var divImage = document.createElement('div');
        divImage.innerHTML = htmlImage;
        var image = divImage.getElementsByTagName("img")[0];

        var div = document.getElementById(spiegelDeFotostrecke.genImageId(imageId));
        div.style.textAlign = "center";
        div.innerHTML = "<p>Nr.: " + imageId + "</p>" + htmlDescription;
        div.insertBefore(image, div.getElementsByTagName("p")[0]);

    },

    getPageInfo:function () {

        var insertBeforeElement = spiegelDeFotostrecke.getElementByClassName(document, "spBigaNavi spLast")[0];

        var vonBisText = spiegelDeFotostrecke.getElementByClassName(document, "spBigaControl")[0].textContent;

        vonBisText = vonBisText.replace(/(\r|\n|\s)/g, '');

        var currentPage = vonBisText.replace(/(\d*)von(.\d*)/, '$1') - 0;
        var maxPages = vonBisText.replace(/(\d*)von(.\d*)/, '$2') - 1;

        var url = document.location.href;

        return {
            insertBeforeElement:insertBeforeElement,
            currentPage:currentPage,
            maxPages:maxPages,
            url:url
        };
    },

    init:function () {

        var pageInfo = spiegelDeFotostrecke.getPageInfo();

        if (pageInfo.currentPage == 1) {

            for (var imageId = 2; imageId < pageInfo.maxPages + 1; imageId++) {

                var div = document.createElement('div');
                div.id = spiegelDeFotostrecke.genImageId(imageId);
                pageInfo.insertBeforeElement.parentNode.insertBefore(div, pageInfo.insertBeforeElement);

                var newUrl = pageInfo.url.replace(/\.html/g, "-" + imageId + ".html");
                spiegelDeFotostrecke.getImage(imageId, newUrl);

            }

        } else {
            console.log("not on page 1!");
        }

    }
};

spiegelDeFotostrecke.init();