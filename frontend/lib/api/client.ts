import axios from 'axios'

const ML_API_URL = process.env.NEXT_PUBLIC_ML_API_URL || 'http://localhost:8000/api/v1'

export const mlApi = axios.create({
  baseURL: ML_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
})

// Request interceptor for adding auth token if needed
mlApi.interceptors.request.use(
  (config) => {
    // Add auth token if available
    // const token = localStorage.getItem('access_token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling errors
mlApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data)
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error:', error.message)
    } else {
      // Something else happened
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export const getStandings = async () => {
    const response = await mlApi.get('/standings');
    return response.data;
}

export const getPlayers = async () => {
    const response = await mlApi.get('/players');
    return response.data;
}

export const getTeam = async (teamId: string) => {
    const response = await mlApi.get(`/team/${teamId}?season=2025-26`);
    return response.data;
}

export const getPlayer = async (playerId: string) => {
    const response = await mlApi.get(`/player/${playerId}`);
    return response.data;
}

export default mlApi
