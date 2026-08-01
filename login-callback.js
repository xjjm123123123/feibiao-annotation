(() => {
  const CONTENT_SOURCE = "vfs-content";
  const MAGIC_BRIDGE_SOURCE = "vf-magic-login-bridge";

  if (window.__VFS_LOGIN_CALLBACK_BRIDGE__) {
    return;
  }
  window.__VFS_LOGIN_CALLBACK_BRIDGE__ = true;

  window.addEventListener("message", (event) => {
    const message = event.data;
    if (event.source !== window || event.origin !== location.origin ||
      message?.source !== MAGIC_BRIDGE_SOURCE ||
      message.type !== "VF_MAGIC_LOGIN_SUCCESS" ||
      !message.sessionToken) {
      return;
    }

    chrome.runtime.sendMessage({
      source: CONTENT_SOURCE,
      type: "VFS_MAGIC_LOGIN_SUCCESS",
      sessionToken: message.sessionToken,
      syncUrl: message.syncUrl,
      collabUrl: message.collabUrl,
      user: message.user,
      expiresAt: message.expiresAt
    }, (response) => {
      void chrome.runtime.lastError;
      if (response?.autoClose) {
        window.close();
      }
    });
  });
})();
