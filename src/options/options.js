"use strict";

var _orig$ = document.querySelector.bind(document);
var $ = function(sel) {
  var el = _orig$(sel);
  if (!el) {
    var noop = function() { return null; };
    return new Proxy({}, {
      get: function(target, prop) {
        if (prop === Symbol.toPrimitive) return function() { return ''; };
        if (prop === 'value') return '';
        if (prop === 'checked') return false;
        if (typeof prop === 'string') {
          var lc = prop.toLowerCase();
          if (lc === 'innerhtml' || lc === 'innertext' || lc === 'textcontent') return '';
          if (lc === 'style') return new Proxy({}, { get: function(t,p) { return ''; }, set: function() { return true; } });
          if (lc === 'classlist') return { add: noop, remove: noop, toggle: noop, contains: function() { return false; } };
          if (lc === 'children' || lc === 'childnodes') return [];
          if (lc === 'length') return 0;
          if (lc === 'parentelement' || lc === 'parentnode') return null;
        }
        return noop;
      },
      set: function() { return true; }
    });
  }
  return el;
};

twpConfig
  .onReady()
  .then(() => {
    // https://github.com/FilipePS/Traduzir-paginas-web/issues/774
    if (sessionStorage !== null) {
      return twpI18n.updateUiMessages(
        sessionStorage.getItem("temporaryUiLanguage")
      );
    } else {
      return twpI18n.updateUiMessages();
    }
  })
  .then(() => {
    twpI18n.translateDocument();
    const defaultLangEl = document.querySelector("[data-i18n='msgDefaultLanguage']");
    if (defaultLangEl) {
      defaultLangEl.textContent = twpI18n.getMessage("msgDefaultLanguage") + " - Default language";
    }

    let temporaryUiLanguage = null;
    if (sessionStorage !== null) {
      temporaryUiLanguage = sessionStorage.getItem("temporaryUiLanguage");
      sessionStorage.removeItem("temporaryUiLanguage");
    }

    if (platformInfo.isMobile.any) {
      let style = document.createElement("style");
      style.textContent = ".desktopOnly {display: none !important}";
      document.head.appendChild(style);
    }

    if (!chrome.pageAction) {
      let style = document.createElement("style");
      style.textContent = ".firefox-only {display: none !important}";
      document.head.appendChild(style);
    }

    let sideBarIsVisible = false;
    $("#btnOpenMenu").onclick = (e) => {
      $("#menuContainer").classList.toggle("change");

      if (sideBarIsVisible) {
        $("#sideBar").style.display = "none";
        sideBarIsVisible = false;
      } else {
        $("#sideBar").style.display = "block";
        sideBarIsVisible = true;
      }
    };

    // Sidebar navigation click handler
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.onclick = (e) => {
        e.preventDefault();
        const href = item.getAttribute("href");
        if (href) {
          const hash = href;
          const sectionMap = {
            "#languages": "#translation",
            "#sites": "#advanced",
            "#translations": "#translation",
            "#style": "#appearance",
            "#hotkeys": "#hotkeys",
            "#privacy": "#advanced",
            "#storage": "#advanced",
            "#others": "#advanced",
            "#experimental": "#advanced"
          };
          const targetHash = sectionMap[hash] || hash;

          document.querySelectorAll(".content-section").forEach((s) => s.classList.add("hidden"));
          document.querySelectorAll(".nav-item").forEach((a) => a.classList.remove("active"));

          const targetSection = $(targetHash);
          if (targetSection) targetSection.classList.remove("hidden");
          item.classList.add("active");

          if (sideBarIsVisible) {
            $("#menuContainer").classList.toggle("change");
            $("#sideBar").style.display = "none";
            sideBarIsVisible = false;
          }

          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      };
    });

    // Init display
    const initialHash = location.hash || "#translation";
    const initHash = {
      "#languages": "#translation",
      "#sites": "#advanced",
      "#translations": "#translation",
      "#style": "#appearance",
      "#hotkeys": "#hotkeys",
      "#privacy": "#advanced",
      "#storage": "#advanced",
      "#others": "#advanced",
      "#experimental": "#advanced"
    }[initialHash] || initialHash;
    document.querySelectorAll(".content-section").forEach((s) => {
      if (s.id === initHash.replace("#", "")) {
        s.classList.remove("hidden");
      } else {
        s.classList.add("hidden");
      }
    });
    // Activate the correct nav item
    const initSectionId = initHash.replace("#", "");
    document.querySelectorAll(".nav-item").forEach((el) => {
      const href = el.getAttribute("href");
      if (href && href === "#" + initSectionId) {
        el.classList.add("active");
      }
    });

    function fillLanguageList(select) {
      let langs = twpLang.getLanguageList();

      const langsSorted = [];

      for (const i in langs) {
        langsSorted.push([i, langs[i]]);
      }

      langsSorted.sort(function (a, b) {
        return a[1].localeCompare(b[1]);
      });

      langsSorted.forEach((value) => {
        const option = document.createElement("option");
        option.value = value[0];
        option.textContent = value[1];
        select.appendChild(option);
      });
    }

    fillLanguageList($("#selectTargetLanguage"));
    fillLanguageList($("#selectTargetLanguageForText"));

    fillLanguageList($("#favoriteLanguage1"));
    fillLanguageList($("#favoriteLanguage2"));
    fillLanguageList($("#favoriteLanguage3"));

    fillLanguageList($("#addToNeverTranslateLangs"));
    fillLanguageList($("#addToAlwaysTranslateLangs"));
    fillLanguageList($("#addLangToTranslateWhenHovering"));

    // Target Language Pills — dynamic
    (function initTargetLangPills() {
      var container = document.getElementById("targetLangPills");
      var addSelect = document.getElementById("addTargetLangSelect");
      if (!container || !addSelect) return;

      var flags = {
        en: "\u{1F1EC}\u{1F1E7}", es: "\u{1F1EA}\u{1F1F8}", de: "\u{1F1E9}\u{1F1EA}",
        fr: "\u{1F1EB}\u{1F1F7}", it: "\u{1F1EE}\u{1F1F9}", pt: "\u{1F1F5}\u{1F1F9}",
        ru: "\u{1F1F7}\u{1F1FA}", zh: "\u{1F1E8}\u{1F1F3}", ja: "\u{1F1EF}\u{1F1F5}",
        ko: "\u{1F1F0}\u{1F1F7}", ar: "\u{1F1F8}\u{1F1E6}", hi: "\u{1F1EE}\u{1F1F3}",
        tr: "\u{1F1F9}\u{1F1F7}", nl: "\u{1F1F3}\u{1F1F1}", pl: "\u{1F1F5}\u{1F1F1}",
        sv: "\u{1F1F8}\u{1F1EA}", da: "\u{1F1E9}\u{1F1F0}", no: "\u{1F1F3}\u{1F1F4}",
        fi: "\u{1F1EB}\u{1F1EE}", el: "\u{1F1EC}\u{1F1F7}", cs: "\u{1F1E8}\u{1F1FF}",
        ro: "\u{1F1F7}\u{1F1F4}", hu: "\u{1F1ED}\u{1F1FA}", uk: "\u{1F1FA}\u{1F1E6}",
        id: "\u{1F1EE}\u{1F1E9}", th: "\u{1F1F9}\u{1F1ED}", vi: "\u{1F1FB}\u{1F1F3}",
        he: "\u{1F1EE}\u{1F1F1}", ms: "\u{1F1F2}\u{1F1FE}", bg: "\u{1F1E7}\u{1F1EC}",
        ca: "\u{1F1E8}\u{1F1E6}", hr: "\u{1F1ED}\u{1F1F7}", sk: "\u{1F1F8}\u{1F1F0}",
        sl: "\u{1F1F8}\u{1F1EE}", et: "\u{1F1EA}\u{1F1EA}", lv: "\u{1F1F1}\u{1F1FB}",
        lt: "\u{1F1F1}\u{1F1F9}", fa: "\u{1F1FA}\u{1F1E6}", ur: "\u{1F1FA}\u{1F1F3}",
        bn: "\u{1F1E7}\u{1F1E9}", ta: "\u{1F1F9}\u{1F1F0}", te: "\u{1F1F9}\u{1F1EA}",
      };

      function getFlag(code) {
        return flags[code] || "\u{1F310}";
      }

      function populateAddSelect() {
        addSelect.innerHTML = "";
        var langs = twpLang.getLanguageList();
        var entries = [];
        for (var code in langs) {
          entries.push([code, langs[code]]);
        }
        entries.sort(function (a, b) { return a[1].localeCompare(b[1]); });
        var currentLangs = twpConfig.get("targetLanguages") || [];
        var opt = document.createElement("option");
        opt.value = "";
        opt.textContent = "Select language...";
        addSelect.appendChild(opt);
        entries.forEach(function (entry) {
          if (currentLangs.indexOf(entry[0]) === -1) {
            var o = document.createElement("option");
            o.value = entry[0];
            o.textContent = entry[1];
            addSelect.appendChild(o);
          }
        });
      }

      function renderPills() {
        container.innerHTML = "";
        var currentLangs = twpConfig.get("targetLanguages") || [];
        var activeLang = twpConfig.get("targetLanguage");

        currentLangs.forEach(function (code) {
          var pill = document.createElement("button");
          pill.className = "service-pill" + (code === activeLang ? " active" : "");
          pill.textContent = getFlag(code) + " " + twpLang.codeToLanguage(code);
          pill.setAttribute("data-lang", code);
          pill.onclick = function () {
            var langs = twpConfig.get("targetLanguages") || [];
            var idx = langs.indexOf(code);
            if (idx > 0) {
              langs.splice(idx, 1);
              langs.unshift(code);
              twpConfig.set("targetLanguages", langs);
            }
            renderPills();
          };
          if (currentLangs.length > 1) {
            var removeBtn = document.createElement("span");
            removeBtn.className = "pill-remove";
            removeBtn.textContent = "\u00D7";
            removeBtn.onclick = function (e) {
              e.stopPropagation();
              var langs = twpConfig.get("targetLanguages") || [];
              var idx = langs.indexOf(code);
              if (idx !== -1 && langs.length > 1) {
                langs.splice(idx, 1);
                twpConfig.set("targetLanguages", langs);
                renderPills();
              }
            };
            pill.appendChild(removeBtn);
          }
          container.appendChild(pill);
        });

        var addPill = document.createElement("button");
        addPill.className = "service-pill";
        addPill.textContent = "+ Add";
        addPill.style.position = "relative";
        addPill.style.overflow = "visible";
        if (currentLangs.length >= 6) {
          addPill.disabled = true;
          addPill.style.opacity = "0.4";
          addPill.style.cursor = "not-allowed";
        } else {
          addPill.onclick = function () {
            populateAddSelect();
            addSelect.classList.toggle("hidden");
            if (!addSelect.classList.contains("hidden")) {
              addSelect.style.position = "absolute";
              addSelect.style.bottom = "auto";
              addSelect.style.top = "100%";
              addSelect.style.left = "0";
              addSelect.style.zIndex = "1000";
              addSelect.style.width = "200px";
              addSelect.focus();
            }
          };
        }
        container.appendChild(addPill);
      }

      addSelect.onchange = function () {
        var code = addSelect.value;
        if (!code) return;
        var langs = twpConfig.get("targetLanguages") || [];
        if (langs.indexOf(code) === -1) {
          langs.push(code);
          twpConfig.set("targetLanguages", langs);
        }
        addSelect.classList.add("hidden");
        renderPills();
      };
      addSelect.onblur = function () {
        setTimeout(function () { addSelect.classList.add("hidden"); }, 200);
      };

      renderPills();
    })();

    function updateDarkMode() {
      darkMode.initFromConfig(twpConfig.get("darkMode"));
    }
    updateDarkMode();

    // target languages
    $("#selectUiLanguage").value =
      temporaryUiLanguage || twpConfig.get("uiLanguage");
    $("#selectUiLanguage").onchange = (e) => {
      if (e.target.value === "default") {
        twpConfig.set("uiLanguage", "default");
      } else {
        if (sessionStorage !== null) {
          sessionStorage.setItem("temporaryUiLanguage", e.target.value);
        } else {
          return;
        }
      }
      location.reload();
    };
    $("#btnApplyUiLanguage").onclick = () => {
      if (temporaryUiLanguage) {
        twpConfig.set(
          "uiLanguage",
          temporaryUiLanguage === "default"
            ? "default"
            : twpLang.fixUILanguageCode(temporaryUiLanguage)
        );
        // timeout prevents: TypeError: NetworkError when attempting to fetch resource.
        setTimeout(() => location.reload(), 100);
      } else if (sessionStorage === null) {
        const lang = $("#selectUiLanguage").value;
        twpConfig.set(
          "uiLanguage",
          lang === "default" ? "default" : twpLang.fixUILanguageCode(lang)
        );
        // timeout prevents: TypeError: NetworkError when attempting to fetch resource.
        setTimeout(() => location.reload(), 100);
      }
    };

    const targetLanguage = twpConfig.get("targetLanguage");
    $("#selectTargetLanguage").value = targetLanguage;
    $("#selectTargetLanguage").onchange = (e) => {
      twpConfig.setTargetLanguage(e.target.value);
      location.reload();
    };

    const targetLanguageTextTranslation = twpConfig.get(
      "targetLanguageTextTranslation"
    );
    $("#selectTargetLanguageForText").value = targetLanguageTextTranslation;
    $("#selectTargetLanguageForText").onchange = (e) => {
      twpConfig.setTargetLanguage(e.target.value, true);
      twpConfig.setTargetLanguage(targetLanguage, false);
      location.reload();
    };

    const targetLanguages = twpConfig.get("targetLanguages");

    $("#favoriteLanguage1").value = targetLanguages[0];
    $("#favoriteLanguage2").value = targetLanguages[1];
    $("#favoriteLanguage3").value = targetLanguages[2];

    $("#favoriteLanguage1").onchange = (e) => {
      targetLanguages[0] = e.target.value;
      twpConfig.set("targetLanguages", targetLanguages);
      if (targetLanguages.indexOf(twpConfig.get("targetLanguage")) == -1) {
        twpConfig.set("targetLanguage", targetLanguages[0]);
      }
      if (
        targetLanguages.indexOf(
          twpConfig.get("targetLanguageTextTranslation")
        ) == -1
      ) {
        twpConfig.set("targetLanguageTextTranslation", targetLanguages[0]);
      }
      location.reload();
    };

    $("#favoriteLanguage2").onchange = (e) => {
      targetLanguages[1] = e.target.value;
      twpConfig.set("targetLanguages", targetLanguages);
      if (targetLanguages.indexOf(twpConfig.get("targetLanguage")) == -1) {
        twpConfig.set("targetLanguage", targetLanguages[0]);
      }
      if (
        targetLanguages.indexOf(
          twpConfig.get("targetLanguageTextTranslation")
        ) == -1
      ) {
        twpConfig.set("targetLanguageTextTranslation", targetLanguages[0]);
      }
      location.reload();
    };

    $("#favoriteLanguage3").onchange = (e) => {
      targetLanguages[2] = e.target.value;
      twpConfig.set("targetLanguages", targetLanguages);
      if (targetLanguages.indexOf(twpConfig.get("targetLanguage")) == -1) {
        twpConfig.set("targetLanguage", targetLanguages[0]);
      }
      if (
        targetLanguages.indexOf(
          twpConfig.get("targetLanguageTextTranslation")
        ) == -1
      ) {
        twpConfig.set("targetLanguageTextTranslation", targetLanguages[0]);
      }
      location.reload();
    };

    // Never translate these languages

    function createNodeToNeverTranslateLangsList(langCode, langName) {
      const li = document.createElement("li");
      li.setAttribute("class", "list-item");
      li.value = langCode;
      li.textContent = langName;

      const close = document.createElement("span");
      close.setAttribute("class", "list-close");
      close.innerHTML = "&times;";

      close.onclick = (e) => {
        e.preventDefault();
        twpConfig.removeLangFromNeverTranslate(langCode);
        li.remove();
      };

      li.appendChild(close);
      return li;
    }

    const neverTranslateLangs = twpConfig.get("neverTranslateLangs");
    neverTranslateLangs.sort((a, b) => a.localeCompare(b));
    neverTranslateLangs.forEach((langCode) => {
      const langName = twpLang.codeToLanguage(langCode);
      const li = createNodeToNeverTranslateLangsList(langCode, langName);
      $("#neverTranslateLangs").appendChild(li);
    });

    $("#addToNeverTranslateLangs").onchange = (e) => {
      const langCode = e.target.value;
      const langName = twpLang.codeToLanguage(langCode);
      const li = createNodeToNeverTranslateLangsList(langCode, langName);
      $("#neverTranslateLangs").appendChild(li);

      twpConfig.addLangToNeverTranslate(langCode);
    };

    // Always translate these languages

    function createNodeToAlwaysTranslateLangsList(langCode, langName) {
      const li = document.createElement("li");
      li.setAttribute("class", "list-item");
      li.value = langCode;
      li.textContent = langName;

      const close = document.createElement("span");
      close.setAttribute("class", "list-close");
      close.innerHTML = "&times;";

      close.onclick = (e) => {
        e.preventDefault();
        twpConfig.removeLangFromAlwaysTranslate(langCode);
        li.remove();
      };

      li.appendChild(close);
      return li;
    }

    const alwaysTranslateLangs = twpConfig.get("alwaysTranslateLangs");
    alwaysTranslateLangs.sort((a, b) => a.localeCompare(b));
    alwaysTranslateLangs.forEach((langCode) => {
      const langName = twpLang.codeToLanguage(langCode);
      const li = createNodeToAlwaysTranslateLangsList(langCode, langName);
      $("#alwaysTranslateLangs").appendChild(li);
    });

    $("#addToAlwaysTranslateLangs").onchange = (e) => {
      const langCode = e.target.value;
      const langName = twpLang.codeToLanguage(langCode);
      const li = createNodeToAlwaysTranslateLangsList(langCode, langName);
      $("#alwaysTranslateLangs").appendChild(li);

      twpConfig.addLangToAlwaysTranslate(langCode);
    };

    // langsToTranslateWhenHovering

    function createNodeToLangsToTranslateWhenHoveringList(langCode, langName) {
      const li = document.createElement("li");
      li.setAttribute("class", "list-item");
      li.value = langCode;
      li.textContent = langName;

      const close = document.createElement("span");
      close.setAttribute("class", "list-close");
      close.innerHTML = "&times;";

      close.onclick = (e) => {
        e.preventDefault();
        twpConfig.removeLangFromTranslateWhenHovering(langCode);
        li.remove();
      };

      li.appendChild(close);
      return li;
    }

    const langsToTranslateWhenHovering = twpConfig.get(
      "langsToTranslateWhenHovering"
    );
    langsToTranslateWhenHovering.sort((a, b) => a.localeCompare(b));
    langsToTranslateWhenHovering.forEach((langCode) => {
      const langName = twpLang.codeToLanguage(langCode);
      const li = createNodeToLangsToTranslateWhenHoveringList(
        langCode,
        langName
      );
      $("#langsToTranslateWhenHovering").appendChild(li);
    });

    $("#addLangToTranslateWhenHovering").onchange = (e) => {
      const langCode = e.target.value;
      const langName = twpLang.codeToLanguage(langCode);
      const li = createNodeToLangsToTranslateWhenHoveringList(
        langCode,
        langName
      );
      $("#langsToTranslateWhenHovering").appendChild(li);

      twpConfig.addLangToTranslateWhenHovering(langCode);
    };

    // Always translate these Sites

    function createNodeToAlwaysTranslateSitesList(hostname) {
      const li = document.createElement("li");
      li.setAttribute("class", "list-item");
      li.value = hostname;
      li.textContent = hostname;

      const close = document.createElement("span");
      close.setAttribute("class", "list-close");
      close.innerHTML = "&times;";

      close.onclick = (e) => {
        e.preventDefault();
        twpConfig.removeSiteFromAlwaysTranslate(hostname);
        li.remove();
      };

      li.appendChild(close);
      return li;
    }

    const alwaysTranslateSites = twpConfig.get("alwaysTranslateSites");
    alwaysTranslateSites.sort((a, b) => a.localeCompare(b));
    alwaysTranslateSites.forEach((hostname) => {
      const li = createNodeToAlwaysTranslateSitesList(hostname);
      $("#alwaysTranslateSites").appendChild(li);
    });

    $("#addToAlwaysTranslateSites").onclick = (e) => {
      const hostname = prompt("Enter the site hostname", "www.site.com");
      if (!hostname) return;

      const li = createNodeToAlwaysTranslateSitesList(hostname);
      $("#alwaysTranslateSites").appendChild(li);

      twpConfig.addSiteToAlwaysTranslate(hostname);
    };

    // Never translate these Sites

    function createNodeToNeverTranslateSitesList(hostname) {
      const li = document.createElement("li");
      li.setAttribute("class", "list-item");
      li.value = hostname;
      li.textContent = hostname;

      const close = document.createElement("span");
      close.setAttribute("class", "list-close");
      close.innerHTML = "&times;";

      close.onclick = (e) => {
        e.preventDefault();
        twpConfig.removeSiteFromNeverTranslate(hostname);
        li.remove();
      };

      li.appendChild(close);
      return li;
    }

    const neverTranslateSites = twpConfig.get("neverTranslateSites");
    neverTranslateSites.sort((a, b) => a.localeCompare(b));
    neverTranslateSites.forEach((hostname) => {
      const li = createNodeToNeverTranslateSitesList(hostname);
      $("#neverTranslateSites").appendChild(li);
    });

    $("#addToNeverTranslateSites").onclick = (e) => {
      const hostname = prompt("Enter the site hostname", "www.site.com");
      if (!hostname) return;

      const li = createNodeToNeverTranslateSitesList(hostname);
      $("#neverTranslateSites").appendChild(li);

      twpConfig.addSiteToNeverTranslate(hostname);
    };

    function createcustomDictionary(keyWord, customValue) {
      const li = document.createElement("li");
      li.setAttribute("class", "list-item");
      li.value = keyWord;
      if (customValue !== "") {
        li.textContent = keyWord + " ------------------- " + customValue;
      } else {
        li.textContent = keyWord;
      }
      const close = document.createElement("span");
      close.setAttribute("class", "list-close");
      close.innerHTML = "&times;";

      close.onclick = (e) => {
        e.preventDefault();
        twpConfig.removeKeyWordFromcustomDictionary(keyWord);
        li.remove();
      };
      li.appendChild(close);
      return li;
    }

    let customDictionary = twpConfig.get("customDictionary");
    customDictionary = new Map(
      [...customDictionary.entries()].sort((a, b) =>
        String(a[0]).localeCompare(String(b[0]))
      )
    );
    customDictionary.forEach(function (customValue, keyWord) {
      const li = createcustomDictionary(keyWord, customValue);
      $("#customDictionary").appendChild(li);
    });

    $("#addToCustomDictionary").onclick = (e) => {
      let keyWord = prompt("Enter the keyWord, Minimum two letters ", "");
      if (!keyWord || keyWord.length < 2) return;
      keyWord = keyWord.trim().toLowerCase();
      let customValue = prompt(
        "(Optional)\nYou can enter a value to replace it , or fill in nothing.",
        ""
      );
      if (!customValue) customValue = "";
      customValue = customValue.trim();
      const li = createcustomDictionary(keyWord, customValue);
      $("#customDictionary").appendChild(li);
      twpConfig.addKeyWordTocustomDictionary(keyWord, customValue);
    };

    // sitesToTranslateWhenHovering

    function createNodeToSitesToTranslateWhenHoveringList(hostname) {
      const li = document.createElement("li");
      li.setAttribute("class", "list-item");
      li.value = hostname;
      li.textContent = hostname;

      const close = document.createElement("span");
      close.setAttribute("class", "list-close");
      close.innerHTML = "&times;";

      close.onclick = (e) => {
        e.preventDefault();
        twpConfig.removeSiteFromTranslateWhenHovering(hostname);
        li.remove();
      };

      li.appendChild(close);
      return li;
    }

    const sitesToTranslateWhenHovering = twpConfig.get(
      "sitesToTranslateWhenHovering"
    );
    sitesToTranslateWhenHovering.sort((a, b) => a.localeCompare(b));
    sitesToTranslateWhenHovering.forEach((hostname) => {
      const li = createNodeToSitesToTranslateWhenHoveringList(hostname);
      $("#sitesToTranslateWhenHovering").appendChild(li);
    });

    $("#addSiteToTranslateWhenHovering").onclick = (e) => {
      const hostname = prompt("Enter the site hostname", "www.site.com");
      if (!hostname) return;

      const li = createNodeToSitesToTranslateWhenHoveringList(hostname);
      $("#sitesToTranslateWhenHovering").appendChild(li);

      twpConfig.addSiteToTranslateWhenHovering(hostname);
    };

    // translations options
    $("#pageTranslatorService").onchange = (e) => {
      twpConfig.set("pageTranslatorService", e.target.value);
    };
    $("#pageTranslatorService").value = twpConfig.get("pageTranslatorService");

    $("#textTranslatorService").onchange = (e) => {
      twpConfig.set("textTranslatorService", e.target.value);
    };
    $("#textTranslatorService").value = twpConfig.get("textTranslatorService");

    $("#textToSpeechService").onchange = (e) => {
      twpConfig.set("textToSpeechService", e.target.value);
    };
    $("#textToSpeechService").value = twpConfig.get("textToSpeechService");

    $("#ttsSpeed").oninput = (e) => {
      twpConfig.set("ttsSpeed", e.target.value);
      $("#displayTtsSpeed").textContent = e.target.value;
    };
    $("#ttsSpeed").value = twpConfig.get("ttsSpeed");
    $("#displayTtsSpeed").textContent = twpConfig.get("ttsSpeed");

    $("#ttsVolume").oninput = (e) => {
      twpConfig.set("ttsVolume", e.target.value);
      $("#displayTtsVolume").textContent = e.target.value;
    };
    $("#ttsVolume").value = twpConfig.get("ttsVolume");
    $("#displayTtsVolume").textContent = twpConfig.get("ttsVolume");

    $("#showOriginalTextWhenHovering").onchange = (e) => {
      twpConfig.set("showOriginalTextWhenHovering", e.target.value);
    };
    $("#showOriginalTextWhenHovering").value = twpConfig.get(
      "showOriginalTextWhenHovering"
    );

    $("#translateTag_pre").onchange = (e) => {
      twpConfig.set("translateTag_pre", e.target.value);
    };
    $("#translateTag_pre").value = twpConfig.get("translateTag_pre");

    $("#enableIframePageTranslation").onchange = (e) => {
      twpConfig.set("enableIframePageTranslation", e.target.value);
    };
    $("#enableIframePageTranslation").value = twpConfig.get(
      "enableIframePageTranslation"
    );

    $("#dontSortResults").onchange = (e) => {
      twpConfig.set("dontSortResults", e.target.value);
    };
    $("#dontSortResults").value = twpConfig.get("dontSortResults");

    $("#translateDynamicallyCreatedContent").onchange = (e) => {
      twpConfig.set("translateDynamicallyCreatedContent", e.target.value);
    };
    $("#translateDynamicallyCreatedContent").value = twpConfig.get(
      "translateDynamicallyCreatedContent"
    );

    $("#autoTranslateWhenClickingALink").onchange = (e) => {
      if (e.target.value == "yes") {
        chrome.permissions.request(
          {
            permissions: ["webNavigation"],
          },
          (granted) => {
            if (granted) {
              twpConfig.set("autoTranslateWhenClickingALink", "yes");
            } else {
              twpConfig.set("autoTranslateWhenClickingALink", "no");
              e.target.value = "no";
            }
          }
        );
      } else {
        twpConfig.set("autoTranslateWhenClickingALink", "no");
        chrome.permissions.remove({
          permissions: ["webNavigation"],
        });
      }
    };
    $("#autoTranslateWhenClickingALink").value = twpConfig.get(
      "autoTranslateWhenClickingALink"
    );

    function enableOrDisableTranslateSelectedAdvancedOptions(value) {
      if (value === "no") {
        document
          .querySelectorAll("#translateSelectedAdvancedOptions input")
          .forEach((input) => {
            input.setAttribute("disabled", "");
          });
      } else {
        document
          .querySelectorAll("#translateSelectedAdvancedOptions input")
          .forEach((input) => {
            input.removeAttribute("disabled");
          });
      }
    }

    $("#showTranslateSelectedButton").onchange = (e) => {
      twpConfig.set("showTranslateSelectedButton", e.target.value);
      enableOrDisableTranslateSelectedAdvancedOptions(e.target.value);
    };
    $("#showTranslateSelectedButton").value = twpConfig.get(
      "showTranslateSelectedButton"
    );
    enableOrDisableTranslateSelectedAdvancedOptions(
      twpConfig.get("showTranslateSelectedButton")
    );

    $("#dontShowIfIsNotValidText").onchange = (e) => {
      twpConfig.set(
        "dontShowIfIsNotValidText",
        e.target.checked ? "yes" : "no"
      );
    };
    $("#dontShowIfIsNotValidText").checked =
      twpConfig.get("dontShowIfIsNotValidText") === "yes" ? true : false;

    $("#dontShowIfPageLangIsTargetLang").onchange = (e) => {
      twpConfig.set(
        "dontShowIfPageLangIsTargetLang",
        e.target.checked ? "yes" : "no"
      );
    };
    $("#dontShowIfPageLangIsTargetLang").checked =
      twpConfig.get("dontShowIfPageLangIsTargetLang") === "yes" ? true : false;

    $("#dontShowIfPageLangIsUnknown").onchange = (e) => {
      twpConfig.set(
        "dontShowIfPageLangIsUnknown",
        e.target.checked ? "yes" : "no"
      );
    };
    $("#dontShowIfPageLangIsUnknown").checked =
      twpConfig.get("dontShowIfPageLangIsUnknown") === "yes" ? true : false;

    $("#dontShowIfSelectedTextIsTargetLang").onchange = (e) => {
      twpConfig.set(
        "dontShowIfSelectedTextIsTargetLang",
        e.target.checked ? "yes" : "no"
      );
    };
    $("#dontShowIfSelectedTextIsTargetLang").checked =
      twpConfig.get("dontShowIfSelectedTextIsTargetLang") === "yes"
        ? true
        : false;

    $("#dontShowIfSelectedTextIsUnknown").onchange = (e) => {
      twpConfig.set(
        "dontShowIfSelectedTextIsUnknown",
        e.target.checked ? "yes" : "no"
      );
    };
    $("#dontShowIfSelectedTextIsUnknown").checked =
      twpConfig.get("dontShowIfSelectedTextIsUnknown") === "yes" ? true : false;

    // style options
    $("#darkMode").onchange = (e) => {
      twpConfig.set("darkMode", e.target.value);
      updateDarkMode();
    };
    $("#darkMode").value = twpConfig.get("darkMode");

    // Theme pills connection
    const themeValueMap = { light: "no", dark: "yes", system: "auto" };
    document.querySelectorAll("[data-theme-value]").forEach((btn) => {
      btn.onclick = (e) => {
        const theme = e.currentTarget.getAttribute("data-theme-value");
        const value = themeValueMap[theme];
        $("#darkMode").value = value;
        twpConfig.set("darkMode", value);
        updateDarkMode();
        updateThemePillsActive();
      };
    });
    function updateThemePillsActive() {
      const current = twpConfig.get("darkMode");
      document.querySelectorAll("[data-theme-value]").forEach((btn) => {
        const theme = btn.getAttribute("data-theme-value");
        btn.classList.toggle("active", themeValueMap[theme] === current);
      });
    }
    updateThemePillsActive();

    // Sidebar dark mode toggle
    if ($("#darkModeToggle")) {
      $("#darkModeToggle").checked = twpConfig.get("darkMode") === "yes";
      $("#darkModeToggle").onchange = (e) => {
        const value = e.target.checked ? "yes" : "no";
        $("#darkMode").value = value;
        twpConfig.set("darkMode", value);
        updateDarkMode();
        updateThemePillsActive();
      };
    }

    // Hotkey toggles
    {
      const hotkeys = [
        { id: "hotkeyToggleTranslation", config: "hotkeyToggleTranslation" },
        { id: "hotkeyTranslateSelectedText", config: "hotkeyTranslateSelectedText" },
        { id: "hotkeySwapService", config: "hotkeySwapService" },
        { id: "hotkeyShowOriginal", config: "hotkeyShowOriginal" },
      ];
      hotkeys.forEach(({ id, config }) => {
        const el = document.getElementById(id);
        if (el) {
          el.checked = twpConfig.get(config) === "yes";
          el.onchange = (e) => {
            twpConfig.set(config, e.target.checked ? "yes" : "no");
          };
        }
      });
      const openShortcuts = document.getElementById("openChromeShortcuts");
      if (openShortcuts) {
        openShortcuts.onclick = (e) => {
          e.preventDefault();
          tabsCreate("chrome://extensions/shortcuts");
        };
      }
    }

    // hotkeys options
    function escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
    $('[data-i18n="lblTranslateSelectedWhenPressTwice"]').innerHTML = $(
      '[data-i18n="lblTranslateSelectedWhenPressTwice"]'
    ).innerHTML.replace("[Ctrl]", "<kbd>Ctrl</kbd>");
    $('[data-i18n="lblTranslateTextOverMouseWhenPressTwice"]').innerHTML = $(
      '[data-i18n="lblTranslateTextOverMouseWhenPressTwice"]'
    ).innerHTML.replace("[Ctrl]", "<kbd>Ctrl</kbd>");

    $("#openNativeShortcutManager").onclick = (e) => {
      tabsCreate("chrome://extensions/shortcuts");
    };

    $("#translateSelectedWhenPressTwice").onclick = (e) => {
      twpConfig.set(
        "translateSelectedWhenPressTwice",
        e.target.checked ? "yes" : "no"
      );
    };
    $("#translateSelectedWhenPressTwice").checked =
      twpConfig.get("translateSelectedWhenPressTwice") === "yes";

    $("#translateTextOverMouseWhenPressTwice").onclick = (e) => {
      twpConfig.set(
        "translateTextOverMouseWhenPressTwice",
        e.target.checked ? "yes" : "no"
      );
    };
    $("#translateTextOverMouseWhenPressTwice").checked =
      twpConfig.get("translateTextOverMouseWhenPressTwice") === "yes";

    const defaultShortcuts = {};
    for (const name of Object.keys(
      chrome.runtime.getManifest().commands || {}
    )) {
      const info = chrome.runtime.getManifest().commands[name];
      if (info.suggested_key && info.suggested_key.default) {
        defaultShortcuts[name] = info.suggested_key.default;
      } else {
        defaultShortcuts[name] = "";
      }
    }

    function translateHotkeysDescription(hotkeyname) {
      const descriptions = [
        {
          key: "hotkey-toggle-translation",
          i18n: "lblSwitchTranslatedAndOriginal",
        },
        {
          key: "hotkey-translate-selected-text",
          i18n: "msgTranslateSelectedText",
        },
        {
          key: "hotkey-swap-page-translation-service",
          i18n: "swapTranslationService",
        },
        {
          key: "hotkey-show-original",
          i18n: "lblRestorePageToOriginal",
        },
        {
          key: "hotkey-translate-page-1",
          i18n: "lblTranslatePageToTargetLanguage",
        },
        {
          key: "hotkey-translate-page-2",
          i18n: "lblTranslatePageToTargetLanguage",
        },
        {
          key: "hotkey-translate-page-3",
          i18n: "lblTranslatePageToTargetLanguage",
        },
        {
          key: "hotkey-hot-translate-selected-text",
          i18n: "lblHotTranslatedSelectedText",
        },
      ];

      const info = descriptions.find((d) => d.key === hotkeyname);
      if (!info) return "";
      let desc = twpI18n.getMessage(info.i18n);
      if (hotkeyname.startsWith("hotkey-translate-page-")) {
        desc += " " + hotkeyname.slice(-1);
      }
      return desc;
    }

    function addHotkey(hotkeyname, description) {
      if (hotkeyname === "_execute_browser_action" && !description) {
        description = "Enable the extension";
      }
      description = translateHotkeysDescription(hotkeyname) || description;

      const enterShortcut =
        twpI18n.getMessage("enterShortcut") || "Enter shortcut";

      function escapeHtml(unsafe) {
        return unsafe
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#039;");
      }
      description = escapeHtml(description);

      const li = document.createElement("li");
      li.classList.add("shortcut-row");
      li.setAttribute("id", hotkeyname);
      li.innerHTML = `
        <div>${description}</div>
        <div class="shortcut-input-options">
            <div style="position: relative;">
                <input name="input" class="shortcut-input" type="text" readonly placeholder="${enterShortcut}" data-i18n-placeholder="enterShortcut">
                <p name="error" class="shortcut-error" style="position: absolute;"></p>
            </div>
            <div class="shortcut-button" name="removeKey"><i class="gg-trash"></i></div>
            <div class="shortcut-button" name="resetKey"><i class="gg-sync"></i></div>
        </div>  
        `;
      $("#KeyboardShortcuts").appendChild(li);

      const input = li.querySelector(`[name="input"]`);
      const error = li.querySelector(`[name="error"]`);
      const removeKey = li.querySelector(`[name="removeKey"]`);
      const resetKey = li.querySelector(`[name="resetKey"]`);

      input.value = twpConfig.get("hotkeys")[hotkeyname];
      if (input.value) {
        resetKey.style.display = "none";
      } else {
        removeKey.style.display = "none";
      }

      function setError(errorname) {
        const text = twpI18n.getMessage("hotkeyError_" + errorname);
        switch (errorname) {
          case "ctrlOrAlt":
            error.textContent = text ? text : "Include Ctrl or Alt";
            break;
          case "letter":
            error.textContent = text ? text : "Type a letter";
            break;
          case "invalid":
            error.textContent = text ? text : "Invalid combination";
            break;
          default:
            error.textContent = "";
            break;
        }
      }

      function getKeyString(e) {
        let result = "";
        if (e.ctrlKey) {
          result += "Ctrl+";
        }
        if (e.altKey) {
          result += "Alt+";
        }
        if (e.shiftKey) {
          result += "Shift+";
        }
        if (e.code.match(/Key([A-Z])/)) {
          result += e.code.match(/Key([A-Z])/)[1];
        } else if (e.code.match(/Digit([0-9])/)) {
          result += e.code.match(/Digit([0-9])/)[1];
        }

        return result;
      }

      function setShortcut(name, keystring) {
        const hotkeys = twpConfig.get("hotkeys");
        hotkeys[hotkeyname] = keystring;
        twpConfig.set("hotkeys", hotkeys);
        browser.commands.update({
          name: name,
          shortcut: keystring,
        });
      }

      function onkeychange(e) {
        input.value = getKeyString(e);

        if (e.Key == "Tab") {
          return;
        }
        if (e.key == "Escape") {
          input.blur();
          return;
        }
        if (e.key == "Backspace" || e.key == "Delete") {
          setShortcut(hotkeyname, getKeyString(e));
          input.blur();
          return;
        }
        if (!e.ctrlKey && !e.altKey) {
          setError("ctrlOrAlt");
          return;
        }
        if (e.ctrlKey && e.altKey && e.shiftKey) {
          setError("invalid");
          return;
        }
        e.preventDefault();
        if (!e.code.match(/Key([A-Z])/) && !e.code.match(/Digit([0-9])/)) {
          setError("letter");
          return;
        }

        setShortcut(hotkeyname, getKeyString(e));
        input.blur();

        setError("none");
      }

      input.onkeydown = (e) => onkeychange(e);
      input.onkeyup = (e) => onkeychange(e);

      input.onfocus = (e) => {
        input.value = "";
        setError("");
      };

      input.onblur = (e) => {
        input.value = twpConfig.get("hotkeys")[hotkeyname];
        setError("");
      };

      removeKey.onclick = (e) => {
        input.value = "";
        setShortcut(hotkeyname, "");

        removeKey.style.display = "none";
        resetKey.style.display = "block";
      };

      resetKey.onclick = (e) => {
        input.value = defaultShortcuts[hotkeyname];
        setShortcut(hotkeyname, defaultShortcuts[hotkeyname]);

        removeKey.style.display = "block";
        resetKey.style.display = "none";
      };

      //*
      if (typeof browser === "undefined") {
        input.setAttribute("disabled", "");
        resetKey.style.display = "none";
        removeKey.style.display = "none";
      } else {
        $("#openNativeShortcutManager").style.display = "none";
      }
      // */
    }

    if (typeof chrome.commands !== "undefined") {
      chrome.commands.getAll((results) => {
        for (const result of results) {
          addHotkey(result.name, result.description);
        }
      });
    }

    // privacy options
    $("#useAlternativeService").oninput = (e) => {
      twpConfig.set("useAlternativeService", e.target.value);
    };
    $("#useAlternativeService").value = twpConfig.get("useAlternativeService");

    {
      if (platformInfo.isMobile.any) {
        $("#btnEnableDeepL").setAttribute("disabled", "");
      }

      const updateServiceSelector = (enabledServices) => {
        document
          .querySelectorAll("#pageTranslatorService option")
          .forEach((option) => option.setAttribute("hidden", ""));
        document
          .querySelectorAll("#textTranslatorService option")
          .forEach((option) => option.setAttribute("hidden", ""));
        enabledServices.forEach((svName) => {
          let option;
          option = $(`#pageTranslatorService option[value="${svName}"]`);
          if (option) {
            option.removeAttribute("hidden");
          }
          option = $(`#textTranslatorService option[value="${svName}"]`);
          if (option) {
            option.removeAttribute("hidden");
          }
        });
      };

      const servicesInfo = [
        { selector: "#btnEnableGoogle", svName: "google" },
        { selector: "#btnEnableBing", svName: "bing" },
        { selector: "#btnEnableYandex", svName: "yandex" },
        { selector: "#btnEnableDeepL", svName: "deepl" },
      ];

      servicesInfo.forEach((svInfo) => {
        $(svInfo.selector).oninput = (e) => {
          const enabledServices = [];
          let enabledCount = 0;
          servicesInfo.forEach((_svInfo) => {
            if ($(_svInfo.selector).checked) {
              enabledCount++;
            }
          });
          if (
            enabledCount === 0 ||
            (enabledCount === 1 && $("#btnEnableDeepL").checked)
          ) {
            if (e.target === $("#btnEnableGoogle")) {
              $("#btnEnableBing").checked = true;
            } else {
              $("#btnEnableGoogle").checked = true;
            }
          }
          servicesInfo.forEach((_svInfo) => {
            if ($(_svInfo.selector).checked) {
              enabledServices.push(_svInfo.svName);
            }
          });

          if (
            !enabledServices.includes(twpConfig.get("textTranslatorService"))
          ) {
            twpConfig.set("textTranslatorService", enabledServices[0]);
          }
          if (
            !enabledServices.includes(twpConfig.get("pageTranslatorService"))
          ) {
            twpConfig.set("pageTranslatorService", enabledServices[0]);
          }

          const pageTranslationServices = ["google", "bing", "yandex"];
          chrome.runtime.sendMessage(
            {
              action: "restorePagesWithServiceNames",
              serviceNames: pageTranslationServices.filter(
                (svName) => !enabledServices.includes(svName)
              ),
              newServiceName: twpConfig.get("pageTranslatorService"),
            },
            checkedLastError
          );

          twpConfig.set("enabledServices", enabledServices);

          $("#pageTranslatorService").value = twpConfig.get(
            "pageTranslatorService"
          );
          $("#textTranslatorService").value = twpConfig.get(
            "textTranslatorService"
          );
          updateServiceSelector(enabledServices);
        };
        $(svInfo.selector).checked =
          twpConfig.get("enabledServices").indexOf(svInfo.svName) === -1
            ? false
            : true;

        updateServiceSelector(twpConfig.get("enabledServices"));
      });
    }

    // storage options
    $("#deleteTranslationCache").onclick = (e) => {
      if (confirm(twpI18n.getMessage("doYouWantToDeleteTranslationCache"))) {
        chrome.runtime.sendMessage(
          {
            action: "deleteTranslationCache",
            reload: true,
          },
          checkedLastError
        );
      }
    };

    $("#backupToFile").onclick = (e) => {
      const configJSON = twpConfig.export();

      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(configJSON)
      );
      element.setAttribute(
        "download",
        "twp-backup_" +
          new Date()
            .toISOString()
            .replace(/T/, "_")
            .replace(/\..+/, "")
            .replace(/\:/g, ".") +
          ".txt"
      );

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    };
    $("#restoreFromFile").onclick = (e) => {
      const element = document.createElement("input");
      element.setAttribute("type", "file");
      element.setAttribute("accept", "text/plain");

      element.style.display = "none";
      document.body.appendChild(element);

      element.oninput = (e) => {
        const input = e.target;

        const reader = new FileReader();
        reader.onload = function () {
          try {
            if (confirm(twpI18n.getMessage("doYouWantOverwriteAllSettings"))) {
              twpConfig.import(reader.result);
            }
          } catch (e) {
            alert(twpI18n.getMessage("fileIsCorrupted"));
            console.error(e);
          }
        };

        reader.readAsText(input.files[0]);
      };

      element.click();

      document.body.removeChild(element);
    };
    $("#resetToDefault").onclick = (e) => {
      if (confirm(twpI18n.getMessage("doYouWantRestoreSettings"))) {
        twpConfig.restoreToDefault();
      }
    };

    // others options
    $("#whenShowMobilePopup").onchange = (e) => {
      twpConfig.set("whenShowMobilePopup", e.target.value);
    };
    $("#whenShowMobilePopup").value = twpConfig.get("whenShowMobilePopup");

    $("#showTranslatePageContextMenu").onchange = (e) => {
      twpConfig.set("showTranslatePageContextMenu", e.target.value);
    };
    $("#showTranslatePageContextMenu").value = twpConfig.get(
      "showTranslatePageContextMenu"
    );

    $("#showTranslateSelectedContextMenu").onchange = (e) => {
      twpConfig.set("showTranslateSelectedContextMenu", e.target.value);
    };
    $("#showTranslateSelectedContextMenu").value = twpConfig.get(
      "showTranslateSelectedContextMenu"
    );

    $("#showButtonInTheAddressBar").onchange = (e) => {
      twpConfig.set("showButtonInTheAddressBar", e.target.value);
    };
    $("#showButtonInTheAddressBar").value = twpConfig.get(
      "showButtonInTheAddressBar"
    );

    $("#translateClickingOnce").onchange = (e) => {
      twpConfig.set("translateClickingOnce", e.target.value);
    };
    $("#translateClickingOnce").value = twpConfig.get("translateClickingOnce");

    $("#btnCalculateStorage").style.display = "inline-block";
    $("#storageUsed").style.display = "none";
    $("#btnCalculateStorage").onclick = (e) => {
      $("#btnCalculateStorage").style.display = "none";

      chrome.runtime.sendMessage(
        {
          action: "getCacheSize",
        },
        (result) => {
          checkedLastError();

          $("#storageUsed").textContent = result;
          $("#storageUsed").style.display = "inline-block";
        }
      );
    };

    // experimental options
    $("#addLibre").onclick = () => {
      const libre = {
        name: "libre",
        url: $("#libreURL").value,
        apiKey: $("#libreKEY").value,
      };
      try {
        new URL(libre.url);
        if (libre.apiKey.length < 10) {
          throw new Error("Provides an API Key");
        }

        const customServices = twpConfig.get("customServices");

        const index = customServices.findIndex((cs) => cs.name === "libre");
        if (index !== -1) {
          customServices.splice(index, 1);
        }

        customServices.push(libre);
        twpConfig.set("customServices", customServices);
        chrome.runtime.sendMessage({ action: "createLibreService", libre });
      } catch (e) {
        alert(e);
      }
    };

    $("#removeLibre").onclick = () => {
      const customServices = twpConfig.get("customServices");
      const index = customServices.findIndex((cs) => cs.name === "libre");

      if (index !== -1) {
        customServices.splice(index, 1);
        twpConfig.set("customServices", customServices);
        chrome.runtime.sendMessage(
          { action: "removeLibreService" },
          checkedLastError
        );
      }

      if (twpConfig.get("textTranslatorService") === "libre") {
        twpConfig.set(
          "textTranslatorService",
          twpConfig.get("pageTranslatorService")
        );
      }

      $("#libreURL").value = "";
      $("#libreKEY").value = "";
    };

    const libre = twpConfig
      .get("customServices")
      .find((cs) => cs.name === "libre");
    if (libre) {
      $("#libreURL").value = libre.url;
      $("#libreKEY").value = libre.apiKey;
    }

    async function testDeepLFreeApiKey(apiKey) {
      return await new Promise((resolve) => {
        const xhttp = new XMLHttpRequest();
        xhttp.open("GET", "https://api-free.deepl.com/v2/usage");
        xhttp.responseType = "json";
        xhttp.setRequestHeader("Authorization", "DeepL-Auth-Key " + apiKey);
        xhttp.onload = () => {
          resolve(xhttp.response);
        };
        xhttp.send();
      });
    }

    $("#addDeepL").onclick = async () => {
      const deepl_freeapi = {
        name: "deepl_freeapi",
        apiKey: $("#deeplKEY").value,
      };
      try {
        const response = await testDeepLFreeApiKey(deepl_freeapi.apiKey);
        $("#deeplApiResponse").textContent = JSON.stringify(response);
        if (response) {
          const customServices = twpConfig.get("customServices");

          const index = customServices.findIndex(
            (cs) => cs.name === "deepl_freeapi"
          );
          if (index !== -1) {
            customServices.splice(index, 1);
          }

          customServices.push(deepl_freeapi);
          twpConfig.set("customServices", customServices);
          chrome.runtime.sendMessage({
            action: "createDeeplFreeApiService",
            deepl_freeapi,
          });
        } else {
          alert("Invalid API key");
        }
      } catch (e) {
        alert(e);
      }
    };

    $("#removeDeepL").onclick = () => {
      const customServices = twpConfig.get("customServices");
      const index = customServices.findIndex(
        (cs) => cs.name === "deepl_freeapi"
      );
      if (index !== -1) {
        customServices.splice(index, 1);
        twpConfig.set("customServices", customServices);
        chrome.runtime.sendMessage(
          { action: "removeDeeplFreeApiService" },
          checkedLastError
        );
      }
      $("#deeplKEY").value = "";
      $("#deeplApiResponse").textContent = "";
    };

    const deepl_freeapi = twpConfig
      .get("customServices")
      .find((cs) => cs.name === "deepl_freeapi");
    if (deepl_freeapi) {
      $("#deeplKEY").value = deepl_freeapi.apiKey;
      testDeepLFreeApiKey(deepl_freeapi.apiKey).then((response) => {
        $("#deeplApiResponse").textContent = JSON.stringify(response);
      });
    }

    // DeepL card (visible section)
    const deeplApiKeyInput = document.getElementById("deeplApiKeyInput");
    const deeplStatus = document.getElementById("deeplStatus");
    const toggleDeepLEnabled = document.getElementById("toggleDeepLEnabled");

    if (deeplApiKeyInput) {
      const saved = twpConfig.get("customServices") || [];
      const deeplSvc = saved.find((cs) => cs.name === "deepl_freeapi");
      if (deeplSvc) deeplApiKeyInput.value = deeplSvc.apiKey;

      document.getElementById("btnSaveDeepLKey").onclick = async () => {
        const key = deeplApiKeyInput.value.trim();
        if (!key) { deeplStatus.textContent = "Please enter an API key."; return; }
        try {
          const response = await testDeepLFreeApiKey(key);
          if (response) {
            const customServices = twpConfig.get("customServices");
            const idx = customServices.findIndex((cs) => cs.name === "deepl_freeapi");
            if (idx !== -1) customServices.splice(idx, 1);
            customServices.push({ name: "deepl_freeapi", apiKey: key });
            twpConfig.set("customServices", customServices);
            chrome.runtime.sendMessage({ action: "createDeeplFreeApiService", deepl_freeapi: { name: "deepl_freeapi", apiKey: key } });
            deeplStatus.textContent = "API key saved and verified.";
          } else {
            deeplStatus.textContent = "Invalid API key.";
          }
        } catch (e) {
          deeplStatus.textContent = "Error: " + e;
        }
      };

      document.getElementById("btnRemoveDeepLKey").onclick = () => {
        const customServices = twpConfig.get("customServices");
        const idx = customServices.findIndex((cs) => cs.name === "deepl_freeapi");
        if (idx !== -1) {
          customServices.splice(idx, 1);
          twpConfig.set("customServices", customServices);
          chrome.runtime.sendMessage({ action: "removeDeeplFreeApiService" }, checkedLastError);
        }
        deeplApiKeyInput.value = "";
        deeplStatus.textContent = "API key removed.";
      };
    }

    if (toggleDeepLEnabled) {
      const enabled = (twpConfig.get("enabledServices") || []).includes("deepl");
      toggleDeepLEnabled.checked = enabled;
      toggleDeepLEnabled.onchange = (e) => {
        const services = twpConfig.get("enabledServices") || [];
        if (e.target.checked && !services.includes("deepl")) {
          services.push("deepl");
        } else if (!e.target.checked) {
          const idx = services.indexOf("deepl");
          if (idx !== -1) services.splice(idx, 1);
        }
        twpConfig.set("enabledServices", services);
      };
    }

    $("#showMobilePopupOnDesktop").onchange = (e) => {
      twpConfig.set("showMobilePopupOnDesktop", e.target.value);
    };
    $("#showMobilePopupOnDesktop").value = twpConfig.get(
      "showMobilePopupOnDesktop"
    );

    $("#addPaddingToPage").onchange = (e) => {
      twpConfig.set("addPaddingToPage", e.target.value);
    };
    $("#addPaddingToPage").value = twpConfig.get("addPaddingToPage");

    // Target Language selects
    {
      const pageSelect = document.getElementById("selectPageTargetLang");
      const textSelect = document.getElementById("selectTextTargetLang");
      const targetCard = document.getElementById("targetLanguageCard");
      if (pageSelect && textSelect) {
        const langs = twpLang.getLanguageList();
        const entries = [];
        for (const code in langs) {
          entries.push([code, langs[code]]);
        }
        entries.sort((a, b) => a[1].localeCompare(b[1]));

        [pageSelect, textSelect].forEach((sel) => {
          entries.forEach(([code, name]) => {
            const opt = document.createElement("option");
            opt.value = code;
            opt.textContent = name;
            sel.appendChild(opt);
          });
        });

        pageSelect.value = twpConfig.get("targetLanguage") || "";
        textSelect.value = twpConfig.get("targetLanguageTextTranslation") || "";

        // highlight if not set
        if (!twpConfig.get("targetLanguage") && targetCard) {
          targetCard.classList.add("card-attention");
          const dismiss = () => targetCard.classList.remove("card-attention");
          pageSelect.addEventListener("change", dismiss, { once: true });
        }

        pageSelect.onchange = () => {
          twpConfig.set("targetLanguage", pageSelect.value);
        };
        textSelect.onchange = () => {
          twpConfig.set("targetLanguageTextTranslation", textSelect.value);
        };
      }
    }

    // Translation section toggles + site lists
    {
      const alwaysUlEl = document.getElementById("alwaysTranslateSitesNew");
      const alwaysAddBtn = document.getElementById("btnAddAlwaysTranslateSite");

      function renderAlwaysSites() {
        if (!alwaysUlEl) return;
        alwaysUlEl.innerHTML = "";
        const sites = twpConfig.get("alwaysTranslateSites") || [];
        sites.sort((a, b) => a.localeCompare(b));
        sites.forEach((hostname, i) => {
          const li = document.createElement("li");
          if (i >= 3) li.className = "site-hidden";
          li.textContent = hostname;
          const close = document.createElement("span");
          close.className = "list-close";
          close.innerHTML = "&times;";
          close.onclick = () => {
            twpConfig.removeSiteFromAlwaysTranslate(hostname);
            renderAlwaysSites();
          };
          li.appendChild(close);
          alwaysUlEl.appendChild(li);
        });
        if (sites.length === 0) {
          const empty = document.createElement("li");
          empty.textContent = "No sites added yet";
          empty.style.color = "var(--color-text-muted)";
          empty.style.fontStyle = "italic";
          alwaysUlEl.appendChild(empty);
        }
        // update count badge
        const countEl = alwaysUlEl.parentElement.querySelector(".site-list-count");
        if (countEl) countEl.textContent = sites.length;
        // show/hide toggle
        const existingToggle = alwaysUlEl.parentElement.querySelector(".site-list-toggle");
        if (existingToggle) existingToggle.remove();
        if (sites.length > 3) {
          const btn = document.createElement("button");
          btn.className = "site-list-toggle";
          btn.textContent = `+${sites.length - 3} more`;
          btn.onclick = () => {
            alwaysUlEl.classList.toggle("expanded");
            btn.textContent = alwaysUlEl.classList.contains("expanded") ? "Show less" : `+${sites.length - 3} more`;
          };
          alwaysUlEl.parentElement.appendChild(btn);
        }
      }
      renderAlwaysSites();

      if (alwaysAddBtn) {
        alwaysAddBtn.onclick = () => {
          const hostname = prompt("Enter site hostname:", "www.example.com");
          if (!hostname) return;
          twpConfig.addSiteToAlwaysTranslate(hostname);
          renderAlwaysSites();
        };
      }

      const neverUlEl = document.getElementById("neverTranslateSitesNew");
      const neverAddBtn = document.getElementById("btnAddNeverTranslateSite");

      function renderNeverSites() {
        if (!neverUlEl) return;
        neverUlEl.innerHTML = "";
        const sites = twpConfig.get("neverTranslateSites") || [];
        sites.sort((a, b) => a.localeCompare(b));
        sites.forEach((hostname, i) => {
          const li = document.createElement("li");
          if (i >= 3) li.className = "site-hidden";
          li.textContent = hostname;
          const close = document.createElement("span");
          close.className = "list-close";
          close.innerHTML = "&times;";
          close.onclick = () => {
            twpConfig.removeSiteFromNeverTranslate(hostname);
            renderNeverSites();
          };
          li.appendChild(close);
          neverUlEl.appendChild(li);
        });
        if (sites.length === 0) {
          const empty = document.createElement("li");
          empty.textContent = "No sites added yet";
          empty.style.color = "var(--color-text-muted)";
          empty.style.fontStyle = "italic";
          neverUlEl.appendChild(empty);
        }
        const countEl = neverUlEl.parentElement.querySelector(".site-list-count");
        if (countEl) countEl.textContent = sites.length;
        const existingToggle = neverUlEl.parentElement.querySelector(".site-list-toggle");
        if (existingToggle) existingToggle.remove();
        if (sites.length > 3) {
          const btn = document.createElement("button");
          btn.className = "site-list-toggle";
          btn.textContent = `+${sites.length - 3} more`;
          btn.onclick = () => {
            neverUlEl.classList.toggle("expanded");
            btn.textContent = neverUlEl.classList.contains("expanded") ? "Show less" : `+${sites.length - 3} more`;
          };
          neverUlEl.parentElement.appendChild(btn);
        }
      }
      renderNeverSites();

      if (neverAddBtn) {
        neverAddBtn.onclick = () => {
          const hostname = prompt("Enter site hostname:", "www.example.com");
          if (!hostname) return;
          twpConfig.addSiteToNeverTranslate(hostname);
          renderNeverSites();
        };
      }

      // Language Rules
      {
        const alwaysLangUl = document.getElementById("alwaysTranslateLangsNew");
        const neverLangUl = document.getElementById("neverTranslateLangsNew");
        const alwaysLangSelect = document.getElementById("addAlwaysTranslateLangSelect");
        const neverLangSelect = document.getElementById("addNeverTranslateLangSelect");

        function populateLangSelects() {
          [alwaysLangSelect, neverLangSelect].forEach((sel) => {
            if (!sel) return;
            sel.innerHTML = '<option value="">+ Add language</option>';
            const langs = twpLang.getLanguageList();
            const entries = [];
            for (const code in langs) {
              entries.push([code, langs[code]]);
            }
            entries.sort((a, b) => a[1].localeCompare(b[1]));
            entries.forEach(([code, name]) => {
              const opt = document.createElement("option");
              opt.value = code;
              opt.textContent = name;
              sel.appendChild(opt);
            });
          });
        }
        populateLangSelects();

        function renderAlwaysLangs() {
          if (!alwaysLangUl) return;
          alwaysLangUl.innerHTML = "";
          const langs = twpConfig.get("alwaysTranslateLangs") || [];
          const countEl = alwaysLangUl.parentElement.querySelector(".site-list-count");
          if (countEl) countEl.textContent = langs.length;
          if (langs.length === 0) {
            const empty = document.createElement("li");
            empty.textContent = "No languages added yet";
            empty.style.color = "var(--color-text-muted)";
            empty.style.fontStyle = "italic";
            alwaysLangUl.appendChild(empty);
            return;
          }
          langs.forEach((code, i) => {
            const li = document.createElement("li");
            if (i >= 3) li.className = "site-hidden";
            li.textContent = twpLang.codeToLanguage(code) + " (" + code + ")";
            const close = document.createElement("span");
            close.className = "list-close";
            close.innerHTML = "&times;";
            close.onclick = () => {
              twpConfig.removeLangFromAlwaysTranslate(code);
              renderAlwaysLangs();
            };
            li.appendChild(close);
            alwaysLangUl.appendChild(li);
          });
          if (langs.length > 3) {
            const btn = document.createElement("button");
            btn.className = "site-list-toggle";
            btn.textContent = `+${langs.length - 3} more`;
            btn.onclick = () => {
              alwaysLangUl.classList.toggle("expanded");
              btn.textContent = alwaysLangUl.classList.contains("expanded") ? "Show less" : `+${langs.length - 3} more`;
            };
            alwaysLangUl.parentElement.appendChild(btn);
          }
        }

        function renderNeverLangs() {
          if (!neverLangUl) return;
          neverLangUl.innerHTML = "";
          const langs = twpConfig.get("neverTranslateLangs") || [];
          const countEl = neverLangUl.parentElement.querySelector(".site-list-count");
          if (countEl) countEl.textContent = langs.length;
          if (langs.length === 0) {
            const empty = document.createElement("li");
            empty.textContent = "No languages added yet";
            empty.style.color = "var(--color-text-muted)";
            empty.style.fontStyle = "italic";
            neverLangUl.appendChild(empty);
            return;
          }
          langs.forEach((code, i) => {
            const li = document.createElement("li");
            if (i >= 3) li.className = "site-hidden";
            li.textContent = twpLang.codeToLanguage(code) + " (" + code + ")";
            const close = document.createElement("span");
            close.className = "list-close";
            close.innerHTML = "&times;";
            close.onclick = () => {
              twpConfig.removeLangFromNeverTranslate(code);
              renderNeverLangs();
            };
            li.appendChild(close);
            neverLangUl.appendChild(li);
          });
          if (langs.length > 3) {
            const btn = document.createElement("button");
            btn.className = "site-list-toggle";
            btn.textContent = `+${langs.length - 3} more`;
            btn.onclick = () => {
              neverLangUl.classList.toggle("expanded");
              btn.textContent = neverLangUl.classList.contains("expanded") ? "Show less" : `+${langs.length - 3} more`;
            };
            neverLangUl.parentElement.appendChild(btn);
          }
        }

        renderAlwaysLangs();
        renderNeverLangs();

        if (alwaysLangSelect) {
          alwaysLangSelect.onchange = () => {
            const code = alwaysLangSelect.value;
            if (!code) return;
            twpConfig.addLangToAlwaysTranslate(code, "");
            renderAlwaysLangs();
            alwaysLangSelect.value = "";
          };
        }

        if (neverLangSelect) {
          neverLangSelect.onchange = () => {
            const code = neverLangSelect.value;
            if (!code) return;
            twpConfig.addLangToNeverTranslate(code, "");
            renderNeverLangs();
            neverLangSelect.value = "";
          };
        }
      }

      const showOriginal = document.getElementById("toggleShowOriginalOnHover");
      if (showOriginal) {
        showOriginal.checked = twpConfig.get("showOriginalTextWhenHovering") === "yes";
        showOriginal.onchange = (e) => {
          twpConfig.set("showOriginalTextWhenHovering", e.target.checked ? "yes" : "no");
          $("#showOriginalTextWhenHovering").value = e.target.checked ? "yes" : "no";
        };
      }

      const showTranslation = document.getElementById("toggleShowTranslationOnHover");
      if (showTranslation) {
        showTranslation.checked = twpConfig.get("showTranslationWhenHovering") === "yes";
        showTranslation.onchange = (e) => {
          twpConfig.set("showTranslationWhenHovering", e.target.checked ? "yes" : "no");
        };
      }

      const showSelectedBtn = document.getElementById("toggleShowSelectedButton");
      if (showSelectedBtn) {
        showSelectedBtn.checked = twpConfig.get("showTranslateSelectedButton") === "yes";
        showSelectedBtn.onchange = (e) => {
          twpConfig.set("showTranslateSelectedButton", e.target.checked ? "yes" : "no");
          $("#showTranslateSelectedButton").value = e.target.checked ? "yes" : "no";
          enableOrDisableTranslateSelectedAdvancedOptions(e.target.checked ? "yes" : "no");
        };
      }

      const autoTranslateSelected = document.getElementById("toggleAutoTranslateSelected");
      if (autoTranslateSelected) {
        autoTranslateSelected.checked = twpConfig.get("translateSelectedWhenPressTwice") === "yes";
        autoTranslateSelected.onchange = (e) => {
          twpConfig.set("translateSelectedWhenPressTwice", e.target.checked ? "yes" : "no");
          $("#translateSelectedWhenPressTwice").checked = e.target.checked;
        };
      }

      // Page Translation Service select
      const pageSvcSelect = document.getElementById("selectPageTranslatorService");
      if (pageSvcSelect) {
        const pageServices = ["google", "bing", "yandex"];
        const enabled = twpConfig.get("enabledServices") || [];
        pageServices.forEach((svc) => {
          if (enabled.indexOf(svc) !== -1) {
            const opt = document.createElement("option");
            opt.value = svc;
            opt.textContent = svc.charAt(0).toUpperCase() + svc.slice(1);
            pageSvcSelect.appendChild(opt);
          }
        });
        pageSvcSelect.value = twpConfig.get("pageTranslatorService");
        pageSvcSelect.onchange = () => {
          twpConfig.set("pageTranslatorService", pageSvcSelect.value);
        };
      }

      // Text Translation Service select
      const textSvcSelect = document.getElementById("selectTextTranslatorService");
      if (textSvcSelect) {
        const textServices = ["google", "bing", "yandex", "deepl"];
        const enabled2 = twpConfig.get("enabledServices") || [];
        textServices.forEach((svc) => {
          if (enabled2.indexOf(svc) !== -1) {
            const opt = document.createElement("option");
            opt.value = svc;
            opt.textContent = svc.charAt(0).toUpperCase() + svc.slice(1);
            textSvcSelect.appendChild(opt);
          }
        });
        textSvcSelect.value = twpConfig.get("textTranslatorService");
        textSvcSelect.onchange = () => {
          twpConfig.set("textTranslatorService", textSvcSelect.value);
        };
      }

      // Dynamic content toggle
      const dynamicContent = document.getElementById("toggleDynamicContent");
      if (dynamicContent) {
        dynamicContent.checked = twpConfig.get("translateDynamicallyCreatedContent") === "yes";
        dynamicContent.onchange = (e) => {
          twpConfig.set("translateDynamicallyCreatedContent", e.target.checked ? "yes" : "no");
        };
      }

      // Iframe translation toggle
      const iframeToggle = document.getElementById("toggleIframeTranslation");
      if (iframeToggle) {
        iframeToggle.checked = twpConfig.get("enableIframePageTranslation") === "yes";
        iframeToggle.onchange = (e) => {
          twpConfig.set("enableIframePageTranslation", e.target.checked ? "yes" : "no");
        };
      }

      // Pre tag toggle
      const preToggle = document.getElementById("togglePreTag");
      if (preToggle) {
        preToggle.checked = twpConfig.get("translateTag_pre") === "yes";
        preToggle.onchange = (e) => {
          twpConfig.set("translateTag_pre", e.target.checked ? "yes" : "no");
        };
      }

      // Text translation filters
      const dontShowInvalid = document.getElementById("toggleDontShowInvalid");
      if (dontShowInvalid) {
        dontShowInvalid.checked = twpConfig.get("dontShowIfIsNotValidText") === "yes";
        dontShowInvalid.onchange = (e) => {
          twpConfig.set("dontShowIfIsNotValidText", e.target.checked ? "yes" : "no");
        };
      }

      const dontShowTargetLang = document.getElementById("toggleDontShowTargetLang");
      if (dontShowTargetLang) {
        dontShowTargetLang.checked = twpConfig.get("dontShowIfSelectedTextIsTargetLang") === "yes";
        dontShowTargetLang.onchange = (e) => {
          twpConfig.set("dontShowIfSelectedTextIsTargetLang", e.target.checked ? "yes" : "no");
        };
      }

      const dontShowUnknown = document.getElementById("toggleDontShowUnknown");
      if (dontShowUnknown) {
        dontShowUnknown.checked = twpConfig.get("dontShowIfSelectedTextIsUnknown") === "yes";
        dontShowUnknown.onchange = (e) => {
          twpConfig.set("dontShowIfSelectedTextIsUnknown", e.target.checked ? "yes" : "no");
        };
      }
    }

    // Advanced section handlers
    {
      const debugMode = document.getElementById("toggleDebugMode");
      if (debugMode) {
        debugMode.checked = twpConfig.get("debugMode") === "yes";
        debugMode.onchange = (e) => {
          twpConfig.set("debugMode", e.target.checked ? "yes" : "no");
        };
      }

      const btnResetAll = document.getElementById("btnResetAllSettings");
      if (btnResetAll) {
        btnResetAll.onclick = () => {
          if (confirm(twpI18n.getMessage("doYouWantRestoreSettings") || "Reset all settings to default?")) {
            twpConfig.restoreToDefault();
            location.reload();
          }
        };
      }

      const btnExport = document.getElementById("btnExportConfig");
      if (btnExport) {
        btnExport.onclick = () => {
          const configJSON = twpConfig.export();
          const element = document.createElement("a");
          element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(configJSON));
          element.setAttribute("download", "polyglot-config_" + new Date().toISOString().replace(/T/, "_").replace(/\..+/, "").replace(/\:/g, ".") + ".txt");
          element.style.display = "none";
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        };
      }
    }

    $("#btnShowProxyConfiguration").onclick = (e) => {
      $("#googleProxyContainer").style.display = "block";
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    };

    $("#addGoogleProxy").onclick = (e) => {
      try {
        const inputTranslationServer = $(
          "#googleTranslateProxyServer"
        ).value.trim();
        const inputTtsServer = $("#googleTtsProxyServer").value.trim();
        const translateServer = inputTranslationServer
          ? new URL("https://" + inputTranslationServer).host
          : null;
        const ttsServer = inputTtsServer
          ? new URL("https://" + inputTtsServer).host
          : null;

        const proxyServers = twpConfig.get("proxyServers");
        proxyServers.google = {
          translateServer,
          ttsServer,
        };
        console.info("proxyServers: ", proxyServers);
        twpConfig.set("proxyServers", proxyServers);

        $("#googleTranslateProxyServer").value = translateServer;
        $("#googleTtsProxyServer").value = ttsServer;
      } catch (e) {
        alert(e);
      }
    };

    $("#removeGoogleProxy").onclick = (e) => {
      const proxyServers = twpConfig.get("proxyServers");
      delete proxyServers.google;
      twpConfig.set("proxyServers", proxyServers);

      $("#googleTranslateProxyServer").value = "";
      $("#googleTtsProxyServer").value = "";
    }

    const googleProxy = twpConfig.get("proxyServers").google;
    if (googleProxy) {
      $("#googleTranslateProxyServer").value = googleProxy.translateServer;
      $("#googleTtsProxyServer").value = googleProxy.ttsServer;
    }
  });

window.scrollTo({
  top: 0,
});
