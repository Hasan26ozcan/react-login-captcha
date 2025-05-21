import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCw, Trash2, PlusCircle, LogOut } from 'lucide-react';
import { logout } from '../utils/auth';

const SINGLE_CAPTCHA_URL = import.meta.env.VITE_CAPTCHA_URL;
const LIST_CAPTCHA_URL = 'http://localhost:8080/Bm470Captcha/api/captcha/list';
const CREATE_CAPTCHA_URL = 'http://localhost:8080/Bm470Captcha/api/captchas/generate';

export default function AdminPanel() {
    const [captchaImage, setCaptchaImage] = useState('');
    const [captchaId, setCaptchaId] = useState(null);
    const [loadingSingle, setLoadingSingle] = useState(false);
    const [messageSingle, setMessageSingle] = useState('');

    const [captchas, setCaptchas] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [messageList, setMessageList] = useState('');
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [language, setLanguage] = useState('tr');

    const navigate = useNavigate();
    const totalPages = Math.ceil(totalCount / size);

    const refreshCaptcha = async () => {
        setLoadingSingle(true);
        setMessageSingle('');
        try {
            const res = await fetch(SINGLE_CAPTCHA_URL, {
                headers: { 'Accept-Language': language }
            });
            if (!res.ok) throw new Error('Sunucudan hata döndü');
            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Captcha hatası');
            setCaptchaImage(`data:image/png;base64,${data.captchaImage}`);
            setCaptchaId(data.captchaId);
        } catch (err) {
            setMessageSingle((language === 'tr' ? 'Hata: ' : 'Error: ') + err.message);
        } finally {
            setLoadingSingle(false);
        }
    };

    const fetchCaptchas = async (pageNum = 0, pageSize = size) => {
        if (pageNum < 0) return;
        setLoadingList(true);
        setMessageList('');
        try {
            const res = await fetch(`${LIST_CAPTCHA_URL}?page=${pageNum}&size=${pageSize}`, {
                headers: { 'Accept-Language': language }
            });
            if (!res.ok) throw new Error(language === 'tr' ? 'Liste sunucudan hata döndü' : 'List fetch failed');
            const data = await res.json();
            if (!data.captchas) throw new Error(language === 'tr' ? 'API beklenen formatta liste döndürmedi' : 'API did not return expected list format');

            setCaptchas(data.captchas);
            setTotalCount(data.totalCount || 0);
            setPage(pageNum);
            setSize(pageSize);
        } catch (err) {
            setMessageList((language === 'tr' ? 'Hata: ' : 'Error: ') + err.message);
        } finally {
            setLoadingList(false);
        }
    };

    const deleteCaptcha = async (id) => {
        if (!window.confirm(language === 'tr' ? 'Bu captchayı silmek istediğinize emin misiniz?' : 'Are you sure to delete this captcha?')) return;

        try {
            const res = await fetch(`http://localhost:8080/Bm470Captcha/api/captcha/delete/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error(language === 'tr' ? 'Silme işlemi başarısız oldu' : 'Delete failed');
            fetchCaptchas(page, size);
        } catch (err) {
            alert((language === 'tr' ? 'Silme hatası: ' : 'Delete error: ') + err.message);
        }
    };

    const createCaptcha = async () => {
        try {
            const res = await fetch(CREATE_CAPTCHA_URL, {
                method: 'POST',
            });
            if (!res.ok) throw new Error(language === 'tr' ? 'Captcha oluşturulamadı' : 'Captcha creation failed');
            fetchCaptchas(page, size);
            alert(language === 'tr' ? 'Yeni captcha başarıyla oluşturuldu!' : 'New captcha created successfully!');
        } catch (err) {
            alert((language === 'tr' ? 'Captcha oluşturma hatası: ' : 'Captcha creation error: ') + err.message);
        }
    };

    const handleSizeChange = (e) => {
        const newSize = parseInt(e.target.value, 10);
        fetchCaptchas(0, newSize);
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    useEffect(() => {
        refreshCaptcha();
        fetchCaptchas(0, size);
    }, [language]);

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                    <div className="flex justify-between items-center">
                        <h1 className="text-2xl font-bold">
                            {language === 'tr' ? 'Admin Paneli' : 'Admin Panel'}
                        </h1>
                        <div className="flex items-center space-x-4">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="bg-blue-700 text-white border-none rounded px-3 py-1 focus:ring-2 focus:ring-white"
                            >
                                <option value="tr">🇹🇷 Türkçe</option>
                                <option value="en">🇬🇧 English</option>
                            </select>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                <LogOut size={18} />
                                <span>{language === 'tr' ? 'Çıkış Yap' : 'Logout'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-6 space-y-8">
                    {/* Single Captcha Section */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            {language === 'tr' ? 'Tek Captcha Görüntüle' : 'Single Captcha View'}
                        </h2>
                        <div className="flex flex-col items-center">
                            {captchaImage && (
                                <img
                                    src={captchaImage}
                                    alt="Captcha"
                                    className="mb-4 border border-gray-300 rounded-lg shadow-sm"
                                    width={250}
                                    height={80}
                                />
                            )}
                            <button
                                onClick={refreshCaptcha}
                                disabled={loadingSingle}
                                className={`px-5 py-2 rounded-lg flex items-center gap-2 ${
                                    loadingSingle
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                } text-white transition-colors`}
                            >
                                {loadingSingle ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {language === 'tr' ? 'Yenileniyor...' : 'Refreshing...'}
                                    </>
                                ) : (
                                    <>
                                        <RotateCw size={18} />
                                        {language === 'tr' ? 'Yenile' : 'Refresh'}
                                    </>
                                )}
                            </button>
                            {messageSingle && (
                                <div className={`mt-3 px-4 py-2 rounded-lg ${
                                    messageSingle.includes('Hata') || messageSingle.includes('Error')
                                        ? 'bg-red-100 text-red-700'
                                        : 'bg-green-100 text-green-700'
                                }`}>
                                    {messageSingle}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Captcha List Section */}
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {language === 'tr' ? 'Captcha Listesi' : 'Captcha List'}
                            </h2>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <label htmlFor="pageSize" className="mr-2 text-sm font-medium text-gray-700">
                                        {language === 'tr' ? 'Sayfa başı:' : 'Per page:'}
                                    </label>
                                    <select
                                        id="pageSize"
                                        value={size}
                                        onChange={handleSizeChange}
                                        className="border border-gray-300 rounded-md px-3 py-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {[5, 10, 20, 50].map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={createCaptcha}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                >
                                    <PlusCircle size={18} />
                                    {language === 'tr' ? 'Yeni Captcha' : 'New Captcha'}
                                </button>
                            </div>
                        </div>

                        {loadingList ? (
                            <div className="flex justify-center items-center py-10">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <>
                                {messageList && (
                                    <div className="mb-4 px-4 py-3 bg-red-100 text-red-700 rounded-lg">
                                        {messageList}
                                    </div>
                                )}

                                {captchas.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">
                                        {language === 'tr' ? 'Listede captcha bulunamadı.' : 'No captchas found.'}
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {language === 'tr' ? 'Captcha' : 'Captcha'}
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {language === 'tr' ? 'Metin' : 'Text'}
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    {language === 'tr' ? 'İşlemler' : 'Actions'}
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                            {captchas.map(({ id, textValue, image }) => (
                                                <tr key={id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <img
                                                            src={`data:image/png;base64,${image}`}
                                                            alt={`Captcha ${textValue}`}
                                                            className="h-10 border border-gray-200 rounded"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-mono">
                                                        {textValue}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <button
                                                            onClick={() => deleteCaptcha(id)}
                                                            className="text-red-600 hover:text-red-900 flex items-center justify-end gap-1"
                                                        >
                                                            <Trash2 size={18} />
                                                            <span>{language === 'tr' ? 'Sil' : 'Delete'}</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mt-6">
                                    <button
                                        onClick={() => fetchCaptchas(page - 1, size)}
                                        disabled={page <= 0}
                                        className={`px-4 py-2 rounded-md ${page <= 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                                    >
                                        {language === 'tr' ? 'Önceki' : 'Previous'}
                                    </button>
                                    <span className="text-sm text-gray-700">
                                        {language === 'tr' ? 'Sayfa' : 'Page'} <strong>{page + 1}</strong> {language === 'tr' ? 'of' : 'of'} <strong>{totalPages || 1}</strong>
                                    </span>
                                    <button
                                        onClick={() => fetchCaptchas(page + 1, size)}
                                        disabled={page + 1 >= totalPages}
                                        className={`px-4 py-2 rounded-md ${page + 1 >= totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                                    >
                                        {language === 'tr' ? 'Sonraki' : 'Next'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}