// firefox version of https://github.com/toluschr/YouTube-Comment-Translate



(function main() {
    function ReplaceNode(a, b) {
        a.parentNode.appendChild(b);
        a.parentNode.removeChild(a);
    }

    function TranslateButton_SetState() {
        this.style.cursor = 'pointer';
        if (this._ntext.parentNode !== null) {
            ReplaceNode(this._ntext, this._otext);
            this.innerHTML = translate_icon();
        } else {

            ReplaceNode(this._otext, this._ntext);
            this.innerHTML = UNDO_ICON;
        }
    }

    function TranslateButton_Translate() {
        this.onclick = TranslateButton_SetState;
        this.style.cursor = "wait";

        let tmp = document.createElement("div");
        tmp.innerHTML = this._otext.innerHTML;
        for (const img of tmp.querySelectorAll('img.emoji')) {
            img.after(img.alt);
            img.remove();
            // replace the image with its alternative emoji
        }

        fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${TARGET}&dt=t&q=${encodeURIComponent(tmp.innerText)}`)
            .then(response => response.json()).then(json => {

                for (let i = 0; i < json[0].length; i++) {
                    let line = json[0][i][0].replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    if (line.endsWith("\n")) line += '<br>';

                    this._ntext.innerHTML += line;
                }
                this.onclick();
            });
    }

    function ResetTranslateButton(tb) {
        if (tb._ntext.parentNode !== null) ReplaceNode(tb._ntext, tb._otext);

        tb._ntext.innerText = "";
        tb.innerHTML = translate_icon();
        tb.onclick = TranslateButton_Translate;
    }

    function TranslateButton(main) {
        let tb = document.createElement("a");
        tb.id = "translate-button";
        tb.style = "margin-left: 5px; cursor: pointer;";
        tb.classList = "yt-simple-endpoint style-scope yt-formatted-string";

        tb._otext = main.querySelector(QS_CONTENT_TEXT);
        tb._otext.addEventListener("DOMSubtreeModified", _ => ResetTranslateButton(tb));

        tb._ntext = document.createElement("div");
        tb._ntext.style.whiteSpace = "pre-wrap";
        tb._ntext.id = "content-text";
        tb._ntext.classList = "style-scope ytd-comment-renderer translate-text yt-formatted-string";

        ResetTranslateButton(tb);
        return tb;
    }

    /* Query Selectors */
    // From main
    const QS_TRANSLATE_BUTTON = "#header>#header-author>yt-formatted-string>#translate-button";
    const QS_CONTENT_TEXT = "#expander>#content>#content-text";
    const QS_BUTTON_CONTAINER = "#header>#header-author>yt-formatted-string";

    /* User settings */
    var TARGET = getDefaultLanguage();

    browser.storage.local.get(storage_key).then((obj) => {
        if (obj.hasOwnProperty(storage_key)) {
            TARGET = obj[storage_key];
        }
    });

    browser.storage.onChanged.addListener(function (obj) {
        if (obj.hasOwnProperty(storage_key) && obj[storage_key].hasOwnProperty('newValue')) {
            TARGET = obj[storage_key].newValue;
            // undo all translated text
            for (const el of document.querySelectorAll('.undo-icon')) { el.click(); }
            // remove all icons
            for (const el of document.querySelectorAll(QS_TRANSLATE_BUTTON)) { el.remove(); }
            // reinject 
            for (const el of document.querySelectorAll('#contents #body>#main')) {
                el.querySelector(QS_BUTTON_CONTAINER).appendChild(TranslateButton(el));
            }
        }
    });

    const languageName = new Intl.DisplayNames(['en'], { type: 'language' });

    var translate_text = () => { return "Translate to " + languageName.of(TARGET); };
    var translate_icon = () => { return `<img src="${browser.runtime.getURL('icons/translate.png')}" alt="${translate_text()}" title="${translate_text()}" width="16" height="16" style="vertical-align: top">`; };
    var UNDO_ICON = `<img src="${browser.runtime.getURL('icons/undo.png')}" class="undo-icon" alt="Undo" title="Undo" width="16" height="16" style="vertical-align: top">`;
    inject();

    /* Functions */
    // Inject as soon as the comment section was loaded
    function inject() {
        const observerConfig = { childList: true, subtree: true };
        const commentObserver = new MutationObserver(e => {
            for (let mut of e) {

                if (mut.target.id == "contents") {
                    for (let n of mut.addedNodes) {
                        let main = n.querySelector("#body>#main");
                        if (!main) continue;

                        let tb = main.querySelector(QS_TRANSLATE_BUTTON);
                        if (tb != null) {
                            ResetTranslateButton(tb);
                        } else {
                            main.querySelector(QS_BUTTON_CONTAINER).appendChild(TranslateButton(main));
                        }
                    }
                }
            }
        });

        commentObserver.observe(document, observerConfig);

    }
})();
