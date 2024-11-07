/**
 * Created by puarora on 05/10/2017.
 */

function attachEvt(elem, eventName, handler) {
    if (document.attachEvent) elem.attachEvent('on' + eventName, handler);
    else elem.addEventListener(eventName, handler);
}

function wrap(el, wrapper) {
    wrapper.setAttribute("class", "custom-checkbox");
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
}

function addClass(ele, cls) {
    if (!hasClass(ele, cls)) ele.className += " " + cls;
}

function removeClass(ele, cls) {
    if (hasClass(ele, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        ele.className = ele.className.replace(reg, ' ');
    }
}

function toggleClass(element, cssClass) {
    var classes = element.className.match(/\S+/g) || [],
        index = classes.indexOf(cssClass);
    index >= 0 ? classes.splice(index, 1) : classes.push(cssClass);
    element.className = classes.join(' ');
}

function hasClass(target, className) {
    return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
}

function customCheckbox(checkboxName) {
    var checkBox = document.getElementsByName(checkboxName);
    for (var i = 0; i < checkBox.length; i++) {
        wrap(checkBox[i], document.createElement('span'));
        if (checkBox[i].checked == true) {
            checkBox[i].parentNode.setAttribute("class", "selected");
        }
        applyImage(checkBox[i].parentNode);


        attachEvt(checkBox[i], "click", customCheckboxHandler);
    }

}

function applyImage(elem) {
    var imageURL = imageMap.checkEmpty;
    if (hasClass(elem, "selected")) {
        imageURL = imageMap.checkFull;
    }
    imageURL = imageURL.replace(/^(file:[/]+)/, "");
    if ($.browser.msie && parseInt($.browser.version, 10) === 8) {
        elem.setAttribute("style", "filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + imageURL + "',sizingMethod='scale');");
    } else {
        elem.style.backgroundImage = "url('" + imageURL + "')";
    }
}

var readableSize = function (sizeInBytes, decimalSeperator) {
    var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    var nearestUnitInd = (sizeInBytes <= 0) ? 0 : (Math.floor(Math.log(sizeInBytes) / Math.log(1024)));
    var sizeInDecimal = (sizeInBytes / Math.pow(1024, nearestUnitInd)).toFixed(2) * 1;
    var sizeWithDecimalSeperator = Math.floor(sizeInDecimal) + decimalSeperator + Math.round((sizeInDecimal - Math.floor(sizeInDecimal)) * 100);
    var sizeInReadableForm = sizeWithDecimalSeperator + ' ' + units[nearestUnitInd];
    return sizeInReadableForm;
}