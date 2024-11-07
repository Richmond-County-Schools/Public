/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
var popUpShownOnce = false;
var lastScreenShown = null;
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (obj, start) {
        for (var i = (start || 0), j = this.length; i < j; i++) {
            if (this[i] === obj) { return i; }
        }
        return -1;
    }
}

//Native Gateway
function sendMessageToNative(message, jsonData) {
    //Convert jsonData to jsonDataString
    var jsonDataString = "";
    if (jsonData)//Todo: Handle properly
        jsonDataString = jsonData;
    try {
        if (window.JSObject) {
            var retVal = window.JSObject.messageFromHtml(message, jsonDataString);
            return retVal;
        }
    }
    catch (e) {
        return null;
    }
    return null;
}

function messageFromNative(message, jsonDataString) {
    //Convert jsonDataString to jsonData

    var jsonData;
    try {
        jsonData =JSON.parse(jsonDataString);
    }
    catch (e) {
        jsonData = jsonDataString;
    }
    //Call appropriate function
    if (message == "initialize") {
        initialize(jsonData);
    }
    else if (message == "showSpinnerScreen") {
        showSpinnerScreen(jsonData);
    }
    else if (message == "showSurveyScreen") {
        showSurveyScreen(jsonData);
    }
    else if (message == "showPIIScreen") {
        showPIIScreen(jsonData);
    }
    else if (message == "showMainScreen") {
        showMainScreen(jsonData);
    }
    else if (message == "showInstallOptionScreen") {
        showOptionsScreen(jsonData, message);
    }
    else if (message == "showDownloadOptionScreen"){
        showOptionsScreen(jsonData, message);
    }
    else if (message == "showDownloadFinishScreen")
    {
        showWorkflowFinishAlert("download", jsonData);
    }
    else if (message == "showPackageExpiredScreen")
    {
        showPackageExpiredAlert (jsonData);
    }
    else if (message == "showSuiteOptionsScreen") {
        showOptionsScreen(jsonData, message);
    }
    else if (message == "hideOverlay") {
        hideOverlay(jsonData);
    }
    else if (message == "updateProgress") {
        updateProgress(jsonData);
    }
    else if (message == "showQuitConfirmation") {
        showQuitConfirmation(jsonData);
    }
    else if (message == "showErrorAlert") {
        showErrorAlert(jsonData);
    }
    else if (message == "showErrorAlertForPath") {
        showErrorAlertForPath(jsonData);
    }
    else if (message == "showQuittingScreen") {
        showQuittingScreen(jsonData);
    }
    else if (message == "showInstallFinishScreen") {
        showWorkflowFinishAlert("install", jsonData);
    }
    else if (message == "showUpdateFinishScreen") {
        showWorkflowFinishAlert("update", jsonData);
    }
    else if (message == "showSuiteInstallFinishScreen") {
        showSuiteInstallFinishScreen(jsonData);
    }
    else if (message == "showLaunchingProductScreen") {
        showLaunchingProductScreen();
    }
    else if (message == "showProxyAlert") {
        showProxyAlert(jsonData);
    }
    else if (message == "showUninstallPreferencesScreen") {
        showPreferencesAlert();
    }
    else if (message == "showUninstallFinishScreen") {
        showUninstallFinishAlert()
    }
    else if (message == "pathSelectedInFileBrowser") {
        var path = jsonData.selectedPath;
        window.frames['mainScreen'].pathSelectedInFileBrowserReturned(path);
    }
    else if (message == "showWarningAlert") {
        showWarningAlert(jsonData);
    }
    else if (message == "showCheckingUpdateScreen"){
        showCheckingUpdateScreen();
    }   
    else if (message == "showNoUpdateAvailableScreen"){
        showNoUpdateAvailableScreen();
    }
    else if (message == "showUpdateAvailableScreen") {
        showUpdateAvailableScreen(jsonData);
    }
    else if (message == "showNoNetworkScreen") {
        showNoNetworkScreen();
    }
    else if (message == "updateCodexVersion") {
        updateCodexVersion(jsonData);
    }
    return "";
}

//Utilities

var urlForOpening = "";
var fileLinkForOpening = "";

function openUrl(event) {
    if (event.preventDefault)
        event.preventDefault();
    else
        event.returnValue = false;

    sendMessageToNative("openurl", urlForOpening);
}

function openFile(event) {
    if (event.preventDefault)
        event.preventDefault();
    else
        event.returnValue = false;

    sendMessageToNative("openFileURL", fileLinkForOpening);
}

function getLocalizedString(id) {
    var retVal;
    try {
        retVal = localizationStringMap[id].message;
    }
    catch (e) {
        retVal = "undefined";
    }
    return retVal;
}

function setLocalizedTextOnId(elementId, localizationId) {
    getElemById(elementId).innerHTML = getLocalizedString(localizationId);
    getElemById(elementId).title = getLocalizedString(localizationId);
}

function setTextOnId(elementId, text) {
    getElemById(elementId).innerHTML = text;
}

function setTextOnTitle(elementId, text) {
    getElemById(elementId).title = text;
}

function hideElementById(elementId) {
    try {
        getElemById(elementId).style.display = 'none';
    }
    catch (e) {

    }
}

function hideElement(element) {
    element.style.display = 'none';
}

function showElementById(elementId, value) {
    try {
        if (typeof value != undefined && value != null)
            getElemById(elementId).style.display = value;
        else {
            getElemById(elementId).style.display = 'block';
        }
    }
    catch (e) {

    }
}

function showElement(element) {
    element.style.display = 'block';
}

function showScreenWithId(screenId) {
    var list = document.querySelectorAll(".screen");
    for (var i = 0; i < list.length; i++) {
        // list[i] is a node with the desired class name
        if (list[i].style.display != "none")
        {
            lastScreenShown = list[i];
        }
        hideElement(list[i])
    }

    showElementById(screenId);
}

function applyPNGTransparencyFixForImg(imgElem, scaleImage) // problem with handling PNG transparency in IE versions 6 or earlier.
{
    if (platform != "win")
        return;
    try {
        imgElem.runtimeStyle.behavior = "none";
        if (imgElem.nodeName == "IMG" && imgElem.src.toLowerCase().indexOf('.png') > -1) {
            imgElem.runtimeStyle.backgroundImage = "none";
            if (scaleImage)
                imgElem.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + imgElem.src + "', sizingMethod='scale')";
            else
                imgElem.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + imgElem.src + "', sizingMethod='image')";
            imgElem.src = imageMap.transparentGIF;
        }
        else {
            imgElem.origBg = imgElem.origBg ? imgElem.origBg : imgElem.currentStyle.backgroundImage.toString().replace('url("', '').replace('")', '');
            imgElem.runtimeStyle.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + imgElem.origBg + "', sizingMethod='crop')";
            imgElem.runtimeStyle.backgroundImage = "none";
        }
    }
    catch (e) {
    }
}

function getElemById(id) {
    return document.getElementById(id);
}

var customCheckboxHandler = function (e) {
    el = e.target || e.srcElement;
    toggleClass(el.parentNode, "selected");
    applyImage(el.parentNode);
}

//Initialization
var applicationName = "";
var entityName = "";
var platform = "";
var dpiRatio = 100;
var iframeContentUrl;
var isIframeAdded = false;
var carouselHtml;
var imageMap = {};
var localizationStringMap = {}; //This is global map to store all localization strings.
var isUninstall;
var isUpdate;
var isTronPackageDownloading;
var isHighDpi;
var isNonCC = "false";
var windowHeight = 650;

