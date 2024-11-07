/**
 * Created by abhjain on 12/21/2015.
 */

$(document).ready(function() {
    init();
});

function onLoadComplete() {
    /* Code to disable tab key handling
    $('.container').keydown(function (objEvent) {
        if (objEvent.keyCode == 9) {  //tab pressed
            objEvent.preventDefault();
        }
    })
    */

    $("#selectAllProducts").keydown(function (event) {
        if (event.keyCode === 13) {
            $("#selectAllProducts").click();
        }
    });

    $("#languageOptionDropdownHead").keydown(function (event) {
        if (event.keyCode === 13) {
            dropdownMenuToggle($('#languageDropdownOptionsList'));
        }
    });

    $("#locationOptionDropdownHead").keydown(function (event) {
        if (event.keyCode === 13) {
            dropdownMenuToggle($('#locationDropdownOptionsList'));
        }
    });

    $("#downloadLocationOptionDropdownHead").keydown(function (event) {
        if (event.keyCode === 13) {
            dropdownMenuToggle($('#downloadLocationDropdownOptionsList'));
        }
    });


   
    return;
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

var imageMap = {}, productDetails = {}, currInstallSize = 0, dictionaryData = {};

function init() {
    packageName = getParameterByName('packageName');
    productName = getParameterByName('productName');
    productVersion = getParameterByName('productVersion');
    hideVersion = getParameterByName('hideVersion');
    locale = getParameterByName('locale');
    isHighDpi = getParameterByName('isHighDpi');
    carouselType = getParameterByName('carouselType');
    if (locale == '') {
        locale = 'en_US';
    }

    var lang = locale.substr(0, 2);
    if (lang === "zh") {
        $("#continueButton").attr('lang', 'zh');
        $("#continueDownloadButton").attr('lang', 'zh');
    }

}

function handleMessage(message, jsonData, resourcePathsMap) {
   
    $.getJSON("./Dictionary/" + locale + ".json", function (data) {
        dictionaryData = data;
        if (message == "showInstallOptionScreen" || message == "showSuiteOptionsScreen") {
            imageMap = resourcePathsMap;
            installLanguageLocales = jsonData.installLanguages.split(",");
            langList = [];
            for (localeNum in installLanguageLocales) {
                localeWithLangName = [installLanguageLocales[localeNum], data["InstallLanguage_"+installLanguageLocales[localeNum]]["message"]];
                langList.push(localeWithLangName);
            }
            defaultLanguageLocale = jsonData.defaultLanguage;
            defaultLanguage = [defaultLanguageLocale, data["InstallLanguage_" + defaultLanguageLocale]["message"]];
            
            if (message == "showInstallOptionScreen") {
                displayProductOptionsScreen(data, langList, defaultLanguage, jsonData);
            }
            else {
                productDetails = jsonData["productDetails"];
                displaySuiteOptionsScreen(data, langList, defaultLanguage, jsonData);
            }

        }
        else if (message == "showDownloadOptionScreen") {
                imageMap = resourcePathsMap;
                displayDownloadOptionScreen(data, jsonData)
            }
        else if (message == "showMainScreen") {
            if (packageName !== null && packageName !== "")
            {
                displayDownloadPackageScreen(data);
            }
            else
            {
                if (resourcePathsMap.carouselHtml != null) {
                    carouselHtml = resourcePathsMap.carouselHtml;
                    carouselType = 'CustomCarousel';
                }
                else {
                    if (jsonData["isNonCC"] == "true"){
                        carouselType = 'GenericCarousel';
                    }                
                    carouselHtml = '';
                }
                displayContent(data, carouselHtml);
            }
            
        }
        else if (message == "showUpdateAvailableScreen") {
            displayUpdateAvailableScreen(data, jsonData.updateDescriptionHTML);
        }
        else if (message == "showNoUpdateAvailableScreen") {
            displayNoUpdateAvailableScreen(data);
        }
        else if (message == "updateCodexVersion") {
            productVersion = jsonData.updatedCodexVersion;
            if (hideVersion == 'false') {
                $(".content .productVersion").text(data["Version"]["message"] + " " + productVersion); 
            }
        }
        })
        .fail(function () {
            console.log("Error occured while fetching locale json: " + locale);
            if (locale != "en_US")
                getLocaleJson("en_US");
        })
       
    
    onloadHandler();
}

var languageSelected = "";
var locationSelected = "";

var formatProductName = function (productName) {
    productName = productName.trim();
    var maxLength = 26;
    if (productName.length < maxLength) {
        return productName;
    } else {
        var trimmedString = productName.substr(0, maxLength);
        trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")));
        var restString = productName.substr(trimmedString.length);
        return trimmedString + '<br>' + formatProductName(restString);
    }

}

var displayDownloadPackageScreen = function (data) {
    displayUpperHalfScreenWithId("downloaderPackageContent");
    var content;

    if (isHighDpi == 'true') {
        $(".downloaderContent img").attr ('src', 'images/appIcon2x.png');
    }
    else {
        $(".downloaderContent img").attr ('src', 'images/appIcon.png');
    }

    $(".downloaderContent .packageName").html(packageName);

    $("#packageDescription").text(data["LearnMoreDownloadingPackage"]["message"]);
    $("#learnMoreButton").text(data["learnMore"]["message"]);
    $("#learnMoreButton").attr("onclick", "learnMoreDownloadingPackageClicked(event);return false;");

    displayContentScreenWithId("downloadPackageDescription");

    $('img').on('dragstart', function (event) { event.preventDefault(); });
    $('a').on('dragstart', function (event) { event.preventDefault(); });


}

var displayContent = function (data, carouselHtml) {
    displayUpperHalfScreenWithId("productContent");

    var content;

    if (isHighDpi == 'true') {        
        $(".content img").attr('src', 'images/appIcon2x.png');    
    }
    else {        
        $(".content img").attr('src', 'images/appIcon.png');
    }

    switch (carouselType) {
        case 'GenericCarousel':
            content = createGenericCarousel(data);
            break;
        case 'CustomCarousel':
            content = createCustomCarousel(carouselHtml);
            break;
        case 'CCCarousel':
        default:
            content = createDefaultCCCarousel(data, content);
    }

    $(".content .productName").html(productName);
    if (hideVersion == 'false') {
        $(".content .productVersion").text(data["Version"]["message"] + " " + productVersion);
    }

    displayContentScreenWithId("carousel");

    $(".carousel").append(content);
    $('img').on('dragstart', function (event) { event.preventDefault(); });
    $('a').on('dragstart', function (event) { event.preventDefault(); });
}

var createGenericCarousel = function (data) {
    var content = '<div class="genericCarousel"><div class="genericCarouselAdobeSVG"><embed type="image/svg+xml" src="images/adobelogo.svg"></div>' + '<div class="genericCarouselText text-center">' + data["GenericCarouselText"]["message"] + '</div></div>';
    return content;
}

var createCustomCarousel = function (carouselHtml) {
    var content = "<iframe class =\"cec-carousel\" src=" + "\"" + carouselHtml + "?locale=" + locale + "\"" + " style=\"width:100%;height:100%\" ></iframe>";
    return content;
}

var createDefaultCCCarousel = function (data) {
    if (isHighDpi == 'true') {
        var content = "<div class='productIcon'><img src='images/ccIconDark2x.png' /></div>";        
    }
    else {
        var content = "<div class='productIcon'><img src='images/ccIconDark.png' /></div>";        
    }
    content += "<p class='description' >" + data["generalDescription"]["message"] + "</p>";
    content += '<div class="text-center learnMore"><a onclick="learnMoreClicked(event);return false;" href="#" class="btn btn-primary">' + data["learnMore"]["message"] + '</a></div>';
    return content;
}

function displayUpperHalfScreenWithId(id) {
    var contentScreens = ["productContent", "suiteContent", "downloaderPackageContent"];
    for (var screenInd = 0; screenInd < contentScreens.length; screenInd++) {
        getElemById(contentScreens[screenInd]).style.display = "none";
    }
    getElemById(id).style.display = "block";
}

function displayContentScreenWithId(id) {
    var contentScreens = ["carousel", "options", "updates", "downloadOptions", "downloadPackageDescription"];
    for (var screenInd = 0; screenInd < contentScreens.length; screenInd++) {
        getElemById(contentScreens[screenInd]).style.display = "none";
    }
    getElemById(id).style.display = "block";
}

var displayDownloadOptions = function (data, messageData) {
    $("#downloadOptionsHeader").text(data["DownloadOptions"]["message"]);

    $("#downloadLocationHeader").text(data["Location"]["message"] + ":");
    $("#downloadLocationDropdownIconImg").attr("src", imageMap.folderopen);
    displayContentScreenWithId("downloadOptions");

    $("#continueDownloadButton").attr("value", data ["ContinueBtn"]["message"]);

    var defaultLocationStr = data["DefaultLocation"]["message"];
    var changeLocationStr = data["ChangeLocation"]["message"];
    if (locationSelected != "") {
        $("#downloadLocationDropdownTextbox").text(locationSelected);
    }
    else {
        $("#downloadLocationDropdownTextbox").text(defaultLocationStr);
    }

    $(document).on("click", function (event) {
        var $trigger = $(".optionDropdown");
        if ($trigger !== event.target && !$trigger.has(event.target.length)) {
            $("#downloadLocationDropdownOptionsList").hide();
            $("#downloadLocationDropdownIcon").hide();
        }
    });
    addDownloadLocationListToDropdown(defaultLocationStr, changeLocationStr);
}

var displayOptions = function (data, langList, defaultLanguage, messageData) {
    $("#installOptionsHeader").text(data["InstallationOptions"]["message"]);

    $("#languageHeader").text(data["Language"]["message"] + ":");
    $("#languageDropdownIconImg").attr("src", imageMap.dropdownsvg);

    $("#locationHeader").text(data["Location"]["message"] + ":");
    $("#locationDropdownIconImg").attr("src", imageMap.folderopen);

    displayContentScreenWithId("options");

    if (messageData.locationDropdownDisabled == "true") {
        $("#locationDropdownTextbox").addClass('disabled');
        $("#locationDropdownIcon").addClass('disabled');
        $("#locationDropdownHeader").removeAttr('onclick');
        $(".locationDisabledWarningText").css("display", "block");
        $(".locationDisabledWarningText").text(data["LocationDisabledText"]["message"]);
        $(".centerMid").css("padding-top", "68px");
        $(".content").height("325px");
        $(".options").height("305px");
        $(".continueBtn").css("padding-top", "20px");
    }

    $("#continueButton").attr("value", data["ContinueBtn"]["message"]);

    languageSelected = defaultLanguage[0];
    $("#languageDropdownTextbox").text(defaultLanguage[1]);

    var defaultLocationStr = data["DefaultLocation"]["message"];
    var changeLocationStr = data["ChangeLocation"]["message"];
    if (locationSelected != "") {
        $("#locationDropdownTextbox").text(locationSelected)
    }
    else {
        $("#locationDropdownTextbox").text(defaultLocationStr);
    }

    $(document).on("click", function (event) {
        var $trigger = $(".optionDropdown");
        if ($trigger !== event.target && !$trigger.has(event.target).length) {
            $("#languageDropdownOptionsList").hide();
            $("#locationDropdownOptionsList").hide();
            $("#languageDropdownIcon").removeClass('active');
            $("#locationDropdownIcon").removeClass('active');
        }
    });

    addLanguageListToDropdown(langList);
    dropdownOptionClicked('language', defaultLanguage[0], defaultLanguage[1], true);

    addLocationListToDropdown(defaultLocationStr, changeLocationStr);
}

var displayProductOptionsScreen = function (data, langList, defaultLanguage, messageData) {
    displayUpperHalfScreenWithId("productContent");
    if (isHighDpi == 'true') {
        $(".content img").attr('src', 'images/appIcon2x.png');
    }
    else {
        $(".content img").attr('src', 'images/appIcon.png');
    }

    $(".content .productName").html(productName);
    if (hideVersion == 'false') {
        $(".content .productVersion").text(data["Version"]["message"] + " " + productVersion);
    }
    
    displayOptions(data, langList, defaultLanguage, messageData);
    $("#continueButton").attr("onclick", "continueBtnClicked('installOptionsContinueClicked'); return false;");

    $("#continueButton").removeClass("disabled");
    $("#continueButton").addClass("enabled");
    
    $('img').on('dragstart', function (event) { event.preventDefault(); });
    $('a').on('dragstart', function (event) { event.preventDefault(); });
}

var displayDownloadOptionScreen = function (data, messageData)
{
    displayUpperHalfScreenWithId("downloaderPackageContent");
    if (isHighDpi == "true") {
        $(".downloaderContent img").attr('src', 'images/appIcon2x.png');
    }
    else {
        $(".downloaderContent img").attr('src', 'images/appIcon.png');
    }
    $(".downloaderContent .packageName").html(packageName);


    displayDownloadOptions(data, messageData);

    $("#continueDownloadButton").attr("onclick", "continueDownloadBtnClicked('downloadOptionsContinueClicked'); return false");
    $("#continueDownloadButton").removeClass("disabled");
    $("#continueDownloadButton").addClass("enabled");

    $('img').on('dragstart', function (event) { event.preventDefault(); });
    $('a').on('dragstart', function (event) { event.preventDefault(); });
}


var displaySuiteOptionsScreen = function (data, langList, defaultLanguage, messageData) {
    displayUpperHalfScreenWithId("suiteContent");
    if (isHighDpi == 'true') {
        $("#suiteIcon").attr('src', 'images/appIcon2x.png');
    }
    else {
        $("#suiteIcon").attr('src', 'images/appIcon.png');
    }

    $("#suiteName").text(productName);
    
    addProductContainersToListing(productDetails);

    var numProducts = Object.keys(productDetails).length;
    if (numProducts > 5) {
        $("#productsListingContainer").height("240px");
        $("#productsListingContainer").customScrollbar();
    }

    customCheckbox("selectProductCheckbox");

    $("#selectAllProducts").text(data["SelectAll"]["message"]);
    updateNumProductsSelectedText();

    var selectProductCheckboxes = document.getElementsByName("selectProductCheckbox");
    for (var currInd = 0, numElems = selectProductCheckboxes.length; currInd < numElems; currInd++) {
        if (productDetails[selectProductCheckboxes[currInd].id]["isSelected"] === "true") {
            productSelected(selectProductCheckboxes[currInd]);
        }
    }

    $("#totalSizeHeader").text(data["TotalInstallSize"]["message"]);
    $("#totalSizeReadable").text(readableSize(currInstallSize, getLocalizedString("DecimalSeperator")));

    displayOptions(data, langList, defaultLanguage, messageData);

    /* Edit install options section */
    $("#installOptionsHeader").hide();
    $("#installOptionsHR").hide();
    $(".options").height("205px");
    $(".options").height("12.8125rem");
    $(".continueBtn").css("padding-top", "16px");
    $(".continueBtn").css("padding-top", "1rem");
    $("#continueButton").attr("onclick", "continueBtnClicked('suiteOptionsContinueClicked'); return false;");
    /* Edit install options section end */

    $('img').on('dragstart', function (event) { event.preventDefault(); });
    $('a').on('dragstart', function (event) { event.preventDefault(); });
}

function continueDownloadBtnClicked(message) {
    var rootStr = "<messageData></messageData>";
    var xmlDoc;
    if (window.DOMParser) {
        var parser = new DOMParser();
        xmlDoc = parser.parseFromString(rootStr, "text/xml");
    }
    else {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(rootStr);
    }
    var rootNode = xmlDoc.getElementsByTagName("messageData");
    var downloadLocNode = xmlDoc.createElement("downloadLocation");
    downloadLocNode.appendChild(xmlDoc.createTextNode(locationSelected));

    rootNode[0].appendChild(downloadLocNode);

    var xmlString;
    try {
        var serializer = new XMLSerializer();
        xmlString = serializer.serializeToString(xmlDoc);
    }
    catch (e) {
        try {
            xmlString = xmlDoc.xml;
        }
        catch (e) {
            xmlString = ""; 
        }
    }

    parent.sendMessageToNative(message, xmlString);
}

function continueBtnClicked(message) {
    if ($("#continueButton").hasClass("disabled")) {
        return false;
    }

    // revert the changes done to accomodate Location disabled warning text
    $(".content").height("345px");
    $(".centerMid").css("padding-top", "88px");

    var rootStr = "<messageData></messageData>";
    var xmlDoc;
    if (window.DOMParser) {
        var parser = new DOMParser();
        xmlDoc = parser.parseFromString(rootStr, "text/xml");
    }
    else {
        xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = "false";
        xmlDoc.loadXML(rootStr);
    }
    var rootNode = xmlDoc.getElementsByTagName("messageData");

    var installLocNode = xmlDoc.createElement("installLocation");
    installLocNode.appendChild(xmlDoc.createTextNode(locationSelected));
    rootNode[0].appendChild(installLocNode);

    var installLangNode = xmlDoc.createElement("installLanguage");
    installLangNode.appendChild(xmlDoc.createTextNode(languageSelected));
    rootNode[0].appendChild(installLangNode);

    if (message == "suiteOptionsContinueClicked") {
        var productDetailsNode = xmlDoc.createElement("productDetails");

        var productDetailsKeys = Object.keys(productDetails);
        for (var currInd = 0, numNodes = productDetailsKeys.length; currInd < numNodes; currInd++) {
            var currProd = productDetails[productDetailsKeys[currInd]];
            var prodNode = xmlDoc.createElement(productDetailsKeys[currInd]);

            var detailsKeys = Object.keys(currProd);
            for (var currDetailsInd = 0, numDetailsKeys = detailsKeys.length; currDetailsInd < numDetailsKeys; currDetailsInd++) {
                var currKey = detailsKeys[currDetailsInd];
                var currKeyNode = xmlDoc.createElement(currKey);
                currKeyNode.appendChild(xmlDoc.createTextNode(currProd[currKey]));
                prodNode.appendChild(currKeyNode);
            }
        
            productDetailsNode.appendChild(prodNode);
        }
        rootNode[0].appendChild(productDetailsNode);
    }

    var xmlString;
    try {
        var serializer = new XMLSerializer();
        xmlString = serializer.serializeToString(xmlDoc);
    }
    catch (e) {
        try {
            xmlString = xmlDoc.xml;
        }
        catch (e) {
            xmlString = ""; 
        }
    }
    
    parent.sendMessageToNative(message, xmlString);
}

var addProductContainersToListing = function (productDetails) {
    var productIdentifiers = Object.keys(productDetails);

    var productsList = [];
    for (var currElemInd = 0, numElems = productIdentifiers.length; currElemInd < numElems; currElemInd++) {
        var currElem = productDetails[productIdentifiers[currElemInd]];
        currElem["prodIdentifier"] = productIdentifiers[currElemInd];
        productsList.push(currElem);
    }
    productsList.sort(function (e1, e2) {
        return parseInt(e1.productIndex) - parseInt(e2.productIndex);
    });

    var listingHtml = "";
    for (var currElemInd = 0, numElems = productsList.length; currElemInd < numElems; currElemInd++) {
        var currElem = productsList[currElemInd];
        listingHtml += '<div class="productContainer">';
        listingHtml += ('<div class="selectProduct">' + '<input id="' + currElem["prodIdentifier"] + '" name="selectProductCheckbox" type="checkbox" tabindex="1">' + '</div>');
        var iconPath = currElem["iconPath"];
        if (isHighDpi == 'true') {
            iconPath = currElem["iconPath2x"];
        }
        listingHtml += ('<div class="productListingIcon">' + '<img class="productListingIconImg" src="' + iconPath + '" />' + '</div>');
        listingHtml += ('<div class="productListingName ellip-line">' + currElem["productName"] + '</div>');
        listingHtml += ('<div class="productListingSize">' + readableSize(parseInt(currElem["productSize"]), getLocalizedString("DecimalSeperator")) + '</div>');
        listingHtml += '</div>';
    }
    $("#productsListingContainer").append(listingHtml);
}

var selectAllClicked = function () {
    var selectProductCheckboxes = document.getElementsByName("selectProductCheckbox");

    if ($("#selectAllProducts").hasClass("inactive")) {
        for (var currInd = 0, numElems = selectProductCheckboxes.length; currInd < numElems; currInd++) {
            var currElem = selectProductCheckboxes[currInd];
            if (hasClass(currElem.parentNode, "selected")) {
                productUnselected(currElem);
            }
        }
    }
    else {
        for (var currInd = 0, numElems = selectProductCheckboxes.length; currInd < numElems; currInd++) {
            var currElem = selectProductCheckboxes[currInd];
            if (!hasClass(currElem.parentNode, "selected")) {
                productSelected(currElem);
            }
        }
    }

    $("#totalSizeReadable").text(readableSize(currInstallSize, getLocalizedString("DecimalSeperator")));
}

var displayUpdateAvailableScreen = function (data, updateDescriptionHtml) {
    displayUpperHalfScreenWithId("productContent");
    if (isHighDpi == 'true') {
        $(".content img").attr('src', 'images/appIcon2x.png');
    }
    else {
        $(".content img").attr('src', 'images/appIcon.png');
    }

    $(".content .productName").html(productName);
    if (hideVersion == 'false') {
        $(".content .productVersion").text(data["Version"]["message"] + " " + productVersion);
    }

    displayContentScreenWithId("updates");

    getElemById("updateAvailable").style.display = "block";
    getElemById("whatsNewInUpdate").innerHTML = data["WhatsNewInUpdate"]["message"];
    updateDescriptionHtml = updateDescriptionHtml.replace(/#@#/g, "<br>");
    getElemById("updateDescription").innerHTML = updateDescriptionHtml;
    if (updateDescriptionHtml.trim() == "") {
        getElemById("updateDescription").style.display = "none";
        getElemById("whatsNewInUpdate").style.display = "none";
    }
    getElemById("updateScreenButtonInput").setAttribute("value", data["UpdateNowButton"]["message"]);
    getElemById("updateScreenButtonInput").setAttribute("onclick", "updateNowClicked(); return false;");

    $('img').on('dragstart', function (event) { event.preventDefault(); });
    $('a').on('dragstart', function (event) { event.preventDefault(); });

    $("#updateDescription").customScrollbar();
}

function updateNowClicked() {
    parent.sendMessageToNative("updateNowClicked", "");
}

var displayNoUpdateAvailableScreen = function (data) {
    displayUpperHalfScreenWithId("productContent");
    if (isHighDpi == 'true') {
        $(".content img").attr('src', 'images/appIcon2x.png');
    }
    else {
        $(".content img").attr('src', 'images/appIcon.png');
    }

    $(".content .productName").html(productName);
    if (hideVersion == 'false') {
        $(".content .productVersion").text(data["Version"]["message"] + " " + productVersion);
    }

    displayContentScreenWithId("updates");

    getElemById("updateNotAvailable").style.display = "block";
    getElemById("updateNotAvailable").innerHTML = data["AppUpToDate"]["message"];
    getElemById("updateScreenButtonInput").setAttribute("value", data["CloseButton"]["message"]);
    getElemById("updateScreenButtonInput").setAttribute("onclick", "closeButtonClicked(); return false;");

    $('img').on('dragstart', function (event) { event.preventDefault(); });
    $('a').on('dragstart', function (event) { event.preventDefault(); });
}

function closeButtonClicked() {
    parent.sendMessageToNative("noUpdateAvailableCloseClicked", "");
}

function getElemById(id) {
    return document.getElementById(id);
}

function addLanguageListToDropdown(langList) {
    langUL = "<ul class='dropdownOptionsUL'>";
    for(langNo = 0; langNo < langList.length - 1; langNo++) {
        langUL += "<li class='dropdownOptionLI' id='dropdownOption" + langList[langNo][0] + "'><a class='dropdownOption' href='#' tabindex='2' onclick=\"dropdownOptionClicked('language','" + langList[langNo][0] + "','" + langList[langNo][1] + "'); return false;\">" + langList[langNo][1] + "</a></li>";
    }
    langUL += "<li class='dropdownOptionLI' id='dropdownOption" + langList[langNo][0] + "'><a class='dropdownOption' id='dropDownLastLanguage' href='#' tabindex='2' onclick=\"dropdownOptionClicked('language','" + langList[langList.length - 1][0] + "','" + langList[langList.length - 1][1] + "'); return false;\">" + langList[langList.length - 1][1] + "</a></li>";
    langUL += "</ul>";

    $('#languageDropdownOptionsListInner').append(langUL);

    $("#dropDownLastLanguage").keydown(function (event) {
        if (event.keyCode === 9) {
            dropdownMenuToggle($('#languageDropdownOptionsList'));
            $("[tabindex='" + 2 + "']").focus();
        }
    });

}


function addLocationListToDropdown(defaultLocationStr, changeLocationStr) {
    langUL = "<ul class='dropdownOptionsUL'>"
        + "<li class='dropdownOptionLI'><a class='dropdownOption' href='#' tabindex='3' onclick=\"dropdownOptionClicked('location', '','"+defaultLocationStr+"'); return false;\">"+ defaultLocationStr+" </a></li>"
        + "<li class='dropdownOptionLI'><a class='dropdownOption' id='dropDownLastLocation' href='#' tabindex='3' onclick=\"changeLocationClicked(); return false;\">" + changeLocationStr + "... </a></li>"
        + "</ul>";
    $('#locationDropdownOptionsList').append(langUL);

    $("#dropDownLastLocation").keydown(function (event) {
        if (event.keyCode === 9) {
            dropdownMenuToggle($('#locationDropdownOptionsList'));
            $("[tabindex='" + 3 + "']").focus();
        }
    });
}

function addDownloadLocationListToDropdown (defaultLocationStr, changeLocationStr) {
    langUL = "<ul class='dropdownOptionsUL'>"
        + "<li class='dropdownOptionLI'><a class='dropdownOption' href='#' tabindex='3' onclick=\"dropdownOptionClicked('downloadLocation', '','"+defaultLocationStr+"'); return false;\">"+ defaultLocationStr+" </a></li>"
        + "<li class='dropdownOptionLI'><a class='dropdownOption' id='dropDownLastLocation' href='#' tabindex='3' onclick=\"changeLocationClicked(); return false;\">" + changeLocationStr + "... </a></li>"
        + "</ul>";
    $('#downloadLocationDropdownOptionsList').append(langUL);

    $("#dropDownLastLocation").keydown(function (event) {
        if (event.keyCode === 9) {
            dropdownMenuToggle($('#downloadLocationDropdownOptionsList'));
            $("[tabindex='" + 3 + "']").focus();
        }
    });
}

function dropdownOptionClicked(category, option, optionText, simulated) {
    if (category == "language") {
        languageSelected = option;
        $("#languageDropdownOptionsList").hide();
        $("#languageDropdownTextbox").text(optionText);
        $("#languageDropdownIcon").removeClass('active');
        if (simulated == undefined || simulated == false) {
            $("[tabindex='" + 2 + "']").focus();
        }
        $(".dropdownOptionLI").removeClass("active");
        $("#dropdownOption"+option).addClass("active");
    }
    else if (category === "downloadLocation") {
        downloadLocationSelected = option;
        $("#downloadLocationDropdownOptionsList").hide();
        $("#downloadLocationDropdownTextbox").text(optionText);
        $("#downloadLocationDropdownIcon").removeClass('active');
        if (simulated === undefined || simulated === false) {
            $("[tabindex = '" + 3 + "']").focus();
        }
    } 
    else {
        locationSelected = option;
        $("#locationDropdownOptionsList").hide();
        $("#locationDropdownTextbox").text(optionText);
        $("#locationDropdownIcon").removeClass('active');
        if (simulated == undefined || simulated == false) {
            $("[tabindex='" + 3 + "']").focus();
        }
    }
}

function changeLocationClicked() {
    data = "<messageData><defaultPath>" + locationSelected + "</defaultPath></messageData>";
    parent.sendMessageToNative("loadFileBrowser", data);
}

function pathSelectedInFileBrowserReturned(path) {
    if (path != "") {
        locationSelected = path;
        $("#locationDropdownTextbox").text(path);
        $("#downloadLocationDropdownTextbox").text(path);
    }
    $("#locationDropdownOptionsList").hide();
    $("#locationDropdownIcon").removeClass('active');
    $("#downloadLocationDropdownOptionsList").hide();
    $("#downloadLocationDropdownIcon").removeClass('active');
}

function dropdownMenuToggle(obj) {
    if (obj.selector == "#languageDropdownOptionsList") {
        $("#downloadLocationDropdownOptionsList").hide();
        $("#downloadLocationDropdownIcon").removeClass('active');
        $("#locationDropdownOptionsList").hide();
        $("#locationDropdownIcon").removeClass('active');
        $("#languageDropdownOptionsList").toggle();
        $("#languageDropdownIcon").toggleClass('active');
        document.getElementById("languageDropdownOptionsListInner").scrollTop = document.getElementById('dropdownOption' + languageSelected).offsetTop - 10;
    } 
    else if (obj.selector == "#locationDropdownOptionsList") {
        $("#downloadLocationDropdownOptionsList").hide();
        $("#downloadLocationDropdownIcon").removeClass('active');
        $("#languageDropdownOptionsList").hide();
        $("#languageDropdownIcon").removeClass('active');
        $("#locationDropdownOptionsList").toggle();
        $("#locationDropdownIcon").toggleClass('active');
    }
    else if (obj.selector == "#downloadLocationDropdownOptionsList") {
        $("#downloadLocationDropdownOptionsList").toggle();
        $("#downloadLocationDropdownIcon").toggleClass('active');
    }
}

/*function continueBtnClicked() {
    data = "<messageData><installLocation>" + locationSelected + "</installLocation><installLanguage>" + languageSelected + "</installLanguage></messageData>";
    parent.sendMessageToNative("installOptionsContinueClicked", data);
}*/

function onloadHandler() {
    var data = "{\"message\":\"carouselLoadComplete\"}";
    parent.postMessage(data, "*");
}

function learnMoreClicked(event)
{
    if (event.preventDefault)
        event.preventDefault();
    else
        event.returnValue = false;

    $.getJSON("./Dictionary/" + locale + ".json", function (data) {
        var data = "{\"message\":\"learnMoreClicked\",\"url\":\"" + data["learnMoreUrlEsd"]["message"] + "\"}";
        parent.postMessage(data,"*");
    })
        .fail(function () {
            console.log("Error occured while fetching locale json: " + locale);
            if (locale != "en_US")
                getLocaleJson("en_US");
        });
    

}

function learnMoreDownloadingPackageClicked() {
    if (event.preventDefault)
        event.preventDefault();
    else
        event.returnValue = false;

    $.getJSON("./Dictionary/" + locale + ".json", function (data) {
        var data = "{\"message\":\"learnMoreClicked\",\"url\":\"" + data["learnMoreDownloadingPackageUrlEsd"]["message"] + "\"}";
        parent.postMessage(data,"*");
    })
        .fail(function () {
            console.log("Error occured while fetching locale json: " + locale);
            if (locale != "en_US")
                getLocaleJson("en_US");
        });
}

function cecExternalLink(externalUrl)
{
    var data = "{\"message\":\"learnMoreClicked\",\"url\":\"" + externalUrl + "\"}";
    parent.postMessage(data, "*");
}


var productSelected = function (elem) {
    productDetails[elem.id]["isSelected"] = "true";
    currInstallSize += parseInt(productDetails[elem.id]["productSize"]);
    addClass(elem.parentNode, "selected");
    applyImage(elem.parentNode);

    var numProductsSelected = 0;
    var productDetailsKeys = Object.keys(productDetails);
    for (var currInd = 0, numNodes = productDetailsKeys.length; currInd < numNodes; currInd++) {
        if (productDetails[productDetailsKeys[currInd]]["isSelected"] == "true") {
            numProductsSelected += 1;
        }
    }

    if (numProductsSelected > 0) {
        // Change to 'Deselect All'
        $("#selectAllProducts").removeClass("active");
        $("#selectAllProducts").addClass("inactive");
        $("#selectAllProducts").text(dictionaryData["DeselectAll"]["message"]);

        //enable continue button
        $("#continueButton").removeClass("disabled");
        $("#continueButton").addClass("enabled");
    }

    updateNumProductsSelectedText();
}

var productUnselected = function (elem) {
    productDetails[elem.id]["isSelected"] = "false";
    currInstallSize -= parseInt(productDetails[elem.id]["productSize"]);
    removeClass(elem.parentNode, "selected");
    applyImage(elem.parentNode);

    var numProductsSelected = 0;
    var productDetailsKeys = Object.keys(productDetails);
    for (var currInd = 0, numNodes = productDetailsKeys.length; currInd < numNodes; currInd++) {
        if (productDetails[productDetailsKeys[currInd]]["isSelected"] == "true") {
            numProductsSelected += 1;
        }
    }

    if (numProductsSelected == 0) {
        //Change to 'Select All'
        $("#selectAllProducts").removeClass("inactive");
        $("#selectAllProducts").addClass("active");
        $("#selectAllProducts").text(dictionaryData["SelectAll"]["message"]);

        //disable continue button
        $("#continueButton").addClass("disabled");
        $("#continueButton").removeClass("enabled");
    }

    updateNumProductsSelectedText();
}

var updateNumProductsSelectedText = function () {
    var productDetailsKeys = Object.keys(productDetails);
    var numProductsSelected = 0, totalProducts = productDetailsKeys.length;
    for (var currInd = 0; currInd < totalProducts; currInd++) {
        if (productDetails[productDetailsKeys[currInd]]["isSelected"] == "true") {
            numProductsSelected += 1;
        }
    }

    var numProductsSelectedText = dictionaryData["NumProductsSelected"]["message"].replace("{0}", numProductsSelected.toString()).replace("{1}", totalProducts.toString());
    $("#numProductsSelected").text(numProductsSelectedText);

}

var customCheckboxHandler = function (e) {
    el = e.target || e.srcElement;

    if (hasClass(el.parentNode, "selected")) {
        productUnselected(el);
    }
    else {
        productSelected(el);
    }
    $("#totalSizeReadable").text(readableSize(currInstallSize, getLocalizedString("DecimalSeperator")));
}

function getLocalizedString(id) {
    var retVal;
    try {
        retVal = dictionaryData[id].message;
    }
    catch (e) {
        retVal = "undefined";
    }
    return retVal;
}
