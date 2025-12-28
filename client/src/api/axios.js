import axios from 'axios';
import Cookies from 'js-cookie';

const instance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3636/api',
});

instance.interceptors.request.use((config) => {
    const cookieToken = Cookies.get('token');
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const token = cookieToken || localToken;
    
    console.log('🔍 Axios Interceptor Debug:', {
        url: config.url,
        cookieToken: cookieToken ? cookieToken.substring(0, 20) + '...' : 'NO COOKIE',
        localToken: localToken ? localToken.substring(0, 20) + '...' : 'NO LOCAL',
        usingToken: token ? 'YES' : 'NO'
    });
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default instance;