function disableDragOnElement(elem) {
    elem.ondragstart = function () { return false; };
}

var receiveMessage = function (e) {
    var jsonData;
    try {
        jsonData = JSON.parse(e.data);
    }
    catch (e) {
        jsonData = e.data;
    }

    if (jsonData.message == "learnMoreClicked") {
        var data = "{\"message\":\"learnMoreClicked\",\"url\":\"" + jsonData.url + "\",\"index\":\"" + jsonData.index + "\"}";
        sendMessageToNative("learnMoreClicked", data);
    }
    else if (jsonData.message == "carouselDotClicked") {
        var data = "{\"message\":\"carouselDotClicked\",\"index\":\"" + jsonData.index + "\"}";
        sendMessageToNative("carouselDotClicked", data);
    }
    else if (jsonData.message == "carouselLoadComplete") {
        hideElementById('spinnerContent');
        showElementById('marketingIFrameDiv');
        sendMessageToNative("carouselLoadComplete", "");
    }
}

function onLoadComplete() {
    var x = document.getElementsByTagName("img");
    if (x.length > 0) {
        for (var i = 0; i < x.length; i++) {
            disableDragOnElement(x[i]);
        }
    }
    $('a').on('dragstart', function (event) { event.preventDefault(); });
    attachEvt(window, 'message', receiveMessage);
    document.onselectstart = function () { return false; }
    sendMessageToNative("documentReady", "");

    $('#alertRightButton').on('click', function () {
        $(this).prop('disabled', true);
        alertRightButtonClicked();
    });

    $('#alertLeftButton').on('click', function () {
        $(this).prop('disabled', true);
        alertLeftButtonClicked();
    });

}

function initialize(jsonData) {
    applicationName = jsonData.applicationName;
    entityName = jsonData.entityName;
    platform = jsonData.platform;
    dpiRatio = jsonData.dpiRatio;
    localizationStringMap = jsonData.localizationStringMap;
    imageMap = jsonData.resourcePathMap;
    iframeContentUrl = jsonData.contentURL;
    isUninstall = jsonData.isUninstall;
    isUpdate = jsonData.isUpdate;
    isTronPackageDownloading = jsonData.isTronPackageDownloading;
    isHighDpi = jsonData.isHighDpi;
    isNonCC = jsonData.isNonCC;

    var OSName = "Unknown OS";
    if (platform == "win")
        OSName = "os-win";
    else
        OSName = "os-mac";

    addClass(document.getElementsByTagName("body").item(0), OSName);

    customCheckbox("proxyAlertRememberMe");

    showSpinnerScreen();
    
    addIframeForMainScreen();

    
}

function addIframeForMainScreen() {
    getElemById("iframeSpinner").src = imageMap.spinner;

    var iframe = document.createElement('iframe');
    iframe.name = "mainScreen";

    iframe.width = "100%";
    iframe.height = "100%";
    iframe.style.border = "none";
    iframe.frameBorder = 0;
    iframe.scrolling = "no";
    iframe.src = iframeContentUrl;

    getElemById('marketingIFrameDiv').appendChild(iframe);
    isIframeAdded = true;

    hideElementById("iframeSpinnerScreenText");
}

//Spinner Screen

function showSpinnerScreen(screenData) {
    var screenDataText = "";
    if (screenData)
        screenDataText = screenData.text;

    getElemById("spinnerScreenText").innerHTML = screenDataText;
    $("#spinnerScreenText").each(function () {
        preventWordBreaks(this);
    });
    getElemById("spinnerScreenImage").src = imageMap.spinner;
    showScreenWithId("spinnerScreen");
}

function showQuittingScreen() {
    showSpinnerScreen();
}

function showLaunchingProductScreen() {
    var screenData = {};
    screenData.text = getLocalizedString("OpeningProduct").replace('{0}', applicationName);
    hideQuitConfirmationScreen();
    showSpinnerScreen(screenData);
}

function showCheckingUpdateScreen()
{
    var screenData = {};
    screenData.text = getLocalizedString("CheckingUpdates");
    showSpinnerScreen(screenData);
}

//Survey Screen

function showSurveyScreen(screenData) {
    getElemById("surveyScreenIcon").src = imageMap.productIcon;

    var productWorkflowKey = "InstallProduct";
    if (isUpdate == "true") {
        productWorkflowKey = "UpdateProduct";
    }
    getElemById("surveyScreenTitle").innerHTML = getLocalizedString(productWorkflowKey).replace('{0}', applicationName);

    getElemById("surveyScreenHeader").innerHTML = getLocalizedString("SurveyScreenHeader");

    getElemById("surveyQuestion1").innerHTML = getLocalizedString("SurveyQuestion1").replace('{0}', applicationName);
    getElemById("surveyQuestion1Option1").innerHTML = getLocalizedString("SurveyQuestion1Option1");
    getElemById("surveyQuestion1Option2").innerHTML = getLocalizedString("SurveyQuestion1Option2");

    getElemById("surveyQuestion2").innerHTML = getLocalizedString("SurveyQuestion2");
    getElemById("surveyQuestion2Option1").innerHTML = getLocalizedString("SurveyQuestion2Option1");
    getElemById("surveyQuestion2Option2").innerHTML = getLocalizedString("SurveyQuestion2Option2");
    getElemById("surveyQuestion2Option3").innerHTML = getLocalizedString("SurveyQuestion2Option3");
    getElemById("surveyQuestion2Option4").innerHTML = getLocalizedString("SurveyQuestion2Option4");
    getElemById("surveyQuestion2Option5").innerHTML = getLocalizedString("SurveyQuestion2Option5");
    getElemById("surveyQuestion2Option6").innerHTML = getLocalizedString("SurveyQuestion2Option6");
    getElemById("surveyQuestion2Option7").innerHTML = getLocalizedString("SurveyQuestion2Option7");
    getElemById("surveyQuestion2Option8").innerHTML = getLocalizedString("SurveyQuestion2Option8");
    getElemById("surveyQuestion2Option9").innerHTML = getLocalizedString("SurveyQuestion2Option9");
    getElemById("surveyQuestion2Option10").innerHTML = getLocalizedString("SurveyQuestion2Option10");

    getElemById("surveyQuestion3").innerHTML = getLocalizedString("SurveyQuestion3").replace('{0}', applicationName);
    getElemById("surveyQuestion3Option1").innerHTML = getLocalizedString("SurveyQuestion3Option1");
    getElemById("surveyQuestion3Option2").innerHTML = getLocalizedString("SurveyQuestion3Option2");
    getElemById("surveyQuestion3Option3").innerHTML = getLocalizedString("SurveyQuestion3Option3");
    getElemById("surveyQuestion3Option4").innerHTML = getLocalizedString("SurveyQuestion3Option4");

    getElemById("surveyContinueButton").value = getLocalizedString("ContinueCaps");
    showScreenWithId("surveyScreen");
}

function surveySelectChanged() {
    var selectedIndex1 = getElemById("surveySelectQuestion1").selectedIndex;
    var selectedIndex2 = getElemById("surveySelectQuestion2").selectedIndex;
    var selectedIndex3 = getElemById("surveySelectQuestion3").selectedIndex;
    if (selectedIndex1 != 0 && selectedIndex2 != 0 && selectedIndex3 != 0) {
        getElemById("surveyContinueButton").removeAttribute("disabled");
    }
    else {
        getElemById("surveyContinueButton").setAttribute("disabled", true);
    }
}

