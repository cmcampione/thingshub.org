import axios from 'axios';

export default class AuthorizationHelper {

    authTokenRequest: Promise<any>;

    resetGetAccessTokenRequest() {
        this.authTokenRequest = null;
    }

    refreshToken(refreshToken: string): Promise<any> {

        return axios.post('/api/token/refresh',
            {
                refreshToken: refreshToken
            });
    }

    getNewAccessToken() {

        const refreshToken = window.localStorage.getItem('refreshToken');

        if (!this.authTokenRequest) {
            this.authTokenRequest = this.refreshToken(refreshToken);
            this.authTokenRequest.then(response => {
                this.resetGetAccessTokenRequest();
            }).catch(error => {
                this.resetGetAccessTokenRequest();
            });
        }

        return this.authTokenRequest;
    }

    registerAxiosInterceptor() {

        axios.interceptors.response.use((response) => {
            return response;
        },
        err => {
            const error = err.response;
            if (error && error.status === 401 && error.config && !error.config.__isRetryRequest) {

                return this.getNewAccessToken().then(response => {

                    error.config.__isRetryRequest = true;

                    // set new access token after refreshing it
                    axios.defaults.headers.common['Authorization'] = `Bearer ${response.access_token}`;
                    error.config.headers['Authorization'] = `Bearer ${response.access_token}`;

                    return axios(error.config);
                }).catch(e => {

                    // refreshing has failed => redirect to login
                    // clear cookie (with logout action) and return to identityserver to new login
                    // (window as any).location = "/account/logout";

                    return Promise.reject(e);
                });
            }

            return Promise.reject(error);
        });
    }
}
