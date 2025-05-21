import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCw } from 'lucide-react';

const CAPTCHA_URL = import.meta.env.VITE_CAPTCHA_URL;

const translations = {
  tr: {
    title: 'Giriş Yap',
    username: 'Kullanıcı Adı',
    password: 'Şifre',
    captcha: 'Captcha',
    placeholderUsername: 'Kullanıcı adınızı girin',
    placeholderPassword: 'Şifrenizi girin',
    placeholderCaptcha: 'Captcha kodunu girin',
    submit: 'Giriş',
    loading: 'Gönderiliyor...',
    success: 'Giriş başarılı!',
    error: 'Giriş başarısız',
    captchaError: 'Captcha yanlış!',
    reload: 'Yenile',
    selectLanguage: 'Dil Seçin'
  },
  en: {
    title: 'Login',
    username: 'Username',
    password: 'Password',
    captcha: 'Captcha',
    placeholderUsername: 'Enter your username',
    placeholderPassword: 'Enter your password',
    placeholderCaptcha: 'Enter captcha code',
    submit: 'Login',
    loading: 'Submitting...',
    success: 'Login successful!',
    error: 'Login failed',
    captchaError: 'Captcha is incorrect!',
    reload: 'Reload',
    selectLanguage: 'Select Language'
  }
};

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '', captcha: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaId, setCaptchaId] = useState(null);
  const [locale, setLocale] = useState(navigator.language.startsWith('en') ? 'en' : 'tr');

  const t = translations[locale];
  const navigate = useNavigate();

  const refreshCaptcha = async () => {
    try {
      const res = await fetch(CAPTCHA_URL, {
        headers: { 'Accept-Language': locale },
      });
      if (!res.ok) throw new Error('Sunucudan hata döndü');
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Captcha hatası');
      setCaptchaImage(`data:image/png;base64,${data.captchaImage}`);
      setCaptchaId(data.captchaId);
    } catch (err) {
      setMessage(t.error + ': ' + err.message);
    }
  };

  useEffect(() => {
    refreshCaptcha();
  }, [locale]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const captchaRes = await fetch('http://localhost:8080/Bm470Captcha/api/captcha/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept-Language': locale,
        },
        body: new URLSearchParams({
          captchaId: captchaId,
          captchaInput: form.captcha,
        }),
      });

      const captchaData = await captchaRes.json();
      if (!captchaData.success) throw new Error(t.captchaError);

      const loginRes = await fetch('http://localhost:8080/Bm470Captcha/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept-Language': locale,
        },
        body: new URLSearchParams({
          username: form.username,
          password: form.password,
        }),
      });

      const loginData = await loginRes.json();
      if (!loginData.success) throw new Error(loginData.message || t.error);

      localStorage.setItem('authToken', loginData.token || 'authenticated');
      navigate('/admin', { replace: true });

    } catch (err) {
      setMessage(t.error + ': ' + err.message);
    } finally {
      setLoading(false);
      refreshCaptcha();
    }
  };

  return (
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
          >
            <option value="tr">🇹🇷 Türkçe</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">{t.username}</label>
            <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder={t.placeholderUsername}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t.password}</label>
            <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={t.placeholderPassword}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              {t.captcha}
              <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800"
                  onClick={refreshCaptcha}
                  title={t.reload}
              >
                <RotateCw size={18}/>
              </button>
            </label>

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
                placeholder={t.placeholderCaptcha}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? t.loading : t.submit}
          </button>
        </form>

        {message && (
            <p
                className={`mt-4 text-center text-sm ${
                    message.includes('başarılı') || message.includes('successful')
                        ? 'text-green-600'
                        : 'text-red-500'
                }`}
            >
              {message}
            </p>
        )}
      </div>
  );
}