function surveyContinueButtonClick() {
    var selectedIndex1 = getElemById("surveySelectQuestion1").selectedIndex;
    var selectedIndex2 = getElemById("surveySelectQuestion2").selectedIndex;
    var selectedIndex3 = getElemById("surveySelectQuestion3").selectedIndex;
    if (selectedIndex1 != 0 && selectedIndex2 != 0 && selectedIndex3 != 0) {
        sendMessageToNative("surveyContinueButtonClicked", "");
    }
}

//PII Screen

function showPIIScreen(screenData) {
    getElemById("piiScreenIconImage").src = imageMap.appIcon;

    var productWorkflowKey = "InstallProduct";
    if (isUpdate == "true") {
        productWorkflowKey = "UpdateProduct";
    }
    getElemById("piiScreenTitle").innerHTML = getLocalizedString(productWorkflowKey).replace('{0}', entityName);

    var piiScreenText = getLocalizedString("PiiScreenText");
    urlForOpening = getLocalizedString("PiiScreenLearnMoreLink");
    var urlForPrivacy = getLocalizedString("PiiAccountPrivacyLink");
    piiScreenText = piiScreenText.replace('{8}', "<a ondragstart='return false;' onclick='openUrlInBrowser(\"" + urlForPrivacy + "\")' href=\"#\">");
    piiScreenText = piiScreenText.replace('{9}', "</a>");
    piiScreenText = piiScreenText.replace('{10}', "<a ondragstart='return false;' onclick='openUrl(event)' target='_blank' href='" + urlForOpening + "'>");
    piiScreenText = piiScreenText.replace('{11}', "</a>");
    getElemById("piiScreenText").innerHTML = piiScreenText;
    getElemById("piiContinueButton").value = getLocalizedString("ContinueCaps");
    showScreenWithId("piiScreen");
}

function piiContinueButtonClick() {
    var productData = {};
    productData["consentButtonLabel"] = getLocalizedString("ContinueCaps");
    sendMessageToNative("piiContinueButtonClicked", JSON.stringify(productData));
}

function getQueryParamByName(url, queryParam) {
    paramsStr = url.split("?")[1];
    paramsAr = paramsStr.split("&");
    var numParams = paramsAr.length;
    for (var paramNum = 0; paramNum < numParams; paramNum++) {
        paramKeyVal = paramsAr[paramNum].split("=");
        if(paramKeyVal[0] == queryParam)
            return paramKeyVal[1];
    }
    return "";
}

//Update Screens

function showUpdateAvailableScreen(screenData) {
    getElemById("mainScreenHeader").style.display = "none";
    getElemById("updateScreenHeader").style.display = "block";
    getElemById("updateAvailability").innerHTML = getLocalizedString("NewUpdateAvailable");

    setTimeout(function () {
        getElemById("iframeSpinnerScreenText").innerHTML = getLocalizedString("JustMoment");
        showElementById("iframeSpinnerScreenText");
    }, 5000);

    window.frames['mainScreen'].handleMessage("showUpdateAvailableScreen", screenData, imageMap);

    showScreenWithId("mainScreen");
}

function updateCodexVersion(screenData) {

    window.frames['mainScreen'].handleMessage("updateCodexVersion", screenData, imageMap);
}

function showNoUpdateAvailableScreen(screenData) {
    getElemById("mainScreenHeader").style.display= "none";
    getElemById("updateScreenHeader").style.display= "block";
    getElemById("updateAvailability").innerHTML = getLocalizedString("NoNewUpdates");

    setTimeout(function () {
        getElemById("iframeSpinnerScreenText").innerHTML = getLocalizedString("JustMoment");
        showElementById("iframeSpinnerScreenText");
    }, 5000);

    window.frames['mainScreen'].handleMessage("showNoUpdateAvailableScreen", screenData, imageMap);

    showScreenWithId("mainScreen");
}

function showNoNetworkScreen() {
    
    $("#noNetworkAlertSVG").html('<img src="images/alert.svg">');
    
    getElemById("noNetworkTitle").innerHTML = getLocalizedString("NoNetworkTitle");
    getElemById("noNetworkDescription").innerHTML = getLocalizedString("NoNetworkDescription");
    getElemById("noNetworkScreenRetryBtn").innerHTML = getLocalizedString("Retry");
    showScreenWithId("noNetworkScreen");
    getElemById("noNetworkScreen").style.display = "table-cell";

}
//Main Screen

function showMainScreen(screenData) {
    getElemById("mainScreenHeader").style.display = "block";
    getElemById("updateScreenHeader").style.display = "none";
    screenData["isNonCC"] = isNonCC;
    setTimeout(function () {
        getElemById("iframeSpinnerScreenText").innerHTML = getLocalizedString("JustMoment");
        showElementById("iframeSpinnerScreenText");
    }, 5000);

    window.frames['mainScreen'].handleMessage("showMainScreen", screenData, imageMap);
    
    if(isTronPackageDownloading)
    {
        getElemById("minutesLeftText").style.display = "block";
        getElemById("progressTextAction").style.marginTop = "0";
    }
    var progressData = {};
    progressData.progress = '0';
    progressData.productProgress = '0';
    progressData.minutesLeftMin = '0';
    progressData.minutesLeftMax = '0';
    progressData.showPercent = "false";
    progressData.isSuite = screenData.isSuite;
    progressData.isCoreComponentInstalling = screenData.isCoreComponentInstalling;

    updateProgress(progressData);

    showScreenWithId("mainScreen");
}

function showOptionsScreen(screenData, message) {
    getElemById("mainScreenHeader").style.display = "block";
    getElemById("updateScreenHeader").style.display = "none";

    setTimeout(function () {
        getElemById("iframeSpinnerScreenText").innerHTML = getLocalizedString("JustMoment");
        showElementById("iframeSpinnerScreenText");
    }, 5000);
    
    var checkIfIframeIsLoaded = setInterval(function() {
        if (typeof(window.frames['mainScreen'].handleMessage) == "function") {
            window.frames['mainScreen'].handleMessage(message, screenData, imageMap);
            var workflowProductNameKey = "InstallationHeader";
            if (isTronPackageDownloading == "true") {
                workflowProductNameKey = "DownloadOptions";
                getElemById("minutesLeftText").style.display = "none";
                getElemById("progressTextAction").style.marginTop = "10px";
                getElemById("progressTextAction").style.marginTop = "0.625rem";
            }
            
            getElemById("progressTextAction").innerHTML = getLocalizedString(workflowProductNameKey);
            
            getElemById("minutesLeftText").innerHTML = getLocalizedString("OptionsHeader");
            
            showScreenWithId("mainScreen");

            clearInterval(checkIfIframeIsLoaded);
        }
    }, 100);
}

