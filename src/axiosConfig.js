import axios from 'axios'

const axiosClient = axios.create({
  baseURL: 'http://192.168.245.190:8085/api',
  headers: {
    'Content-Type': 'application/json',
    Authorization: localStorage.getItem('quizToken')
      ? `Bearer ${localStorage.getItem('quizToken')}`
      : '',
  },
})

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('quizToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Configuration for images
const imageBaseUrl = 'http://192.168.245.190:8085/'
const mainUrl = 'http://192.168.245.190:8085/'

export { axiosClient, imageBaseUrl, mainUrl }
