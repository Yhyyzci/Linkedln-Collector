// Ana fonksiyon
async function collectProfiles() {
  try {
    console.log('Profil toplama başladı...');
    
    // Mevcut sayfanın numarasını al
    const pageUrl = new URL(window.location.href);
    const currentPage = parseInt(pageUrl.searchParams.get('page')) || 1;
    console.log(`Mevcut sayfa: ${currentPage}`);

    // Sayfanın yüklenmesi için bekle
    await new Promise(r => setTimeout(r, 5000));

    // Scroll işlemi ile tüm içeriğin yüklenmesini sağla
    await autoScroll();
    
    // Profilleri topla
    const profiles = await getProfilesFromPage();

    // Önce profilleri kaydet
    chrome.runtime.sendMessage({
      type: 'SAVE_PROFILES',
      profiles: profiles,
      currentPage: currentPage
    });

    // Her sayfada CSV oluştur ve indir
    const headers = ['İsim', 'Profil URL', 'Profil Resmi URL', 'Sayfa No'];
    const rows = profiles.map(p => [
      p.name || '',
      p.profileUrl || '',
      p.imageUrl || '',
      p.page || ''
    ]);

    let csvContent = headers.join(',') + '\n';
    for (const row of rows) {
      const formattedRow = row.map(cell => {
        const cellStr = String(cell || '');
        return `"${cellStr.replace(/"/g, '""')}"`;
      });
      csvContent += formattedRow.join(',') + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    chrome.runtime.sendMessage({
      type: 'DOWNLOAD_CSV',
      url: url,
      filename: `linkedin_profiles_sayfa${currentPage}_${Date.now()}.csv`,
      profiles: profiles
    });

    // Sadece 1. ve 2. sayfadan sonra sonraki sayfaya geç
    if (currentPage < 3) {
      chrome.runtime.sendMessage({
        type: 'PAGE_COMPLETED',
        currentPage: currentPage
      });
    }

  } catch (error) {
    console.error('Hata:', error);
    chrome.runtime.sendMessage({
      type: 'STATUS',
      text: 'Hata: ' + error.message,
      error: true
    });
  }
}

// Sayfadaki profilleri toplama fonksiyonu
async function getProfilesFromPage() {
  const profiles = [];
  const currentPage = parseInt(new URL(window.location.href).searchParams.get('page')) || 1;

  // Farklı seçicileri dene
  const selectors = [
    'div.search-results-container ul.reusable-search__entity-result-list > li',
    'div.search-results-container div.entity-result',
    'div.search-results-container div[data-chameleon-result-urn]',
    'div.scaffold-layout__list-container li.reusable-search__result-container'
  ];

  let cards = [];
  for (const selector of selectors) {
    cards = Array.from(document.querySelectorAll(selector));
    if (cards.length > 0) {
      console.log(`Profiller bulundu: ${selector}`);
      break;
    }
  }

  console.log(`Sayfa ${currentPage}: Bulunan profil sayısı: ${cards.length}`);

  // Her profili işle
  for (const card of cards) {
    try {
      const nameElement = 
        card.querySelector('.entity-result__title-text a') ||
        card.querySelector('.app-aware-link span[aria-hidden]') ||
        card.querySelector('.linked-area span[aria-hidden]');

      if (!nameElement) continue;

      const titleElement = 
        card.querySelector('.entity-result__primary-subtitle') ||
        card.querySelector('.entity-result__summary');

      const locationElement = 
        card.querySelector('.entity-result__secondary-subtitle') ||
        card.querySelector('.entity-result__location');

      const imageElement =
        card.querySelector('.presence-entity__image') ||
        card.querySelector('.ivm-view-attr__img--centered') ||
        card.querySelector('img.presence-entity__image');

      // Şirket ve konum bilgisini daha detaylı çıkar
      let company = '';
      let location = '';

      if (titleElement) {
        const titleText = titleElement.textContent.trim();
        // Şirket bilgisi için farklı formatları kontrol et
        if (titleText.includes(' at ')) {
          company = titleText.split(' at ')[1].split(' · ')[0].trim();
        } else if (titleText.includes(' · ')) {
          const parts = titleText.split(' · ');
          company = parts[parts.length - 1].trim();
        }
      }

      if (locationElement) {
        location = locationElement.textContent.trim();
        // Gereksiz bilgileri temizle
        location = location.replace('Location:', '').trim();
      }

      const profile = {
        name: nameElement.textContent.trim(),
        profileUrl: (nameElement.closest('a') || nameElement.parentElement.closest('a')).href,
        imageUrl: imageElement?.src || '',
        page: currentPage
      };

      // Debug için
      console.log('İşlenen profil:', {
        raw: {
          title: titleElement?.textContent,
          location: locationElement?.textContent
        },
        processed: {
          company: company,
          location: location
        }
      });

      profiles.push(profile);
    } catch (error) {
      console.error('Profil işlenirken hata:', error);
    }
  }

  return profiles;
}

// Otomatik scroll fonksiyonu
async function autoScroll() {
  return new Promise((resolve) => {
    let lastHeight = document.documentElement.scrollHeight;
    let scrollAttempts = 0;
    const maxScrollAttempts = 5;

    const scroll = setInterval(() => {
      window.scrollTo(0, document.documentElement.scrollHeight);
      
      setTimeout(() => {
        let newHeight = document.documentElement.scrollHeight;
        scrollAttempts++;

        if (newHeight === lastHeight || scrollAttempts >= maxScrollAttempts) {
          clearInterval(scroll);
          resolve();
        }
        lastHeight = newHeight;
      }, 2000);
    }, 3000);
  });
}

// Script'i başlat
collectProfiles();