import React, { createContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../apis/axiosInstance'

const TenantContext = createContext()

const Tenant = ({ children }) => {
  const [users, setUser] = useState([])
  const [userPermissions, setUserPermissions] = useState([])
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)
  let [token, setToken] = useState(localStorage.getItem('token'))
  const navigate = useNavigate()

  const login = async (credentials) => {
    setLoading(true)
    try {
      const result = await api.post('tenant/login', credentials)
      if (result.status === 200) {
        setUserPermissions(result.data.data.permissions)
        localStorage.setItem('token', result.data.data.token)
        setToken(result.data.data.token)
        setPermissionsLoaded(true)
        setMessage(result.data.message)
        navigate('/tenant/user/get')
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const getUsers = async () => {
    try {
      const result = await api.get('tenant/user')
      if (result.status === 200) {
        setUser(result.data.data)
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to fetch users')
    }
  }

  const getPermision = async () => {
    const currentToken = localStorage.getItem('token')
    if (!currentToken) {
      setLoading(false)
      setPermissionsLoaded(true)
      return
    }

    setLoading(true)
    try {
      const result = await api.get('tenant/permission')
      if (result.status === 200) {
        setUserPermissions(result.data.permissions)
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token')
        setToken(null)
        navigate('/login')
      }

      setMessage(error.response?.data?.message || 'Failed to fetch permissions')
    } finally {
      setLoading(false)
      setPermissionsLoaded(true)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUserPermissions([])
    setPermissionsLoaded(false)
    navigate('/login')
  }

  useEffect(() => {
    const token = localStorage.getItem('token')

    if (token) {
      getPermision()
    } else {
      setLoading(false)
      setPermissionsLoaded(true)
    }
  }, [])

  return (
    <TenantContext.Provider
      value={{
        login,
        getUsers,
        getPermision,
        logout,
        userPermissions,
        message,
        users,
        loading,
        permissionsLoaded,
        token,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export { Tenant, TenantContext }