function updateProgress(progressData) {
    getElemById("progressTrack").style.width = progressData.progress + '%';

    var workflowProductNameKey = "InstallingProductName";
    if (isUninstall == "true") {
        workflowProductNameKey = "UninstallingProductName";
    }
    else if (isUpdate == "true") {
        workflowProductNameKey = "UpdatingProductName";
    } else if (isTronPackageDownloading == "true") {
        workflowProductNameKey = "DownloadingProductName";
    }

    var progressPercent = progressData.progress;
    if (progressData.isSuite == "true") {
        if (progressData.isCoreComponentInstalling == "true") {
            progressText = getLocalizedString("SuiteCoreComponentProgress");
        }
        else {
            progressText = getLocalizedString("SuiteInstallProgress").replace('{0}', progressData.currProdInProgress).replace('{1}', progressData.totalProducts);
            progressText = progressText.replace('{2}', progressData.productName);
        }
        getElemById("progressTextAction").innerHTML = progressText;
        progressPercent = progressData.productProgress;
    }
    else {
        getElemById("progressTextAction").innerHTML = getLocalizedString(workflowProductNameKey);
    }

    if (progressData.isSuite != "true" || progressData.isCoreComponentInstalling != "true") {
        getElemById("progressTextPercent").innerHTML = "&nbsp;" + getLocalizedString("Percentage").replace('{0}', progressPercent);
    }


    if (progressData.minutesLeftMin == '0' && progressData.minutesLeftMax == '0') {
        if (isUninstall == "true") {
            if (progressData.showPercent === "false") {
                getElemById("progressTextPercent").innerHTML = "";
            }
            getElemById("progressTextAction").style.marginTop = "11px";
            getElemById("progressTextPercent").style.marginTop = "11px";
            if ($.browser.msie && parseInt($.browser.version, 10) != 8) {
                getElemById("progressTextAction").style.marginTop = "0.688rem";
                getElemById("progressTextPercent").style.marginTop = "0.688rem";
            }
            getElemById("minutesLeftText").style.display = "none";
        } else {
            getElemById("minutesLeftText").innerHTML = getLocalizedString("EstimatingMinutesLeft");
        }
    }
    else if (progressData.minutesLeftMin == '0' && progressData.minutesLeftMax != '0') {
        getElemById("minutesLeftText").innerHTML = getLocalizedString("AboutAMinuteLeftText");
    }
    else {
        getElemById("minutesLeftText").innerHTML = getLocalizedString("MinutesLeftText").replace('{0}', progressData.minutesLeftMin).replace('{1}', progressData.minutesLeftMax);
    }
}

function quitClicked() {
    sendMessageToNative("quitClicked", "");
}
//Overlay
var alertRightButtonHandler = null;
var alertLeftButtonHandler = null;
var quitScreenLeftButtonHandler = null;
var quitScreenRightButtonHandler = null;

function showOverlayAlert(overlayData) {

    sendMessageToNative("overrideCrossButtonState", "true");

    getElemById("alertTitle").innerHTML = overlayData.alertTitle;
    if (!overlayData.showAlertIcon || overlayData.showAlertIcon != "false") {
        getElemById("alertIcon").src = imageMap.errorIcon;
        showElementById("alertIcon");
    }
    else
        hideElementById("alertIcon");
    getElemById("alertTitle").className = "overlayTitleNormal";

    if (overlayData.alertText && overlayData.alertText != "") {
        hideElementById("proxyAlertDiv");
        showElementById("alertText");
        getElemById("alertText").innerHTML = overlayData.alertText;
    }
    else {
        hideElementById("alertText");
        showElementById("proxyAlertDiv");
    }

    if (overlayData.showTwoButtons) {
        showElementById("alertLeftButton", "");
        showElementById("alertButtonSeperatorDiv");
        getElemById("alertLeftButton").innerHTML = overlayData.leftButtonText;
        var alertRightButton = getElemById("alertRightButton");
        alertRightButton.innerHTML = overlayData.rightButtonText;
    }
    else {
        hideElementById("alertLeftButton");
        hideElementById("alertButtonSeperatorDiv");
        var alertRightButton = getElemById("alertRightButton");
        alertRightButton.innerHTML = overlayData.rightButtonText;
    }

    resetScroll();

    $('#alertLeftButton').prop('disabled', false);
    $('#alertRightButton').prop('disabled', false);


    showElementById("overlayAlert");
    $("#overlayScreen").fadeIn(200, function () {
        // Animation complete
        $(".modalBody").customScrollbar();
        /*check overflow to add border*/
        var scrollableElem = getElemById("modalBody");
        if ($(".scroll-bar.vertical").is(":visible")) {
            getElemById("modalFooter").className = "modalFooter text-center";
        } else {
            getElemById("modalFooter").className = "modalFooter text-center noBorder";
        }
    });
}

function showSuiteInstallFinishScreen(data) {
    $('#overlayAlert').css('max-height', '470px');
    $('#modalBody').css('max-height','344px');
    $('#overlayAlert').css('margin', 'auto');
    
    var productIdentifiers = Object.keys(data["productDetails"]);

    var numSuccess = 0, numErrors = 0;
    for (var currInd = 0, numProducts = productIdentifiers.length; currInd < numProducts; currInd++) {
        if (data["productDetails"][productIdentifiers[currInd]]["isError"] == "true") {
            numErrors += 1;
        }
        else {
            numSuccess += 1;
        }
    }

    if (numSuccess > 0) {
        if (numErrors == 0) {
            data.alertTitle = getLocalizedString("InstallCompleteTitle");
        }
        else {
            data.alertTitle = getLocalizedString("InstallCompleteWithExceptionsTitle");
        }
    }
    else {
        data.alertTitle = getLocalizedString("InstallFailedWithExceptionsTitle");
    }

    var installCompleteAlertText = "";
    if (numSuccess > 0) {
        installCompleteAlertText += ("<div class='suiteStatusTitle'>" + getLocalizedString("SuiteInstallationComplete") + "</div>");
        installCompleteAlertText += ("<table id='suiteInstallProdsTable'>");

        for (var currInd = 0, numProducts = productIdentifiers.length; currInd < numProducts; currInd++) {
            var currProd = data["productDetails"][productIdentifiers[currInd]];
            if (currProd["isError"] == "true") {
                continue;
            }
            var iconPath = currProd.iconPath;
            if (isHighDpi == 'true') {
                iconPath = currProd.iconPath2x;
            }
            installCompleteAlertText += ("<tr class='suiteInstallProdRow'>");
            installCompleteAlertText += ("<td class='suiteInstallCompleteProdIcon'><img class='suiteInstallProdIconImg' src='" + iconPath + "'></td>");
            installCompleteAlertText += ("<td class='suiteInstallProdName'>" + currProd.productName + "</td>");
            if (currProd.shouldHideProductLaunch != "true") {
                installCompleteAlertText += ("<td class='suiteInstallLaunch'>" + "<a class='noDecoration' href='#' onclick='suiteProductLaunchClicked(\"" + currProd.sapCode + "\",\"" + currProd.codexVersion.toString() + "\",\"" + currProd.productPlatform + "\");'>" + getLocalizedString("MenuLaunch") + "</a>" + "</td>");
            }
            installCompleteAlertText += ("</tr>");
        }
        installCompleteAlertText += "</table>";
    }
    if (numErrors > 0) {
        if (numSuccess > 0) {
            installCompleteAlertText += ("<div class='successErrorSeparator'></div><div class='suiteStatusTitle'>" + getLocalizedString("ExceptionsTitle") + "</div>");
        }
        for (var currInd = 0, numProducts = productIdentifiers.length; currInd < numProducts; currInd++) {
            var currProd = data["productDetails"][productIdentifiers[currInd]];
            if (currProd["isError"] != "true") {
                continue;
            }
            var iconPath = currProd.iconPath;
            if (isHighDpi == 'true') {
                iconPath = currProd.iconPath2x;
            }
            installCompleteAlertText += ("<table id='suiteInstallProdsTable'>");
            installCompleteAlertText += ("<tr class='suiteInstallProdRow'>");
            installCompleteAlertText += ("<td class='suiteInstallExceptionProdIcon'><img class='suiteInstallProdIconImg' src='" + iconPath + "'></td>");
            installCompleteAlertText += ("<td class='suiteInstallProdName'>" + currProd.productName + "</td>");
            installCompleteAlertText += ("<td class='suiteInstallExceptionIcon'><img class='suiteInstallExceptionImg' src='images/alert.svg'></td>");
            installCompleteAlertText += ("</tr></table>");
            var errorMessage = replaceErrorLinksAndParams(currProd, getLocalizedString(currProd.errorType), true, "");
            if (currProd.showLearnMoreButton == "true") {
                var learnMoreStr = getLocalizedString("learnMore");
                var learnMoreUrl = currProd.moreInfoLink;
                errorMessage += (" <a href=\"#\" ondragstart='return false;' onclick=\"openUrlInBrowser('" + learnMoreUrl + "')\">" + learnMoreStr + "</a>");
            }

            if (currProd.isRetryable == "true") {
                errorMessage = getLocalizedString("SkippedByUser");
            }

            installCompleteAlertText += ("<div class='errorMessageText'>" + errorMessage + "</div>");
        }
    }

    data.alertText = installCompleteAlertText;
    data.rightButtonText = getLocalizedString("MenuClose");
    data.showAlertIcon = "false";
    alertLeftButtonHandler = null;
    alertRightButtonHandler = installFinishCloseClicked;
    showOverlayAlert(data);

    var alertHeight = $('#overlayAlert').height();
    var marginTop = (windowHeight - alertHeight) / 2;
    $('#overlayAlert').css('margin-top', marginTop);
}

