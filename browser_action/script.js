

const supported_languages = ['af', 'sq', 'de', 'am', 'en', 'ar', 'hy', 'as', 'ay', 'az', 'bm', 'eu', 'bn', 'bho', 'be', 'my', 'bs', 'bg', 'ca', 'ceb', 'ny', 'zh-CN', 'zh-TW', 'si', 'ko', 'co', 'ht', 'hr', 'da', 'dv', 'doi', 'es', 'eo', 'et', 'ee', 'fi', 'fr', 'fy', 'gd', 'gl', 'cy', 'ka', 'el', 'gn', 'gu', 'ha', 'haw', 'iw', 'hi', 'hmn', 'hu', 'ig', 'ilo', 'id', 'ga', 'is', 'it', 'ja', 'jw', 'kn', 'kk', 'km', 'rw', 'ky', 'gom', 'kri', 'ku', 'ckb', 'lo', 'la', 'lv', 'ln', 'lt', 'lg', 'lb', 'mk', 'mai', 'ms', 'ml', 'mg', 'mt', 'mi', 'mr', 'mni-Mtei', 'lus', 'mn', 'nl', 'ne', 'no', 'or', 'om', 'ug', 'uz', 'ps', 'pa', 'fa', 'tl', 'pl', 'pt', 'qu', 'ro', 'ru', 'sm', 'sa', 'nso', 'sr', 'st', 'sn', 'sd', 'sk', 'sl', 'so', 'su', 'sv', 'sw', 'tg', 'ta', 'tt', 'cs', 'te', 'th', 'ti', 'ts', 'tr', 'tk', 'ak', 'uk', 'ur', 'vi', 'xh', 'yi', 'yo', 'zu'];
// iso code array from google translate

let languageName = new Intl.DisplayNames([getDefaultLanguage()], { type: 'language' });

const select = document.getElementById('languages');


let selectHtml = '';
for (const iso_code of supported_languages) {
    let language = capitalizeFirstLetter(languageName.of(iso_code));

    selectHtml += `<option value="${iso_code}">${language}</option>`;
}
select.innerHTML = selectHtml;

getBrowser().storage.local.get(storage_key).then((obj) => {
    let defaultLanguage = getDefaultLanguage();
    if (!supported_languages.includes(defaultLanguage)) {
        defaultLanguage = "en";
    }
    select.value = obj[storage_key] || defaultLanguage;
    select.children[select.selectedIndex].setAttribute('selected', true);

    select.onchange = (e) => {
        let obj = {};
        obj[storage_key] = e.target.value;
        getBrowser().storage.local.set(obj);
    };

    NiceSelect.bind(select, { searchable: true });

}, (err) => {
    alert('Error: ' + err);
});



