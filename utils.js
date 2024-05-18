const storage_key = 'target_language';

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getDefaultLanguage() {
    return (navigator.language || navigator.userLanguage || 'en').split('-')[0];
}

function getBrowser() {

    if (typeof browser !== 'undefined' && typeof browser.runtime !== 'undefined') {
        return browser; // firefox
    }
    else if (typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined') {
        return chrome; // chrome
    }
    // help!
    return null;
}