function suiteProductLaunchClicked(sapCode, codexVersion, platform) {
    var productData = {};
    productData["SapCode"] = sapCode;
    productData["CodexVersion"] = codexVersion;
    productData["Platform"] = platform;
    sendMessageToNative("suiteProductLaunchClicked", JSON.stringify(productData));
}

function openUrlInBrowser(urlToOpen) {
    sendMessageToNative("openurl", urlToOpen);
    return false;
}

function resetScroll() {
    if (popUpShownOnce==true) {
        $(".modalBody").customScrollbar();
        $("#quitConfirmationScreenModalBody").customScrollbar();
        $(".viewport").height("auto");
        $(".modalBody").customScrollbar("remove");
        $("#quitConfirmationScreenModalBody").customScrollbar("remove");
    } else {
        popUpShownOnce = true;
    }
}

function retryClicked() {
    sendMessageToNative("overrideCrossButtonState", "false");

    hideOverlay("");
    sendMessageToNative("retryClicked", "");
}

function noNetworkRetryClicked() {
    if (lastScreenShown != null)
    {
        hideElementById("noNetworkScreen");
        showElement(lastScreenShown);
    }

    sendMessageToNative("overrideCrossButtonState", "false");

    hideOverlay("");
    sendMessageToNative("retryClicked", "");
}

function quitConfirmationNoClicked() {
    sendMessageToNative("overrideCrossButtonState", "false");
    hideQuitConfirmationScreen();
    sendMessageToNative("quitConfirmationNoClicked", "");
}

function warningCloseClicked() {

    hideOverlay("");
    sendMessageToNative("warningCloseClicked", ""); // message not needed as of now
}

function alertScreenQuitConfirmationYesClicked() {
    sendMessageToNative("overrideCrossButtonState", "false");
    hideOverlay("");
    showQuittingScreen();
    sendMessageToNative("quitConfirmationYesClicked", "");
}

function quitConfirmationYesClicked() {
    sendMessageToNative("overrideCrossButtonState", "false");
    hideQuitConfirmationScreen();
    showQuittingScreen();
    sendMessageToNative("quitConfirmationYesClicked", "");
}

function installFinishCloseClicked() {
    sendMessageToNative("overrideCrossButtonState", "false");

    hideOverlay("");
    sendMessageToNative("installFinishCloseClicked", "");
}

function installFinishLaunchClicked() {
    sendMessageToNative("overrideCrossButtonState", "false");

    hideOverlay("");
    sendMessageToNative("installFinishLaunchClicked", "");

}

function downloadFinishOpenInFinderClicked() {
    sendMessageToNative("downloadFinishOpenInFinderClicked", "");
}

function packageExpiredOpenAdminConsoleClicked () {
    sendMessageToNative("packageExpiredOpenAdminConsoleClicked", "");
}


function keepUninstallPreferencesClicked() {
    sendMessageToNative("overrideCrossButtonState", "false");

    hideOverlay("");
    sendMessageToNative("keepUninstallPreferencesClicked", "");
}

function uninstallFinishCloseClicked() {
    sendMessageToNative("overrideCrossButtonState", "false");

    hideOverlay("");
    sendMessageToNative("UninstallFinishCloseClicked", "");

}

function removeUninstallPreferencesClicked() {
    sendMessageToNative("overrideCrossButtonState", "false");

    hideOverlay("");
    sendMessageToNative("removeUninstallPreferencesClicked", "");
}

function showQuitConfirmation(screenData) {
    var overlayData = {};
    overlayData.alertTitle = getLocalizedString("QuitConfirmTitle");
    overlayData.showAlertIcon = "false";

    var quitConfirmKey = "QuitConfirm";
    if (isUninstall == "true") {
        quitConfirmKey = "QuitConfirmUninstall";
    }
    else if (isUpdate == "true") {
        quitConfirmKey = "QuitConfirmUpdate";
    }
    else if (isTronPackageDownloading == "true") {
        quitConfirmKey = "QuitConfirmDownload"
    }
    overlayData.alertText = getLocalizedString(quitConfirmKey).replace('{0}', entityName);

    overlayData.showTwoButtons = true;
    overlayData.rightButtonText = getLocalizedString("DontQuit");
    overlayData.leftButtonText = getLocalizedString("Quit");
    quitScreenRightButtonHandler = quitConfirmationNoClicked;
    quitScreenLeftButtonHandler = quitConfirmationYesClicked;
    showQuitConfirmationScreen(overlayData);
    if ($(".scroll-bar.vertical").is(":visible")) {
        $(".modalBody").customScrollbar("remove");
    } else {
        $(".modalBody").customScrollbar();
    }
}

