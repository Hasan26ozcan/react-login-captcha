import { useState, useEffect } from 'react';
import { RotateCw } from 'lucide-react';

const CAPTCHA_URL = import.meta.env.VITE_CAPTCHA_URL;

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '', captcha: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaId, setCaptchaId] = useState(null);
  const [locale, setLocale] = useState(navigator.language || 'tr'); // Tarayıcı dilini kullan, varsayılan 'tr'

  // Captcha yenileme fonksiyonu
  const refreshCaptcha = async () => {
    try {
      const res = await fetch(CAPTCHA_URL, {
        headers: {
          'Accept-Language': locale, // locale'yi header olarak gönder
        },
      });
      if (!res.ok) throw new Error('Sunucudan hata döndü');

      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Bilinmeyen captcha hatası');

      setCaptchaImage(`data:image/png;base64,${data.captchaImage}`);
      setCaptchaId(data.captchaId);
    } catch (err) {
      setMessage('Captcha yüklenirken hata oluştu: ' + err.message);
    }
  };

  useEffect(() => {
    refreshCaptcha(); // İlk açılışta captcha çek
  }, [locale]); // locale değiştiğinde captcha'yı yenile

  // Form değişiklikleri
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Submit işlemi
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Önce captcha doğrula
      const captchaRes = await fetch(
          'http://localhost:8080/Bm470Captcha/api/captcha/validate',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept-Language': locale, // locale header'ı ekle
            },
            body: new URLSearchParams({
              captchaId: captchaId,
              captchaInput: form.captcha,
            }),
          }
      );

      const captchaData = await captchaRes.json();
      if (!captchaData.success) {
        throw new Error('Captcha yanlış!');
      }

      // Giriş isteği gönder
      const loginRes = await fetch(
          'http://localhost:8080/Bm470Captcha/api/user/login',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept-Language': locale, // locale header'ı ekle
            },
            body: new URLSearchParams({
              username: form.username,
              password: form.password,
            }),
          }
      );

      const loginData = await loginRes.json();
      if (!loginData.success) {
        throw new Error(loginData.message || 'Giriş başarısız');
      }

      setMessage(loginData.message || 'Giriş başarılı!');
    } catch (err) {
      setMessage('Giriş başarısız: ' + err.message);
    } finally {
      setLoading(false);
      refreshCaptcha(); // Başarısız olsa da captcha yenile
    }
  };

  return (
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Giriş Yap</h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Kullanıcı Adı */}
          <div>
            <label className="block text-sm font-medium mb-1">Kullanıcı Adı</label>
            <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Kullanıcı adınızı girin"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Şifre */}
          <div>
            <label className="block text-sm font-medium mb-1">Şifre</label>
            <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Şifrenizi girin"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Captcha */}
          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              Captcha
              <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={refreshCaptcha}
                  title="Yenile"
              >
                <RotateCw size={18} />
              </button>
            </label>

            {/* Captcha Görseli */}
            {captchaImage && (
                <img
                    src={captchaImage}
                    alt="Captcha"
                    className="mb-2 rounded border"
                    width={200}
                    height={70}
                />
            )}

            <input
                type="text"
                name="captcha"
                value={form.captcha}
                onChange={handleChange}
                placeholder="Captcha kodunu girin"
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gönder Butonu */}
          <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? 'Gönderiliyor...' : 'Giriş'}
          </button>
        </form>

        {message && (
            <p
                className={`mt-4 text-center text-sm ${
                    message.includes('başarılı') ? 'text-green-600' : 'text-red-500'
                }`}
            >
              {message}
            </p>
        )}
      </div>
  );
}
