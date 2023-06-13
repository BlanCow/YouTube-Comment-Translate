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
            this.setAttribute('data-translated', 0);
        } else {

            ReplaceNode(this._otext, this._ntext);
            this.innerHTML = UNDO_ICON;
            this.setAttribute('data-translated', 1);
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
                this._ntext.innerHTML = '<div>';
                for (let i = 0; i < json[0].length; i++) {
                    let line = json[0][i][0].replace(/</g, '&lt;').replace(/>/g, '&gt;');

                    if (line.endsWith("\n")) line += '</div><div>';
                    this._ntext.innerHTML += line;
                }
                this._ntext.innerHTML += '</div>';
                this.onclick();
            }).catch(error => {
                console.error('Translate Request error:', error);
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

        if (autoTranslate)
            buttonObserver.observe(tb);

        return tb;
    }

    async function handleButtonIntersection(entries, observer) {

        for (const entry of entries) {
            const button = entry.target;
            if (button.getAttribute('data-translated') === '1') continue;

            if (entry.isIntersecting) {
                await delay(50 + (Math.random() * 100));
                button.click();
                buttonObserver.unobserve(button);
            }
        }
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function addAutoTranslateButton(parent) {
        const html = `
            <div style="margin-left: auto;">
                <button class="auto-translate-btn yt-spec-button-shape-next yt-spec-button-shape-next--tonal yt-spec-button-shape-next--mono yt-spec-button-shape-next--size-m">
                    ${autoTranslateButtonText()}
                </button>
            </div>
        `;
        parent.insertAdjacentHTML('beforeend', html);
        const autoTranslateButtons = document.querySelectorAll('.auto-translate-btn');

        for (const btn of autoTranslateButtons) {
            btn.onclick = () => {
                autoTranslate = !autoTranslate;

                btn.innerText = autoTranslateButtonText();
                if (autoTranslate) {
                    for (const translateBtn of document.querySelectorAll(QS_TRANSLATE_BUTTON)) {
                        buttonObserver.observe(translateBtn);
                    }
                } else {
                    buttonObserver.disconnect();
                }
            };
        }


    }

    function autoTranslateButtonText() {
        return (autoTranslate ? 'Disable' : 'Enable') + ' Auto Comment Translation';
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
            buttonObserver.disconnect();
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

    var buttonObserver = new IntersectionObserver(handleButtonIntersection, { root: null, rootMargin: '0px', threshold: 0 });
    var autoTranslate = false;

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
                if (mut.target.nodeName === 'YTD-COMMENTS-HEADER-RENDERER') {
                    addAutoTranslateButton(mut.target.querySelector('#title'));
                }
            }
        });

        commentObserver.observe(document, observerConfig);

    }
})();
