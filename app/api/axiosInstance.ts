import axios, { AxiosError } from 'axios'

const baseURL = process.env.NEXT_PUBLIC_BASE_URL
const axiosOptions = {
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
}

const axiosInstance = axios.create(axiosOptions)

const api = (sendAuthorization = false) => {
  if (sendAuthorization) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('accessToken')}`
  } else {
    delete axiosInstance.defaults.headers.common['Authorization']
  }

  return axiosInstance
}

export default api

// If the access token has expired, issue a new one and retry the request
axiosInstance.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const { response, config } = error
    // If the error is not due to an expired access token, reject the promise
    // @ts-ignore
    if (!config || (!response?.data?.message?.includes('expired') && !response?.data?.message?.includes('missing'))) {
      return await Promise.reject(error)
    }

    try {
      const response = await axios.post('/auth/refresh', {}, axiosOptions)
      localStorage.setItem('accessToken', response.data.accessToken)
      config.headers['Authorization'] = `Bearer ${response.data.accessToken}`
      return await api(true).request(config) // Retry original request
    } catch (error2) {
      localStorage.removeItem('accessToken')
      localStorage.setItem('autoLogout', 'true')
      window.location.replace('/login') // Refresh token has expired, redirect to login
      return await Promise.reject(error2)
    }
  }
)