function showWorkflowFinishAlert(workflowType, messageData) {
    var overlayData = {};
    if (workflowType == "download") {
        overlayData.alertTitle = getLocalizedString("DownloadFinishTitle");
        overlayData.alertText = getLocalizedString("DownloadFinishMessage").replace('{0}', messageData.packageName);
        overlayData.showAlertIcon = "false";
        overlayData.showTwoButtons = "true";
        overlayData.rightButtonText = getLocalizedString("MenuClose");
        alertRightButtonHandler = installFinishCloseClicked;
        overlayData.leftButtonText = getLocalizedString("OpenInFinder");
        alertLeftButtonHandler = downloadFinishOpenInFinderClicked;
    }
    else {
        if (workflowType == "install") {
            overlayData.alertTitle = getLocalizedString("InstallFinishTitle");
            overlayData.alertText = getLocalizedString("InstallFinishMessage").replace('{0}', applicationName);
        }
        else if (workflowType == "update") {
            overlayData.alertTitle = getLocalizedString("UpdateFinishTitle");
            overlayData.alertText = getLocalizedString("UpdateFinishMessage").replace('{0}', applicationName);
        }
        
        overlayData.showAlertIcon = "false";
        if (messageData.shouldHideProductLaunch == "true") {
            overlayData.showTwoButtons = false;
            overlayData.rightButtonText = getLocalizedString("MenuClose");
            alertRightButtonHandler = installFinishCloseClicked;
            alertLeftButtonHandler = null;
        }
        else {
            overlayData.showTwoButtons = true;
            overlayData.rightButtonText = getLocalizedString("MenuLaunch");
            alertRightButtonHandler = installFinishLaunchClicked;
            overlayData.leftButtonText = getLocalizedString("MenuClose");
            alertLeftButtonHandler = installFinishCloseClicked;
        }
    }

    showOverlayAlert(overlayData);
    if ($(".scroll-bar.vertical").is(":visible")) {
        $(".modalBody").customScrollbar("remove");
    } else {
        $(".modalBody").customScrollbar();
    }
}


function preventWordBreaks(obj) {
    var currHtml = $(obj).html();
    var allWords = currHtml.split(' ');
    var skipNextWord = false;
    var modHtml = '';
    for (var i = 0; i < allWords.length; i++) {
        var currWord = allWords[i];
        if (skipNextWord == true || currWord.lastIndexOf('<') != -1 || currWord.lastIndexOf('>') != -1) { //currWord is a part of some html tag => leave the word as it is
            modHtml += (currWord + ' ');
        } else { //currWord is not a part of any html tag => ensure that the word is not broken by a newline
            modHtml += ('<span style="white-space: nowrap">' + currWord + '</span> ');
        }

        if (currWord.lastIndexOf('<') != -1) { //html tag started => skip words till the html tag ends
            skipNextWord = true;
        }
        if (currWord.lastIndexOf('>') != -1) { //html tag ends
            skipNextWord = false;
        }
    }
    $(obj).html(modHtml);
}

function showPreferencesAlert() {
    var overlayData = {};
    overlayData.alertTitle = getLocalizedString("PreferencesTitle").replace('{0}', applicationName);;
    overlayData.showAlertIcon = "false";
    overlayData.alertText = getLocalizedString("PreferencesConfirm");
    overlayData.showTwoButtons = true;
    overlayData.rightButtonText = getLocalizedString("KeepPreferences");
    overlayData.leftButtonText = getLocalizedString("RemovePreferences");
    alertRightButtonHandler = keepUninstallPreferencesClicked;
    alertLeftButtonHandler = removeUninstallPreferencesClicked;
    showOverlayAlert(overlayData);
    if ($(".scroll-bar.vertical").is(":visible")) {
        $(".modalBody").customScrollbar("remove");
    } else {
        $(".modalBody").customScrollbar();
    }
    $(".footerItem").each(function () {
        preventWordBreaks(this);
    });
}

function showUninstallFinishAlert() {
    var overlayData = {};
    overlayData.alertTitle = getLocalizedString("UninstallFinishTitle");
    overlayData.showAlertIcon = "false";
    overlayData.alertText = getLocalizedString("UninstallFinishMessage").replace('{0}', applicationName);
    overlayData.showTwoButtons = false;
    overlayData.rightButtonText = getLocalizedString("UninstallFinishClose");
    alertLeftButtonHandler = null;
    alertRightButtonHandler = uninstallFinishCloseClicked;
    showOverlayAlert(overlayData);
    if ($(".scroll-bar.vertical").is(":visible")) {
        $(".modalBody").customScrollbar("remove");
    } else {
        $(".modalBody").customScrollbar();
    }
}

var pathResponseData = "";

function locationChangeLinkClicked(event) {
    if (event.preventDefault)
        event.preventDefault();
    else
        event.returnValue = false;

    sendMessageToNative("locationChangeClicked", pathResponseData);
    //pathResponseData = "";
}

function locationRetryClicked()
{
    hideOverlay("");
    sendMessageToNative("locationRetryClicked", pathResponseData);
	//pathResponseData = "";
}

function showPackageExpiredAlert (alertData) {
    var overlayData = {};
    overlayData.alertTitle = getLocalizedString("DownloadLinkExpired");
    overlayData.alertText = getLocalizedString("ReturnToAdminConsole");
    overlayData.showAlertIcon = "true";

    overlayData.showTwoButtons = "true";
    overlayData.rightButtonText = getLocalizedString("Quit");
    alertRightButtonHandler = quitClicked;
    overlayData.leftButtonText = getLocalizedString("AdminConsole");
    alertLeftButtonHandler = packageExpiredOpenAdminConsoleClicked;
    showOverlayAlert(overlayData);
}

