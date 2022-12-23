const storage_key = 'target_language';

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getDefaultLanguage() {
    return navigator.language || navigator.userLanguage || 'en';
}

