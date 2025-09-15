import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const detectImage = async (imageData: FormData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/detect`, imageData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error detecting image:', error);
        throw error;
    }
};

export const healthCheck = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/health`);
        return response.data;
    } catch (error) {
        console.error('Error checking health:', error);
        throw error;
    }
};