function showErrorAlertForPath(alertData) {
    var overlayData = {};
    /*
    alertTitle
    alertText
    leftBtnText
    rightBtnText
    leftBtnMessageHandler
    rightBtnMessageHandler
    installLocation
    showAlertIcon
    errorParam
    incorrectLocation
    */

    pathResponseData = "";

    overlayData.alertTitle = getLocalizedString(alertData.alertTitle);
    overlayData.showAlertIcon = "true"; //alertData.showAlertIcon;
    overlayData.alertText = getLocalizedString(alertData.alertText);
    if (alertData.moreInfoLink) {
        fileLinkForOpening = alertData.moreInfoLink;
        overlayData.alertText = overlayData.alertText + ' ' + "<a ondragstart='return false;' onclick='openFile(event)' target='_blank' href='" + fileLinkForOpening + "'>" + getLocalizedString("MoreInfo") + "</a>";
    }
	
	pathResponseData = "{";
	pathResponseData += '"installLocation":"';
	var installLoc = alertData.installLocation;
	installLoc = installLoc.replace(/\\/g, "\\\\");
	pathResponseData +=  installLoc + '"';
    pathResponseData += "}";
    
    if (alertData.errorParam) {
        if (alertData.errorParamType == "0") {
            overlayData.alertText = overlayData.alertText.replace('{0}', alertData.errorParam);
        }
    }

    if (alertData.installLocation != undefined && alertData.errorCode != "189") {
    /*    pathResponseData = "{";
        pathResponseData += '"alertTitle":"' + alertData.alertTitle + '",';
        pathResponseData += '"alertText":"' + alertData.alertText + '",';
        if (alertData.moreInfoLink) {
            var moreinfolink = alertData.moreInfoLink;
            moreinfolink = moreinfolink.replace(/\\/g, "\\\\");
            pathResponseData += '"moreInfoLink":"' + moreinfolink + '",';
        }

        if (alertData.errorParam)
            pathResponseData += '"errorParam":"' + alertData.errorParam + '"';
        else
            pathResponseData += '"errorParam":""';
        pathResponseData += "}";
*/
        var stringLocation = "<br>";
        stringLocation += "<a ondragstart='return false;' style='color:#1473e6' ";
        stringLocation += "onclick='locationChangeLinkClicked(event)' target='_blank' href='#'>";
        if (alertData.installLocation === "")
            stringLocation += getLocalizedString("InstallLocationDefault");
        else
            stringLocation += alertData.installLocation;
        stringLocation += " (<span style='color:#1473e6'>" + getLocalizedString("ChangeSmall") + "</span>)" + "</a>";
        var locationStr = getLocalizedString("InstallLocation");
        locationStr = locationStr.replace('{0}', stringLocation);
        overlayData.alertText = overlayData.alertText + "<br><br>" + locationStr;
    }

    if (alertData.errorParam && alertData.errorParamType == "1") {
        var errorParamSplitted = alertData.errorParam.split("#@#");
        if (errorParamSplitted.length > 1) {
            var installSize = errorParamSplitted[0];
            var availableSpace = errorParamSplitted[1];
            overlayData.alertText += ("<p>" + getLocalizedString("TotalInstallSizeErrorDialog") + "&nbsp;" + readableSize(parseInt(installSize), getLocalizedString("DecimalSeperator")) + "<br>" + getLocalizedString("TotalAvailableSpace") + "&nbsp;<span style='color:red'>" + readableSize(parseInt(availableSpace), getLocalizedString("DecimalSeperator")) + "</span></p>");
        }
    }

    overlayData.showTwoButtons = true;
    overlayData.leftButtonText = getLocalizedString(alertData.leftBtnText);
    overlayData.rightButtonText = getLocalizedString(alertData.rightBtnText);
	alertLeftButtonHandler = alertScreenQuitConfirmationYesClicked; 
	alertRightButtonHandler = locationRetryClicked;

	if (alertData.showSkipButton == "true") {
	    overlayData.leftButtonText = getLocalizedString("Skip");
	    alertLeftButtonHandler = skipButtonClicked;
	    overlayData.alertText = overlayData.alertText + "<br>" + (getLocalizedString("ErrorSkipDescription").replace("{0}", overlayData.rightButtonText).replace("{1}", overlayData.leftButtonText));
	}
    /*var tempData = {};
    tempData.leftBtnMessageHandler = alertData.leftBtnMessageHandler;
    tempData.rightBtnMessageHandler = alertData.rightBtnMessageHandler;
    alertLeftButtonHandler = function () {
        sendMessageToNative("overrideCrossButtonState", "false");

        hideOverlay("");
        sendMessageToNative(tempData.leftBtnMessageHandler, "");
    };
    alertRightButtonHandler = function () {
        sendMessageToNative("overrideCrossButtonState", "false");

        hideOverlay("");
        sendMessageToNative(tempData.rightBtnMessageHandler, "");
    };
*/
    showOverlayAlert(overlayData);
}

function learnMoreButtonClicked() {
    sendMessageToNative("openurl", urlForOpening);
    return false;
}

function showErrorAlert(alertData) {
    var overlayData = {};
    var skipDescriptionAlertText = "";
    if (alertData.showRetry == "true" || alertData.showContinue == "true") {
        if (alertData.errorTitle != "")
            overlayData.alertTitle = getLocalizedString(alertData.errorTitle);
        else {
            var retryWorkflowTitleKey = "RetryInstallationTitle";
            if (isUninstall == "true") {
                retryWorkflowTitleKey = "RetryUninstallationTitle";
            }
            else if (isUpdate == "true") {
                retryWorkflowTitleKey = "RetryUpdatingTitle";
            }
            overlayData.alertTitle = getLocalizedString(retryWorkflowTitleKey);
        }
        overlayData.showTwoButtons = true;
        if (alertData.showRetry && alertData.showRetry == "true") {
            overlayData.rightButtonText = getLocalizedString("Retry");
        }
        else {
            overlayData.rightButtonText = getLocalizedString("Continue");
        }
        overlayData.leftButtonText = getLocalizedString("Quit");
        alertRightButtonHandler = retryClicked;
        alertLeftButtonHandler = quitClicked;

        if (alertData.showSkipButton == "true") {
            overlayData.showTwoButtons = true;
            overlayData.leftButtonText = getLocalizedString("Skip");
            alertLeftButtonHandler = skipButtonClicked;
            skipDescriptionAlertText = (getLocalizedString("ErrorSkipDescription").replace("{0}", overlayData.rightButtonText).replace("{1}", overlayData.leftButtonText));
        }

    }
    else {
        if (alertData.errorTitle != "") {
            overlayData.alertTitle = getLocalizedString(alertData.errorTitle);
        }
        else {
            var workflowFailedTitleKey = "InstallationFailedTitle";
            if (isUninstall == "true") {
                workflowFailedTitleKey = "UninstallationFailedTitle";
            }
            else if (isUpdate == "true") {
                workflowFailedTitleKey = "UpdateFailedTitle";
            }
            overlayData.alertTitle = getLocalizedString(workflowFailedTitleKey);
        }
        
        var workflowFailedHeaderKey = "InstallationFailedHeader";
        if (isUninstall == "true") {
            workflowFailedHeaderKey = "UninstallationFailedHeader";
        }
        else if (isUpdate == "true") {
            workflowFailedHeaderKey = "UpdateFailedHeader";
        }
        getElemById("progressTextAction").innerHTML = getLocalizedString(workflowFailedHeaderKey);

        getElemById("minutesLeftText").innerHTML = getLocalizedString("InstallationFailedSubHeader");
        getElemById("progressTextPercent").innerHTML = "";

        overlayData.showTwoButtons = false;
        overlayData.rightButtonText = getLocalizedString("Quit");
        alertLeftButtonHandler = null;
        alertRightButtonHandler = quitClicked;

        if (alertData.showLearnMoreButton == "true") {
            overlayData.showTwoButtons = true;
            overlayData.leftButtonText = getLocalizedString("learnMore");
            urlForOpening = alertData.moreInfoLink;
            alertLeftButtonHandler = learnMoreButtonClicked;
        }
    }

    overlayData.alertText = replaceErrorLinksAndParams(alertData, getLocalizedString(alertData.errorType), false, skipDescriptionAlertText);

    showOverlayAlert(overlayData);
}

function skipButtonClicked() {
    hideOverlay("");
    sendMessageToNative("skipClicked", "");
    return false;
}

function replaceErrorLinksAndParams(alertData, alertText, isSuiteSummary, errorSkipDescription) {
    if (alertData.errorParam) {
        if (alertData.appendParamsAtEnd && alertData.appendParamsAtEnd == "true")
            alertText += alertData.errorParam;
        else
            alertText = alertText.replace('{0}', alertData.errorParam);
    }
    alertText += errorSkipDescription;
    if (alertData.errorCode) {
        alertText = alertText + ' ' + getLocalizedString('ErrorCode').replace('{0}', alertData.errorCode);
    }

    if (alertData.moreInfoLink && alertData.showLearnMoreButton != "true") {
        fileLinkForOpening = alertData.moreInfoLink;
        alertText = alertText + ' ' + "<a ondragstart='return false;' onclick='openFile(event)' target='_blank' href='" + fileLinkForOpening + "'>" + getLocalizedString("MoreInfo") + "</a>";
    }


    if (alertText.indexOf('{10}') > -1) {
        urlForOpening = getLocalizedString("CustomerSupportLink");
        alertText = alertText.replace('{10}', "<a ondragstart='return false;' onclick='openUrl(event)' target='_blank' href='" + urlForOpening + "'>");
    }
    else if (alertText.indexOf('{12}') > -1) {
        urlForOpening = getLocalizedString("MinSysReqLink");
        alertText = alertText.replace('{12}', "<a ondragstart='return false;' onclick='openUrl(event)' target='_blank' href='" + urlForOpening + "'>");
    }
    else {
        if (!alertData.moreInfoLink) {
            if (alertData.errorCode == '131') {
                urlForOpening = getLocalizedString("HDESDConflictingProcessErrorLink");
            }
            else {
                urlForOpening = getLocalizedString("HDESDCustomerSupportLink") + "#error_"+ alertData.errorCode;
            }
            var getHelpText = getLocalizedString("GetHelpText");
            if (!isSuiteSummary) {
                alertText = alertText.concat("<br><br>");
            }
            else {
                alertText = alertText.concat(" ");
            }
            alertText = alertText.concat("<a ondragstart='return false;' onclick='openUrl(event)' target='_blank' href='" + urlForOpening + "'>" + getHelpText + "{11}");
        }

    }
    alertText = alertText.replace('{11}', "</a>");
    return alertText;
}

