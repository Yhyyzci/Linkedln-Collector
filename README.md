# LinkedIn Profile Collector

LinkedIn arama sonuçlarından profil verilerini toplayan Chrome eklentisi.

## Özellikler
- İlk 3 sayfadaki profilleri otomatik toplama
- Her sayfa için ayrı CSV dosyası oluşturma
- Profil bilgilerini detaylı kaydetme:
  - İsim
  - Ünvan
  - Konum
  - Profil URL
  - Profil Resmi URL
  - Sayfa Numarası
- Otomatik sayfa geçişi
- Scroll ile tüm içeriği yükleme

## Kurulum
1. Projeyi bilgisayarınıza indirin
2. Chrome tarayıcısında `chrome://extensions/` adresine gidin
3. Sağ üstten "Geliştirici modu"nu aktif edin
4. "Load unpacked" (Paketlenmemiş öğe yükle) butonuna tıklayın
5. İndirdiğiniz proje klasörünü seçin

## Kullanım
1. LinkedIn'e giriş yapın
2. People search sayfasına gidin ve arama yapın
3. Chrome uzantılar menüsünden eklentiyi açın
4. "Profilleri Topla" butonuna tıklayın
5. Her sayfa için ayrı CSV dosyası indirilecektir

## Teknik Detaylar
- Chrome Extension Manifest V3 kullanıldı
- Content script ile profil verilerini toplama
- Background script ile CSV indirme işlemi
- Popup ile kullanıcı arayüzü
- Asenkron işlemler için Promise yapısı
- Otomatik scroll ve sayfa geçişleri

## Dosya Yapısı 