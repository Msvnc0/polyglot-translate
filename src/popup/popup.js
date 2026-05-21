"use strict";

var $ = document.querySelector.bind(document);

twpConfig
  .onReady()
  .then(() => twpI18n.updateUiMessages())
  .then(() => {
    twpI18n.translateDocument();
    const popupSectionCount = 6;

    // Wire dark mode toggle
    const btnDarkModeToggle = $("#btnDarkModeToggle");
    if (btnDarkModeToggle) {
      btnDarkModeToggle.onclick = () => {
        const next = darkMode.toggle();
        btnDarkModeToggle.textContent = next === "dark" ? "☀" : "🌙";
        twpConfig.set("darkMode", next === "dark" ? "yes" : "no");
      };
    }

    // Wire settings icon
    document.querySelectorAll("[data-service]").forEach((pill) => {
      pill.addEventListener("click", () => {
        const serviceName = pill.dataset.service;
        document.querySelectorAll("[data-service]").forEach((p) => p.classList.remove("active"));
        pill.classList.add("active");

        twpConfig.set("pageTranslatorService", serviceName);
        currentPageTranslatorService = serviceName;

        chrome.tabs.query(
          { active: true, currentWindow: true },
          (tabs) => {
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                action: "swapTranslationService",
                newServiceName: serviceName,
              },
              checkedLastError
            );
          }
        );

        updateInterface();
      });
    });

    // Cache stats fetch
    chrome.runtime.sendMessage({ action: "getCacheSize" }, (response) => {
      const cacheStatsEl = $("#cacheStats");
      if (cacheStatsEl && response) {
        cacheStatsEl.textContent = response;
      }
    });

    let popupPanelSection = twpConfig.get("popupPanelSection");

    function updatePopupSection() {
      document.querySelectorAll("[data-popupPanelSection]").forEach((node) => {
        const nodePopupPanelSection = parseInt(
          node.getAttribute("data-popupPanelSection")
        );
        if (isNaN(nodePopupPanelSection)) return;

        if (nodePopupPanelSection > popupPanelSection) {
          node.style.display = "none";
        } else {
          node.style.display = "block";
        }
      });

      document.querySelectorAll("[data-popupPanelSection2]").forEach((node) => {
        const nodePopupPanelSection2 = parseInt(
          node.getAttribute("data-popupPanelSection2")
        );
        if (isNaN(nodePopupPanelSection2)) return;

        if (nodePopupPanelSection2 <= popupPanelSection) {
          node.style.display = "none";
        } else {
          node.style.display = "block";
        }
      });

      $("#more").style.display = "block";
      $("#less").style.display = "block";

      if (popupPanelSection >= popupSectionCount) {
        $("#more").style.display = "none";
      } else if (popupPanelSection <= 0) {
        $("#less").style.display = "none";
      }
    }
    updatePopupSection();

    $("#more").onclick = (e) => {
      if (popupPanelSection < popupSectionCount) {
        popupPanelSection++;
        updatePopupSection();
      }
      twpConfig.set("popupPanelSection", popupPanelSection);
    };
    $("#less").onclick = (e) => {
      if (popupPanelSection > 0) {
        popupPanelSection--;
        updatePopupSection();
      }
      twpConfig.set("popupPanelSection", popupPanelSection);
    };

    let originalTabLanguage = "und";
    let currentPageLanguage = "und";
    let currentPageLanguageState = "original";
    let currentPageTranslatorService = twpConfig.get("pageTranslatorService");

    function translateOrRestorePagePage(newTargetLanguage) {
      const _translateOrRestorePagePage = (newTargetLanguage) => {
        currentPageLanguage = newTargetLanguage;
        if (currentPageLanguage === "original") {
          currentPageLanguageState = "original";
        } else {
          currentPageLanguageState = "translated";
        }

        chrome.tabs.query(
          {
            active: true,
            currentWindow: true,
          },
          (tabs) => {
            if (twpConfig.get("enableIframePageTranslation") === "yes") {
              chrome.tabs.sendMessage(
                tabs[0].id,
                {
                  action: "translatePage",
                  targetLanguage: newTargetLanguage || "original",
                },
                checkedLastError
              );
            } else {
              chrome.tabs.sendMessage(
                tabs[0].id,
                {
                  action: "translatePage",
                  targetLanguage: newTargetLanguage || "original",
                },
                { frameId: 0 },
                checkedLastError
              );
            }
          }
        );

        updateInterface();
      };

      if (newTargetLanguage) {
        _translateOrRestorePagePage(newTargetLanguage);
      } else {
        chrome.tabs.query(
          {
            active: true,
            currentWindow: true,
          },
          (tabs) => {
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                action: "currentTargetLanguage",
              },
              {
                frameId: 0,
              },
              (pageLanguage) => {
                checkedLastError();
                if (pageLanguage) {
                  _translateOrRestorePagePage(pageLanguage);
                }
              }
            );
          }
        );
      }
    }

    const langGrid = $("#langGrid");
    const btnRestore = $("#btnRestore");
    const btnTranslate = $("#btnTranslate");
    let dragSrcIdx = null;

    let targetLanguages = twpConfig.get("targetLanguages");

    if (btnTranslate) {
      btnTranslate.onclick = () => {
        const lang = twpConfig.get("targetLanguage");
        if (lang) {
          translateOrRestorePagePage(lang);
        }
      };
    }

    if (btnRestore) {
      btnRestore.onclick = () => {
        translateOrRestorePagePage("original");
      };
    }

    function renderGrid() {
      langGrid.innerHTML = "";
      const langs = twpConfig.get("targetLanguages") || [];
      langs.forEach((lang, idx) => {
        const btn = document.createElement("button");
        btn.className = "pl-lang-btn";
        btn.value = lang;
        btn.textContent = twpLang.codeToLanguage(lang);
        btn.draggable = true;
        btn.setAttribute("data-idx", idx);

        btn.addEventListener("dragstart", (e) => {
          dragSrcIdx = idx;
          btn.style.opacity = "0.4";
          e.dataTransfer.effectAllowed = "move";
        });
        btn.addEventListener("dragend", () => {
          btn.style.opacity = "";
          langGrid.querySelectorAll(".pl-lang-btn").forEach((b) => b.classList.remove("drag-over"));
        });
        btn.addEventListener("dragover", (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          btn.classList.add("drag-over");
        });
        btn.addEventListener("dragleave", () => {
          btn.classList.remove("drag-over");
        });
        btn.addEventListener("drop", (e) => {
          e.preventDefault();
          btn.classList.remove("drag-over");
          const targetIdx = parseInt(btn.getAttribute("data-idx"));
          if (dragSrcIdx === null || dragSrcIdx === targetIdx) return;
          const current = twpConfig.get("targetLanguages") || [];
          const [moved] = current.splice(dragSrcIdx, 1);
          current.splice(targetIdx, 0, moved);
          twpConfig.set("targetLanguages", current);
          dragSrcIdx = null;
          renderGrid();
        });

        if (langs.length > 1) {
          const remove = document.createElement("span");
          remove.className = "grid-remove";
          remove.textContent = "\u00D7";
          remove.onclick = (e) => {
            e.stopPropagation();
            const current = twpConfig.get("targetLanguages") || [];
            const i = current.indexOf(lang);
            if (i !== -1 && current.length > 1) {
              current.splice(i, 1);
              twpConfig.set("targetLanguages", current);
            }
            renderGrid();
            renderRecentPills();
          };
          btn.appendChild(remove);
        }
        btn.addEventListener("click", () => {
          langGrid.querySelectorAll(".pl-lang-btn").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          translateOrRestorePagePage(btn.value);
        });
        langGrid.appendChild(btn);
      });
      if (langs.length < 6) {
        const addBtn = document.createElement("button");
        addBtn.className = "pl-lang-btn pl-lang-add";
        addBtn.textContent = "+";
        addBtn.style.position = "relative";
        addBtn.style.overflow = "visible";
        const sel = document.createElement("select");
        sel.className = "pl-dropdown hidden";
        sel.style.cssText = "position:absolute;top:100%;left:0;z-index:1000;width:140px;margin-top:2px;";
        addBtn.addEventListener("click", (e) => {
          if (e.target === sel) return;
          sel.classList.toggle("hidden");
          if (!sel.classList.contains("hidden")) {
            populateGridSelect(sel);
            sel.focus();
          }
        });
        sel.onchange = () => {
          const code = sel.value;
          if (code) {
            const current = twpConfig.get("targetLanguages") || [];
            if (current.indexOf(code) === -1 && current.length < 6) {
              current.push(code);
              twpConfig.set("targetLanguages", current);
            }
          }
          sel.classList.add("hidden");
          sel.selectedIndex = 0;
          renderGrid();
          renderRecentPills();
        };
        sel.onblur = () => {
          setTimeout(() => { sel.classList.add("hidden"); sel.value = ""; }, 150);
        };
        sel.onclick = (e) => e.stopPropagation();
        addBtn.appendChild(sel);
        langGrid.appendChild(addBtn);
      }
    }
    renderGrid();

    function populateGridSelect(sel) {
      sel.innerHTML = "";
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "Add language...";
      opt.disabled = true;
      opt.selected = true;
      sel.appendChild(opt);
      const langs = twpLang.getLanguageList();
      const current = twpConfig.get("targetLanguages") || [];
      const entries = [];
      for (const code in langs) {
        if (current.indexOf(code) === -1) {
          entries.push([code, langs[code]]);
        }
      }
      entries.sort((a, b) => a[1].localeCompare(b[1]));
      entries.forEach(([code, name]) => {
        const o = document.createElement("option");
        o.value = code;
        o.textContent = name;
        sel.appendChild(o);
      });
    }

    // Populate "More languages" dropdown
    const moreLangDropdown = $("#moreLangDropdown");
    if (moreLangDropdown) {
      const langs = twpLang.getLanguageList();
      const entries = [];
      for (const code in langs) {
        if (targetLanguages.indexOf(code) === -1) {
          entries.push([code, langs[code]]);
        }
      }
      entries.sort((a, b) => a[1].localeCompare(b[1]));
      entries.forEach(([code, name]) => {
        const opt = document.createElement("option");
        opt.value = code;
        opt.textContent = name;
        moreLangDropdown.appendChild(opt);
      });
      moreLangDropdown.onchange = () => {
        const val = moreLangDropdown.value;
        if (val) {
          addRecentlyUsed(val);
          translateOrRestorePagePage(val);
          moreLangDropdown.selectedIndex = 0;
        }
      };
    }

    // Populate "Recently Used" pills
    const recentLangsEl = $("#recentLangs");
    function renderRecentPills() {
      if (!recentLangsEl) return;
      recentLangsEl.innerHTML = "";
      const recent = twpConfig.get("recentlyUsedLanguages") || [];
      const quickLangs = twpConfig.get("targetLanguages") || [];
      const recentSection = $("#recentSection");
      let hasAny = false;
      recent.forEach((code) => {
        if (quickLangs.indexOf(code) !== -1) return;
        hasAny = true;
        const pill = document.createElement("span");
        pill.className = "pl-pill recent-pill";
        pill.textContent = twpLang.codeToLanguage(code);
        pill.onclick = () => {
          translateOrRestorePagePage(code);
        };
        if (quickLangs.length < 6) {
          const pin = document.createElement("span");
          pin.className = "recent-pin";
          pin.textContent = "☆";
          pin.title = "Add to quick access";
          pin.onclick = (e) => {
            e.stopPropagation();
            const langs = twpConfig.get("targetLanguages") || [];
            if (langs.indexOf(code) === -1 && langs.length < 6) {
              langs.push(code);
              twpConfig.set("targetLanguages", langs);
            }
            renderGrid();
            renderRecentPills();
          };
          pill.appendChild(pin);
        }
        recentLangsEl.appendChild(pill);
      });
      if (recentSection) {
        recentSection.style.display = hasAny ? "" : "none";
      }
    }
    renderRecentPills();

    function addRecentlyUsed(lang) {
      let recent = twpConfig.get("recentlyUsedLanguages") || [];
      recent = recent.filter((l) => l !== lang);
      recent.unshift(lang);
      if (recent.length > 4) recent = recent.slice(0, 4);
      twpConfig.set("recentlyUsedLanguages", recent);
      renderRecentPills();
    }

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "getOriginalTabLanguage",
          },
          {
            frameId: 0,
          },
          (tabLanguage) => {
            checkedLastError();
            if (
              !tabLanguage ||
              (tabLanguage = twpLang.fixTLanguageCode(tabLanguage))
            ) {
              originalTabLanguage = tabLanguage || "und";
            }
          }
        );

        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "getCurrentPageLanguage",
          },
          {
            frameId: 0,
          },
          (pageLanguage) => {
            checkedLastError();
            if (pageLanguage) {
              currentPageLanguage = pageLanguage;
              updateInterface();
            }
          }
        );

        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "getCurrentPageLanguageState",
          },
          {
            frameId: 0,
          },
          (pageLanguageState) => {
            checkedLastError();
            if (pageLanguageState) {
              currentPageLanguageState = pageLanguageState;
              updateInterface();
            }
          }
        );

        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "getCurrentPageTranslatorService",
          },
          {
            frameId: 0,
          },
          (pageTranslatorService) => {
            checkedLastError();
            if (pageTranslatorService) {
              currentPageTranslatorService = pageTranslatorService;
              updateInterface();
            }
          }
        );
      }
    );

    function updateInterface() {
      if (btnRestore) {
        btnRestore.classList.toggle("hidden", currentPageLanguageState !== "translated");
      }

      if (currentPageTranslatorService == "yandex") {
        $("#btnOptions option[value='translateInExternalSite']").textContent =
          twpI18n.getMessage("msgOpenOnYandexTranslator");
        $("#iconTranslate").setAttribute(
          "src",
          "/icons/yandex-translate-32.png"
        );
      } else if (currentPageTranslatorService == "bing") {
        $("#btnOptions option[value='translateInExternalSite']").textContent =
          twpI18n.getMessage("btnOpenOnGoogleTranslate");
        $("#iconTranslate").setAttribute("src", "/icons/bing-translate-32.png");
      } else {
        // google
        $("#btnOptions option[value='translateInExternalSite']").textContent =
          twpI18n.getMessage("btnOpenOnGoogleTranslate");
        $("#iconTranslate").setAttribute(
          "src",
          "/icons/google-translate-32.png"
        );
      }

      // highlight active language in grid
      const gridBtns = document.querySelectorAll("#langGrid .pl-lang-btn");
      gridBtns.forEach((btn) => {
        const isActive =
          currentPageLanguageState === "translated" &&
          btn.dataset.lang === currentPageLanguage;
        btn.classList.toggle("lang-active", isActive);
      });

      // highlight active service pill + hide disabled services
      document.querySelectorAll("[data-service]").forEach((pill) => {
        pill.classList.toggle("active", pill.dataset.service === currentPageTranslatorService);
      });

      if (originalTabLanguage !== "und") {
        $("#cbAlwaysTranslateThisLang").checked =
          twpConfig.get("alwaysTranslateLangs").indexOf(originalTabLanguage) !==
          -1;
        $("#lblAlwaysTranslateThisLang").textContent = twpI18n.getMessage(
          "lblAlwaysTranslate",
          twpLang.codeToLanguage(originalTabLanguage)
        );
        $("#cbAlwaysTranslateThisLang").removeAttribute("disabled");

        const cbNeverTranslateThisLang = document.getElementById("cbNeverTranslateThisLang");
        if (cbNeverTranslateThisLang) {
          cbNeverTranslateThisLang.checked =
            twpConfig.get("neverTranslateLangs").indexOf(originalTabLanguage) !== -1;
          cbNeverTranslateThisLang.removeAttribute("disabled");
          const lblNeverTranslateThisLang = document.getElementById("lblNeverTranslateThisLang");
          if (lblNeverTranslateThisLang) {
            lblNeverTranslateThisLang.textContent = "Never translate " + twpLang.codeToLanguage(originalTabLanguage);
          }
        }

        const translatedWhenHoveringThisLangText = twpI18n.getMessage(
          "lblShowTranslatedWhenHoveringThisLang",
          twpLang.codeToLanguage(originalTabLanguage)
        );
        $("#cbShowTranslatedWhenHoveringThisLang").checked =
          twpConfig
            .get("langsToTranslateWhenHovering")
            .indexOf(originalTabLanguage) !== -1;
        $("#lblShowTranslatedWhenHoveringThisLang").textContent =
          translatedWhenHoveringThisLangText;
        $("#cbShowTranslatedWhenHoveringThisLang").removeAttribute("disabled");

        if (
          twpConfig
            .get("langsToTranslateWhenHovering")
            .indexOf(originalTabLanguage) === -1
        ) {
          $(
            "option[data-i18n=lblShowTranslatedWhenHoveringThisLang]"
          ).textContent = translatedWhenHoveringThisLangText;
        } else {
          $(
            "option[data-i18n=lblShowTranslatedWhenHoveringThisLang]"
          ).textContent = "✔ " + translatedWhenHoveringThisLangText;
        }
        $(
          "option[data-i18n=lblShowTranslatedWhenHoveringThisLang]"
        ).removeAttribute("hidden");

        const neverTranslateLangText = twpI18n.getMessage(
          "btnNeverTranslateThisLanguage"
        );
        if (
          twpConfig.get("neverTranslateLangs").indexOf(originalTabLanguage) ===
          -1
        ) {
          $("option[data-i18n=btnNeverTranslateThisLanguage]").textContent =
            neverTranslateLangText;
        } else {
          $("option[data-i18n=btnNeverTranslateThisLanguage]").textContent =
            "✔ " + neverTranslateLangText;
        }
        $("option[data-i18n=btnNeverTranslateThisLanguage]").style.display =
          "block";
      }
    }
    updateInterface();

    darkMode.initFromConfig(twpConfig.get("darkMode"));

    const btnDarkMode = $("#btnDarkModeToggle");
    if (btnDarkMode) {
      btnDarkMode.textContent = darkMode.currentTheme === "dark" ? "☀" : "🌙";
    }

    // 3-dot menu → open options
    const btnMenuTrigger = document.getElementById("btnMenuTrigger");
    if (btnMenuTrigger) {
      btnMenuTrigger.onclick = () => {
        chrome.runtime.openOptionsPage?.() || window.open(chrome.runtime.getURL("/options/options.html"));
      };
    }

    $("#divIconTranslate").addEventListener("click", () => {
      currentPageTranslatorService = twpConfig.swapPageTranslationService();

      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              action: "swapTranslationService",
              newServiceName: currentPageTranslatorService,
            },
            checkedLastError
          );
        }
      );

      updateInterface();
    });

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        // Collapsible more toggles
        const btnToggleMore = document.getElementById("btnToggleMore");
        const toggleMoreContent = document.getElementById("toggleMoreContent");
        if (btnToggleMore && toggleMoreContent) {
          btnToggleMore.onclick = () => {
            const isOpen = !toggleMoreContent.classList.contains("hidden");
            toggleMoreContent.classList.toggle("hidden", isOpen);
            btnToggleMore.querySelector(".toggle-more-arrow").classList.toggle("open", !isOpen);
            btnToggleMore.querySelector("span").textContent = isOpen ? "More options" : "Less options";
          };
        }

        $("#cbAlwaysTranslateThisLang").addEventListener("change", (e) => {
          const hostname = new URL(tabs[0].url).hostname;
          if (e.target.checked) {
            twpConfig.addLangToAlwaysTranslate(originalTabLanguage, hostname);
            translateOrRestorePagePage();
          } else {
            twpConfig.removeLangFromAlwaysTranslate(originalTabLanguage);
          }
        });

        // Never translate this language toggle
        const cbNeverTranslateThisLang = document.getElementById("cbNeverTranslateThisLang");
        if (cbNeverTranslateThisLang && originalTabLanguage !== "und") {
          cbNeverTranslateThisLang.checked =
            twpConfig.get("neverTranslateLangs").indexOf(originalTabLanguage) !== -1;
          cbNeverTranslateThisLang.removeAttribute("disabled");
          const lblNeverTranslateThisLang = document.getElementById("lblNeverTranslateThisLang");
          if (lblNeverTranslateThisLang) {
            lblNeverTranslateThisLang.textContent = "Never translate " + twpLang.codeToLanguage(originalTabLanguage);
          }
          cbNeverTranslateThisLang.addEventListener("change", (e) => {
            if (e.target.checked) {
              twpConfig.addLangToNeverTranslate(originalTabLanguage);
              $("#cbAlwaysTranslateThisLang").checked = false;
              translateOrRestorePagePage("original");
            } else {
              twpConfig.removeLangFromNeverTranslate(originalTabLanguage);
            }
          });
        }

        $("#cbAlwaysTranslateThisSite").addEventListener("change", (e) => {
          const hostname = new URL(tabs[0].url).hostname;
          if (e.target.checked) {
            twpConfig.addSiteToAlwaysTranslate(hostname);
            twpConfig.removeSiteFromNeverTranslate(hostname);
            $("#cbNeverTranslateThisSite").checked = false;
            translateOrRestorePagePage();
          } else {
            twpConfig.removeSiteFromAlwaysTranslate(hostname);
          }
        });

        $("#cbNeverTranslateThisSite").addEventListener("change", (e) => {
          const hostname = new URL(tabs[0].url).hostname;
          if (e.target.checked) {
            twpConfig.addSiteToNeverTranslate(hostname);
            twpConfig.removeSiteFromAlwaysTranslate(hostname);
            $("#cbAlwaysTranslateThisSite").checked = false;
            translateOrRestorePagePage("original");
          } else {
            twpConfig.removeSiteFromNeverTranslate(hostname);
          }
        });

        $("#cbShowTranslateSelectedButton").addEventListener("change", (e) => {
          if (e.target.checked) {
            twpConfig.set("showTranslateSelectedButton", "yes");
          } else {
            twpConfig.set("showTranslateSelectedButton", "no");
          }
        });

        $("#cbShowOriginalWhenHovering").addEventListener("change", (e) => {
          if (e.target.checked) {
            twpConfig.set("showOriginalTextWhenHovering", "yes");
          } else {
            twpConfig.set("showOriginalTextWhenHovering", "no");
          }
        });

        $("#cbShowTranslatedWhenHoveringThisSite").addEventListener(
          "change",
          (e) => {
            const hostname = new URL(tabs[0].url).hostname;
            if (e.target.checked) {
              twpConfig.addSiteToTranslateWhenHovering(hostname);
            } else {
              twpConfig.removeSiteFromTranslateWhenHovering(hostname);
            }
          }
        );

        $("#cbShowTranslatedWhenHoveringThisLang").addEventListener(
          "change",
          (e) => {
            if (e.target.checked) {
              twpConfig.addLangToTranslateWhenHovering(originalTabLanguage);
            } else {
              twpConfig.removeLangFromTranslateWhenHovering(
                originalTabLanguage
              );
            }
          }
        );

        $("#cbShowTranslateSelectedButton").checked =
          twpConfig.get("showTranslateSelectedButton") == "yes" ? true : false;
        $("#cbShowOriginalWhenHovering").checked =
          twpConfig.get("showOriginalTextWhenHovering") == "yes" ? true : false;

        const hostname = new URL(tabs[0].url).hostname;
        $("#cbAlwaysTranslateThisSite").checked =
          twpConfig.get("alwaysTranslateSites").indexOf(hostname) !== -1;
        $("#cbNeverTranslateThisSite").checked =
          twpConfig.get("neverTranslateSites").indexOf(hostname) !== -1;
        $("#cbShowTranslatedWhenHoveringThisSite").checked =
          twpConfig.get("sitesToTranslateWhenHovering").indexOf(hostname) !==
          -1;

        {
          const text = twpI18n.getMessage("lblShowTranslateSelectedButton");
          if (twpConfig.get("showTranslateSelectedButton") !== "yes") {
            $("option[data-i18n=lblShowTranslateSelectedButton]").textContent =
              text;
          } else {
            $("option[data-i18n=lblShowTranslateSelectedButton]").textContent =
              "✔ " + text;
          }
        }
        {
          const text = twpI18n.getMessage("lblShowOriginalTextWhenHovering");
          if (twpConfig.get("showOriginalTextWhenHovering") !== "yes") {
            $("option[data-i18n=lblShowOriginalTextWhenHovering]").textContent =
              text;
          } else {
            $("option[data-i18n=lblShowOriginalTextWhenHovering]").textContent =
              "✔ " + text;
          }
        }
        {
          const text = twpI18n.getMessage(
            "lblShowTranslatedWhenHoveringThisSite"
          );
          if (
            twpConfig.get("sitesToTranslateWhenHovering").indexOf(hostname) ===
            -1
          ) {
            $(
              "option[data-i18n=lblShowTranslatedWhenHoveringThisSite]"
            ).textContent = text;
          } else {
            $(
              "option[data-i18n=lblShowTranslatedWhenHoveringThisSite]"
            ).textContent = "✔ " + text;
          }
        }
      }
    );

    $("#btnOptions").addEventListener("change", (event) => {
      const btnOptions = event.target;

      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          const hostname = new URL(tabs[0].url).hostname;
          switch (btnOptions.value) {
            case "changeLanguage":
              location = chrome.runtime.getURL(
                "/popup/improve-translation.html"
              );
              break;
            case "alwaysTranslateThisSite":
              if (
                twpConfig.get("alwaysTranslateSites").indexOf(hostname) === -1
              ) {
                twpConfig.addSiteToAlwaysTranslate(hostname);
              } else {
                twpConfig.removeSiteFromAlwaysTranslate(hostname);
              }
              window.close();
              break;
            case "neverTranslateThisSite":
              if (
                twpConfig.get("neverTranslateSites").indexOf(hostname) === -1
              ) {
                twpConfig.addSiteToNeverTranslate(hostname);
                translateOrRestorePagePage("original");
              } else {
                twpConfig.removeSiteFromNeverTranslate(hostname);
              }
              window.close();
              break;
            case "alwaysTranslateThisLanguage":
              if (
                twpConfig
                  .get("alwaysTranslateLangs")
                  .indexOf(originalTabLanguage) === -1
              ) {
                twpConfig.addLangToAlwaysTranslate(
                  originalTabLanguage,
                  hostname
                );
              } else {
                twpConfig.removeLangFromAlwaysTranslate(originalTabLanguage);
              }
              window.close();
              break;
            case "neverTranslateThisLanguage":
              if (
                twpConfig
                  .get("neverTranslateLangs")
                  .indexOf(originalTabLanguage) === -1
              ) {
                twpConfig.addLangToNeverTranslate(
                  originalTabLanguage,
                  hostname
                );
                translateOrRestorePagePage("original");
              } else {
                twpConfig.removeLangFromNeverTranslate(originalTabLanguage);
              }
              window.close();
              break;
            case "showTranslateSelectedButton":
              if (twpConfig.get("showTranslateSelectedButton") === "yes") {
                twpConfig.set("showTranslateSelectedButton", "no");
              } else {
                twpConfig.set("showTranslateSelectedButton", "yes");
              }
              window.close();
              break;
            case "showOriginalTextWhenHovering":
              if (twpConfig.get("showOriginalTextWhenHovering") === "yes") {
                twpConfig.set("showOriginalTextWhenHovering", "no");
              } else {
                twpConfig.set("showOriginalTextWhenHovering", "yes");
              }
              window.close();
              break;
            case "showTranslatedWhenHoveringThisSite":
              if (
                twpConfig
                  .get("sitesToTranslateWhenHovering")
                  .indexOf(hostname) === -1
              ) {
                twpConfig.addSiteToTranslateWhenHovering(hostname);
              } else {
                twpConfig.removeSiteFromTranslateWhenHovering(hostname);
              }
              window.close();
              break;
            case "showTranslatedWhenHoveringThisLang":
              if (
                twpConfig
                  .get("langsToTranslateWhenHovering")
                  .indexOf(originalTabLanguage) === -1
              ) {
                twpConfig.addLangToTranslateWhenHovering(originalTabLanguage);
              } else {
                twpConfig.removeLangFromTranslateWhenHovering(
                  originalTabLanguage
                );
              }
              window.close();
              break;
            case "translateInExternalSite":
              chrome.tabs.query(
                {
                  active: true,
                  currentWindow: true,
                },
                (tabs) => {
                  if (currentPageTranslatorService === "yandex") {
                    tabsCreate(
                      `https://translate.yandex.com/translate?view=compact&url=${encodeURIComponent(
                        tabs[0].url
                      )}&lang=${twpConfig.get("targetLanguage").split("-")[0]}`
                    );
                  } else {
                    // google
                    tabsCreate(
                      `https://translate.google.com/translate?tl=${twpConfig.get(
                        "targetLanguage"
                      )}&u=${encodeURIComponent(tabs[0].url)}`
                    );
                  }
                }
              );
              break;
            case "moreOptions":
              tabsCreate(chrome.runtime.getURL("/options/options.html"));
              break;
            case "translatePDF":
              tabsCreate("https://pdf.translatewebpages.org/");
              break;
            default:
              break;
          }
          btnOptions.value = "options";
        }
      );
    });

    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        const hostname = new URL(tabs[0].url).hostname;
        const textNever = twpI18n.getMessage("btnNeverTranslate");
        if (twpConfig.get("neverTranslateSites").indexOf(hostname) === -1) {
          $("option[data-i18n=btnNeverTranslate]").textContent = textNever;
        } else {
          $("option[data-i18n=btnNeverTranslate]").textContent =
            "✔ " + textNever;
        }

        const textAlways = twpI18n.getMessage("btnAlwaysTranslate");
        if (twpConfig.get("alwaysTranslateSites").indexOf(hostname) === -1) {
          $("option[data-i18n=btnAlwaysTranslate]").textContent = textAlways;
        } else {
          $("option[data-i18n=btnAlwaysTranslate]").textContent =
            "✔ " + textAlways;
        }

      }
    );
  });