function showQuitConfirmationScreen(overlayData) {
    sendMessageToNative("overrideCrossButtonState", "true");

    getElemById("quitConfirmationScreenTitle").innerHTML = overlayData.alertTitle;
    if (!overlayData.showAlertIcon || overlayData.showAlertIcon != "false") {
        getElemById("quitConfirmationScreenIcon").src = imageMap.errorIcon;
        showElementById("quitConfirmationScreenIcon");
    }
    else {
        hideElementById("quitConfirmationScreenIcon");
    }

    getElemById("quitConfirmationScreenTitle").className = "overlayTitleNormal";

    getElemById("quitConfirmationScreenText").innerHTML = overlayData.alertText;

    if (overlayData.showTwoButtons) {
        showElementById("quitConfirmationScreenLeftButton", "");
        showElementById("alertButtonSeperatorDiv");
        getElemById("quitConfirmationScreenLeftButton").innerHTML = overlayData.leftButtonText;
        var alertRightButton = getElemById("quitConfirmationScreenRightButton");
        alertRightButton.innerHTML = overlayData.rightButtonText;
    }
    else {
        hideElementById("quitConfirmationScreenLeftButton");
        hideElementById("alertButtonSeperatorDiv");
        var alertRightButton = getElemById("quitConfirmationScreenRightButton");
        alertRightButton.innerHTML = overlayData.rightButtonText;
    }

    resetScroll();
    showElementById("emptyScreen");
    showElementById("quitConfirmationScreen");
    $("#quitConfirmationScreen").fadeIn(200, function () {
        // Animation complete
        $("#quitConfirmationScreenModalBody").customScrollbar();
        /*check overflow to add border*/
        var scrollableElem = getElemById("quitConfirmationScreenModalBody");
        if ($(".scroll-bar.vertical").is(":visible")) {
            getElemById("quitConfirmationScreenModalFooter").className = "quitConfirmationScreenModalFooter text-center";
        } else {
            getElemById("quitConfirmationScreenModalFooter").className = "quitConfirmationScreenModalFooter text-center noBorder";
        }
    });
}

function showWarningAlert(alertData) {
    var overlayData = {};
    
	overlayData.alertTitle = getLocalizedString(alertData.errorTitle);
	overlayData.alertText = getLocalizedString(alertData.errorType);
	
	overlayData.rightButtonText = getLocalizedString("MenuOk");
	
	alertLeftButtonHandler = null;
	alertRightButtonHandler = warningCloseClicked;
	
    showOverlayAlert(overlayData);
}

function alertLeftButtonClicked() {
    var clearHandlers = true;
    if (alertLeftButtonHandler)
        clearHandlers = alertLeftButtonHandler();
    
}

function alertRightButtonClicked() {
    var clearHandlers = true;
    if (alertRightButtonHandler)
        clearHandlers = alertRightButtonHandler();
    
}

function quitScreenLeftButtonClicked() {
    var quitScreenClearHandlers = true;
    if (quitScreenLeftButtonHandler)
        quitScreenClearHandlers = quitScreenLeftButtonHandler();
}

function quitScreenRightButtonClicked() {
    var quitScreenClearHandlers = true;
    if (quitScreenRightButtonHandler)
        quitScreenClearHandlers = quitScreenRightButtonHandler();
}

function hideOverlay(overlayData) {
    $("#overlayScreen").fadeOut(200);
}

function hideQuitConfirmationScreen() {
    hideElementById("emptyScreen");
    $("#quitConfirmationScreen").fadeOut(200);
}

//Proxy Screen
var proxyAlertUserNameDefaultText;
var proxyAlertPasswordDefaultText;
var isProxyAlertShown = false;

function showProxyAlert(screenData) {
    proxyAlertUserNameDefaultText = getLocalizedString("Username");
    proxyAlertPasswordDefaultText = getLocalizedString("Password");
    var overlayData = {};
    if (isProxyAlertShown) {
        overlayData.showAlertIcon = "true";
        getElemById("ProxyAlertTitle").innerHTML = getLocalizedString("ProxyAlertErrorTitle");
        getElemById("proxyAlertUsername").className = getElemById("proxyAlertUsername").className + " errorTextbox";
        getElemById("proxyAlertPassword").className = getElemById("proxyAlertPassword").className + " errorTextbox";
    }
    else {
        overlayData.showAlertIcon = "false";
        getElemById("ProxyAlertTitle").innerHTML = getLocalizedString("ProxyAlertTitle");

        getElemById("proxyAlertUsername").className = getElemById("proxyAlertUsername").className.replace(" errorTextbox", "");
        getElemById("proxyAlertPassword").className = getElemById("proxyAlertPassword").className.replace(" errorTextbox", "");

        getElemById("proxyAlertUsername").setAttribute("placeholder", proxyAlertUserNameDefaultText);

        getElemById("proxyAlertPassword").setAttribute("placeholder", proxyAlertPasswordDefaultText);
        isProxyAlertShown = true;
    }

    getElemById("proxyAlertRememberMeText").innerHTML = getLocalizedString("RememberMe");

    overlayData.alertTitle = getLocalizedString("ProxyAlertHeader");
    overlayData.alertText = "";
    overlayData.showTwoButtons = true;
    overlayData.rightButtonText = getLocalizedString("Continue");
    overlayData.leftButtonText = getLocalizedString("Quit");
    alertRightButtonHandler = proxyAlertLoginButtonClick;
    alertLeftButtonHandler = alertScreenQuitConfirmationYesClicked;
    showOverlayAlert(overlayData);
    if ($(".modalBody.default-skin").height() == 166) {
        $(".modalBody").customScrollbar();
    }
    $('input').placeholder({ customClass: 'userInputBlank' });
}

function proxyAlertLoginButtonClick() 
{
    sendMessageToNative("overrideCrossButtonState", "false");
    
    var username = $("#proxyAlertUsername").val();
    var password = $("#proxyAlertPassword").val();
    var rememberMe = "false";
    if (getElemById("proxyAlertRememberMe").checked)
        rememberMe = "true";
    var details = "{";
    username = username.replace("\\", "\\\\");
    details = details + "\"userName\":\"" + username + "\",";
    details = details + "\"password\":\"" + password + "\",";
    details = details + "\"rememberMe\":\"" + rememberMe + "\"";
    details = details + "}";
    hideOverlay();
    sendMessageToNative("proxyAlertLoginButtonClicked", details);
}

$('input').placeholder({ customClass: 'userInputBlank' });
