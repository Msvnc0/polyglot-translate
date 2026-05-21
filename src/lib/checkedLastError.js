function checkedLastError() {
  chrome.runtime.lastError;
}

function isExtensionContextValid() {
  try {
    return !!chrome.runtime?.id;
  } catch (e) {
    return false;
  }
}

(function () {
  const origSendMessage = chrome.runtime.sendMessage;
  chrome.runtime.sendMessage = function () {
    if (!isExtensionContextValid()) return;
    return origSendMessage.apply(this, arguments);
  };

  const origGetURL = chrome.runtime.getURL;
  chrome.runtime.getURL = function () {
    if (!isExtensionContextValid()) return "";
    return origGetURL.apply(this, arguments);
  };
})();
