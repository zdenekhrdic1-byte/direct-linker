const recordBtn = document.getElementById("recordBtn");
const clearBtn = document.getElementById("clearBtn");
const linkList = document.getElementById("linkList");
const statusBadge = document.getElementById("statusBadge");

function updateUI() {
  chrome.storage.local.get(["isRecording", "links"], (data) => {
    const isRecording = !!data.isRecording;
    const links = data.links || [];

    if (isRecording) {
      recordBtn.textContent = "Stop Recording";
      recordBtn.className = "btn-record stop";
      statusBadge.textContent = "Recording...";
      statusBadge.className = "status-badge recording";
    } else {
      recordBtn.textContent = "Start Record";
      recordBtn.className = "btn-record";
      statusBadge.textContent = "Idle";
      statusBadge.className = "status-badge";
    }

    linkList.innerHTML = "";
    if (links.length === 0) {
      linkList.innerHTML = `<div class="empty-state">No downloads captured yet.</div>`;
      return;
    }

    links.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div class="file-name">${escapeHTML(item.filename)}</div>
        <a class="file-url" href="${escapeHTML(item.url)}" target="_blank" title="${escapeHTML(item.url)}">${escapeHTML(item.url)}</a>
        <div class="file-time">${item.time}</div>
      `;
      linkList.appendChild(li);
    });
  });
}

// Funkce pro odstranění mezistránky a získání přímé URL
async function getDirectUrl(url) {
  try {
    const response = await fetch(url, { 
      method: 'HEAD', 
      redirect: 'follow' 
    });
    return response.url; // Vrátí finální přímý odkaz (např. přímo na .rar / .zip)
  } catch (error) {
    // Pokud HEAD selže, zkusí GET
    try {
      const response = await fetch(url, { 
        method: 'GET', 
        redirect: 'follow' 
      });
      return response.url;
    } catch (e) {
      return url; // Při chybě vrátí původní URL
    }
  }
}

// Příklad použití při stahování/kopírování odkazu:
async function handleDownload(originalUrl) {
  const cleanDirectUrl = await getDirectUrl(originalUrl);
  
  // Nyní pošleš do FDM/stahovače už čistý přímý odkaz:
  chrome.downloads.download({
    url: cleanDirectUrl
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

recordBtn.addEventListener("click", () => {
  chrome.storage.local.get(["isRecording"], (data) => {
    const newState = !data.isRecording;
    chrome.storage.local.set({ isRecording: newState }, updateUI);
  });
});

clearBtn.addEventListener("click", () => {
  chrome.storage.local.set({ links: [] }, updateUI);
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.links || changes.isRecording) {
    updateUI();
  }
});

updateUI();
