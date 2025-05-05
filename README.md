
# React Login Mock

Bu proje, Vite + React + Tailwind kullanılarak hazırlanmış bir **login** arayüzü içerir.

## Hızlı Başlangıç

```bash
npm install
npm run dev
```

Tarayıcıda otomatik olarak `http://localhost:5173` açılır.  
Bu modda **gerçek API çağrısı yapılmaz**; `.env` dosyası tanımlanmadığı için *mock* modda çalışır ve sadece tasarımı görmenizi sağlar.

## Gerçek API'ye Bağlanmak

1. Proje köküne `.env` dosyası oluşturun:

```
VITE_API_URL=http://localhost:8080/bm470_captcha_war_exploded/
```

2. Sunucunuzu başlatın.
3. Tekrar `npm run dev` komutunu çalıştırın.

Artık form gönderildiğinde gerçek API'ye `POST` isteği atılacaktır.

## Captcha Görseli

Captcha görseli için:
* Varsayılan olarak `https://via.placeholder.com/200x70.png?text=CAPTCHA` kullanılır.
* Gerçek servise geçiş yapmak için `.env` dosyasına aşağıyı ekleyin:

```
VITE_CAPTCHA_URL=http://docker-api-endpoint/captcha?id=123
```
