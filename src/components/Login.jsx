
import { useState, useEffect } from 'react';
import { RotateCw } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || null;            // gerçek login endpoint'i
const CAPTCHA_URL = import.meta.env.VITE_CAPTCHA_URL || 'https://via.placeholder.com/200x70.png?text=CAPTCHA';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '', captcha: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [captchaUrl, setCaptchaUrl] = useState(CAPTCHA_URL);

  // Captcha'yı yenile
  const refreshCaptcha = () => {
    // Cache busting için URL'e timestamp ekle
    setCaptchaUrl(`${CAPTCHA_URL}&_=${Date.now()}`);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (API_URL) {
        // gerçek istek
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Sunucudan hata döndü');
        }
        setMessage('Giriş başarılı!');
      } else {
        // mock mod
        await new Promise((r) => setTimeout(r, 800));
        if (form.username && form.password && form.captcha) {
          setMessage('Mock mod: Giriş başarılı!');
        } else {
          throw new Error('Tüm alanları doldurun');
        }
      }
    } catch (err) {
      setMessage('Giriş başarısız: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Form input değişimi
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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

          {/* Captcha görseli */}
          <img
            src={captchaUrl}
            alt="Captcha"
            className="mb-2 rounded border"
            width={200}
            height={70}
          />

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

        {/* Gönder butonu */}
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
