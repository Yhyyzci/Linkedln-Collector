let allProfiles = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'STATUS') {
    console.log('Status message:', message.text);
  } 
  else if (message.type === 'SAVE_PROFILES') {
    // Profilleri kaydet
    allProfiles = allProfiles.concat(message.profiles);
    console.log(`Sayfa ${message.currentPage} profilleri kaydedildi. Toplam: ${allProfiles.length}`);
  }
  else if (message.type === 'PAGE_COMPLETED') {
    // Sonraki sayfaya geç
    const nextPage = message.currentPage + 1;
    const nextUrl = new URL(sender.tab.url);
    nextUrl.searchParams.set('page', nextPage);
    
    chrome.tabs.update(sender.tab.id, { url: nextUrl.toString() });
  }
  else if (message.type === 'DOWNLOAD_CSV') {
    console.log('CSV indirme başlatılıyor...');
    // Son sayfanın profillerini de ekle
    allProfiles = allProfiles.concat(message.profiles);
    chrome.downloads.download({
      url: message.url,
      filename: message.filename,
      saveAs: true
    }, (downloadId) => {
      if (chrome.runtime.lastError) {
        console.error('İndirme hatası:', chrome.runtime.lastError);
      } else {
        console.log('CSV indirme başarılı, downloadId:', downloadId);
        // Değişkenleri sıfırla
        allProfiles = [];
      }
    });
  }
});

function downloadCSV() {
  // CSV içeriğini oluştur
  const headers = ['İsim', 'Ünvan', 'Konum', 'Profil URL', 'Profil Resmi URL', 'Sayfa No'];
  let csvContent = headers.join(',') + '\n';

  allProfiles.forEach(profile => {
    const row = [
      profile.name || '',
      profile.title || '',
      profile.location || '',
      profile.profileUrl || '',
      profile.imageUrl || '',
      profile.page || ''
    ].map(cell => `"${String(cell).replace(/"/g, '""')}"`);
    
    csvContent += row.join(',') + '\n';
  });

  // Data URL oluştur
  const dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);

  // İndir
  chrome.downloads.download({
    url: dataUrl,
    filename: `linkedin_profiles_${Date.now()}.csv`,
    saveAs: true
  }, () => {
    console.log('CSV indirme tamamlandı');
    allProfiles = []; // Profilleri temizle
  });
} 