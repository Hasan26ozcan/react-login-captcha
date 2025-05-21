export const isAuthenticated = () => {
    return localStorage.getItem('authToken') !== null;
};

export const logout = () => {
    localStorage.removeItem('authToken');
};