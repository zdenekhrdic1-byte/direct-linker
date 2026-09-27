chrome.downloads.onCreated.addListener((downloadItem) => {
  chrome.storage.local.get(["isRecording", "links"], (data) => {
    if (data.isRecording) {
      const currentLinks = data.links || [];
      const newEntry = {
        id: Date.now(),
        filename: downloadItem.filename.split(/[\\/]/).pop() || "Unknown File",
        url: downloadItem.url,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      currentLinks.unshift(newEntry);
      chrome.storage.local.set({ links: currentLinks });
    }
  });
});