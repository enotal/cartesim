import axios from 'axios'
import { isAuthenticated } from './Auth'

//const API_BASE_URL = 'http://localhost:8000/api/'
const API_BASE_URL = 'https://apicartesim.uv.bf/api/'

// login
export const login = async (resourceData) => {
  try {
    const response = await axios.post(API_BASE_URL + 'login', resourceData) 
    return response.data
  } catch (error) {
    return error.response
  }
}

// logout
export const logout = async (resourceData) => {
  const auth = isAuthenticated()
  try {
    const response = await axios.post(API_BASE_URL + 'logout', resourceData, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
    return response.data
  } catch (error) {
    return error.response
  }
}

// List
export const getData = async (apiResource) => {
  const auth = isAuthenticated()
  try {
    const response = await axios.get(API_BASE_URL + apiResource, {
      // withCredentials: true, // For cookies,
      headers: {
        Authorization: auth ? `Bearer ${auth.token}` : '',
      },
    })
    if (response.data.data) {
      return response.data.data
    } else if (response.data) {
      return response.data
    } else {
      return response
    }
  } catch (error) {
    return error.response
  }
}

// Show
export const getItem = async (apiResource) => {
  const auth = isAuthenticated()
  try {
    const response = await axios.get(API_BASE_URL + apiResource, {
      // withCredentials: true, // For cookies,
      headers: {
        Authorization: auth ? `Bearer ${auth.token}` : '',
      },
    })
    return response.data
  } catch (error) {
    return error.response
  }
}

// get by
export const getItemBy = async (apiResource, resourceData) => {
  const auth = isAuthenticated()
  try {
    const response = await axios.post(API_BASE_URL + apiResource, resourceData, {
      // withCredentials: true, // For cookies,
      headers: {
        Authorization: auth ? `Bearer ${auth.token}` : '',
      },
    })
    return response.data
  } catch (error) {
    return error.response
  }
}

//=== Guest : getItemBy, Store
export const guestGetItemBy = async (apiResource, resourceData) => {
  try {
    const response = await axios.post(API_BASE_URL + apiResource, resourceData)
    return response.data
  } catch (error) {
    return error.response
  }
}
export const guestCreateItem = async (apiResource, resourceData) => {
  try {
    const response = await axios.post(API_BASE_URL + apiResource, resourceData)
    return response.data
  } catch (error) {
    return error.response
  }
}
//===

// Store
export const createItem = async (apiResource, resourceData) => {
  const auth = isAuthenticated()
  try {
    const response = await axios.post(API_BASE_URL + apiResource, resourceData, {
      // withCredentials: true, // For cookies,
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
    return response.data
  } catch (error) {
    return error.response
  }
}

// Update
export const updateItem = async (apiResource, resourceData) => {
  const auth = isAuthenticated()
  try {
    const response = await axios.patch(API_BASE_URL + apiResource, resourceData, {
      // withCredentials: true, // For cookies,
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    })
    return response.data
  } catch (error) {
    return error.response
  }
}

export const guestUpdateItem = async (apiResource, resourceData) => {
  try {
    const response = await axios.patch(API_BASE_URL + apiResource, resourceData)
    return response.data
  } catch (error) {
    return error.response
  }
}

// Delete
export const deleteItem = async (apiResource) => {
  const auth = isAuthenticated()
  try {
    const response = await axios.delete(API_BASE_URL + apiResource, {
      // withCredentials: true, // For cookies,
      headers: {
        Authorization: auth && `Bearer ${auth.token}`,
      },
    })
    return response.data
  } catch (error) {
    return error.response
  }
}

export const getDashboardData = async (apiResource, resourceData) => {
  try {
    const response = await axios.post(API_BASE_URL + apiResource, resourceData)
    return response.data
  } catch (error) {
    return error.response
  }
}
