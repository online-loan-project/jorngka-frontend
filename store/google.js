import googleService from '~/services/GoogleService.js';
import { useCookies } from 'vue3-cookies';
import { ElMessage } from 'element-plus';
import { defineStore } from 'pinia';

const googleAuthService = googleService.getInstance();

export const useGoogleAuthStore = defineStore('google-auth', () => {
  const { cookies } = useCookies();
  const user = ref(null);
  const token = ref(null);

  //handleGoogleCallback
  const handleGoogleCallback = async (code) => {
    try {
      const data = await googleAuthService.callBack(code);
      const { data: userData, token: authToken } = data || {};
      if (!userData) {
        throw new Error('User data not found');
      }

      if (!authToken) {
        throw new Error('Invalid Credentials');
      }

      user.value = userData;
      token.value = authToken;

      const cookieOptions = { secure: true, sameSite: 'Strict' };
      cookies.set('access_token', authToken, cookieOptions);
      cookies.set('user', JSON.stringify(userData), cookieOptions);
      cookies.set('tokenType', 'Bearer', cookieOptions);

      return data;
    } catch (error) {
      ElMessage.error(error.message || 'Login failed');
      throw new Error(`Login failed: ${error.message || 'Unknown error'}`);
    }
  };

  return {
    user: computed(() => user.value), // Computed getter for user
    token,
    handleGoogleCallback,

  };
});