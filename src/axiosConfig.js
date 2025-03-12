import axios from 'axios'

const axiosClient = axios.create({
  baseURL: 'https://edu.vitinhnguyenkim.com.vn/api',
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
const imageBaseUrl = 'https://edu.vitinhnguyenkim.com.vn/'
const mainUrl = 'https://edu.vitinhnguyenkim.com.vn/'

export { axiosClient, imageBaseUrl, mainUrl }
