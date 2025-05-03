import axios from 'axios';

const API_BASE_URL = 'https://front-end-task-lake.vercel.app/api/v1';

const bearerToken = 'eyJhbGciCiJIUz1iNiIsInR5cCl6lKpXVCJ9.eyJpZCl6NCwibmFtZSl6lKthbXJ1bClsImVtYWlsIjoiaGVhZG9mZmijZUBnbWFpbC5jb20iLCJhZGRyZXNzljoudWxsl.CJwaG9uZSl6ljAxOTQ1NTE4OTgiLCJyb2xlijoiTUFQQUdFUiIsImF2YXRheil6lmh0diHBzOi8vcmVzLmNsb3VkaWShenkuY29tL2Ryb3lqaXF3Zi9pbWFnZS91cGxvYWQvdjE2OTY4MnE4MjcvZG93bmxvYWRfZnZzOGJpLmpwZylsImJyYW5jaCl6MywlYnJhbmNoSW5mbyl6eyJpZCl6MywlYnJhbmNoTmFtZSl6lKhIYWQgT2ZmaWNlliwlYnJhbmNoTG9jYXRpb24iOiJCYXNodW5kaGFyYSlsImR1ZSl6MCwlYWRkcmVzcyl6lKJhc2h1bmRoYXJhIGNpdHklLCJwaG9uZSl6ljAxOTQ1NTUxODkyOClsImhvdGxpbmUiOilwMTkONTM2MzU1MiIsImVtYWlsIjoiaGVhZG9mZmijZUBnbWFpbC5jb20iLCJvcGVusG91cnMI0m51bGwsImNsb3Npbmdlb3Vycyl6bnVsbCwiaXN8ZGp1c3RtZW50Lip0cnVlLCJ0eXBlijoisGVhZE9mZmijZSJ9LCJpYXQiOjE3NDYwNDE0NzUsImV4cCl6MTc0NzMzNzQ3NX0.PUQfy4Vc2OorR6Yc9JO6iePwIXi20q0MPpcIDxGtbsk';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
    },
});

export const searchProduct = async (sku: string) => {
    try {
        const response = await api.get(`/purchase/get-purchase-single?search=${sku}`);
        return response.data;
    } catch (error) {
        console.error('Error searching product:', error);
        throw error;
    }
};

export const getEmployees = async () => {
    try {
        const response = await api.get('/employee/get-employee-all');
        return response.data;
    } catch (error) {
        console.error('Error fetching employees:', error);
        throw error;
    }
};

export const getAccounts = async () => {
    try {
        const response = await api.get('/account/get-accounts?type=All');
        return response.data;
    } catch (error) {
        console.error('Error fetching accounts:', error);
        throw error;
    }
};

export const createSell = async (sellData: any) => {
    try {
        const response = await api.post('/sell/create-sell', sellData);
        return response.data;
    } catch (error) {
        console.error('Error creating sell:', error);
        throw error;
    }
};