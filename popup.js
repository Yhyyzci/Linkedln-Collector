let currentPage = 1;
const MAX_PAGES = 3;

document.getElementById('startScraping').addEventListener('click', async () => {
  const statusElement = document.getElementById('status');
  
  try {
    // Aktif sekmeyi al
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // LinkedIn URL kontrolü
    if (!tab.url.includes('linkedin.com')) {
      throw new Error('Lütfen LinkedIn websitesinde olduğunuzdan emin olun!');
    }

    // Giriş sayfası kontrolü
    if (tab.url.includes('linkedin.com/login') || tab.url.includes('linkedin.com/checkpoint/')) {
      throw new Error('Lütfen önce LinkedIn\'e giriş yapın!');
    }

    // Arama sonuçları sayfası kontrolü
    if (!tab.url.includes('/search/results/people/')) {
      throw new Error('Lütfen LinkedIn arama sonuçları sayfasında olduğunuzdan emin olun!');
    }

    statusElement.textContent = 'Profiller toplanıyor...';
    statusElement.className = '';

    // İlk sayfayı başlat
    const baseUrl = new URL(tab.url);
    baseUrl.searchParams.set('page', currentPage);
    processNextPage(tab.id, baseUrl.toString());
    
  } catch (error) {
    statusElement.textContent = error.message;
    statusElement.className = 'error';
  }
});

function processNextPage(tabId, url) {
  // Sayfayı güncelle
  chrome.tabs.update(tabId, { url: url }, async (tab) => {
    // Content script'i çalıştır
    await new Promise(r => setTimeout(r, 5000)); // Sayfa yüklenmesi için bekle
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  });
}

// Background script'ten gelen mesajları dinle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const statusElement = document.getElementById('status');
  
  if (message.type === 'STATUS') {
    statusElement.textContent = message.text;
    statusElement.className = message.error ? 'error' : 'success';
  }
  else if (message.type === 'PAGE_COMPLETED') {
    currentPage++;
    
    if (currentPage <= MAX_PAGES) {
      // Sonraki sayfaya geç
      const nextUrl = new URL(sender.tab.url);
      nextUrl.searchParams.set('page', currentPage);
      processNextPage(sender.tab.id, nextUrl.toString());
      
      statusElement.textContent = `Sayfa ${currentPage-1} tamamlandı, sayfa ${currentPage}'e geçiliyor...`;
    }
  }
}); 