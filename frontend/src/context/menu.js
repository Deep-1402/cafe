import React, { createContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../apis/axiosInstance'

// Create context
const MenuContext = createContext()

// Provider component
const MenuProvider = ({ children }) => {
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [dishes, setDishes] = useState([])
  const [selectedDish, setSelectedDish] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // ========== CATEGORY OPERATIONS ==========

  // Create Category
  const createCategory = async (categoryData) => {
    setLoading(true)
    try {
      const result = await api.post('catagory', categoryData)

      if (result.status === 200 || result.status === 201) {
        setMessage(result.data.message)
        setCategories((prev) => [...prev, result.data.data])
        return { success: true, data: result.data.data }
      }
    } catch (error) {
      console.error(error)
      setMessage(error.response?.data?.message || 'Failed to create category')
      return { success: false, message: error.response?.data?.message }
    } finally {
      setLoading(false)
    }
  }

  // Get All Categories
  const getAllCategories = async () => {
    setLoading(true)
    try {
      const result = await api.get('catagory')

      if (result.status === 200) {
        setCategories(result.data.data)
        return { success: true, data: result.data.data }
      }
    } catch (error) {
      console.error(error)
      setMessage(error.response?.data?.message || 'Failed to fetch categories')
      return { success: false, message: error.response?.data?.message }
    } finally {
      setLoading(false)
    }
  }

  // Get Category By ID
  const getCategoryById = async (id) => {
    setLoading(true)
    try {
      const result = await api.get(`catagory/${id}`)

      if (result.status === 200) {
        setSelectedCategory(result.data.data)
        return { success: true, data: result.data.data }
      }
    } catch (error) {
      console.error(error)
      setMessage(error.response?.data?.message || 'Failed to fetch category')
      return { success: false, message: error.response?.data?.message }
    } finally {
      setLoading(false)
    }
  }

  // Update Category
  const updateCategory = async (id, categoryData) => {
    setLoading(true)
    try {
      const result = await api.patch(`catagory/${id}`, categoryData)

      if (result.status === 200) {
        setMessage(result.data.message)
        // Update local state
        setCategories((prev) =>
          prev.map((cat) => (cat.category_id === id ? { ...cat, ...categoryData } : cat)),
        )
        return { success: true, data: result.data }
      }
    } catch (error) {
      console.error(error)
      setMessage(error.response?.data?.message || 'Failed to update category')
      return { success: false, message: error.response?.data?.message }
    } finally {
      setLoading(false)
    }
  }

  // Delete Category
  const deleteCategory = async (id) => {
    setLoading(true)
    try {
      const result = await api.delete(`catagory/${id}`)

      if (result.status === 200) {
        setMessage(result.data.message)
        // Remove from local state
        setCategories((prev) => prev.filter((cat) => cat.category_id !== id))
        return { success: true, message: result.data.message }
      }
    } catch (error) {
      console.error(error)
      setMessage(error.response?.data?.message || 'Failed to delete category')
      return { success: false, message: error.response?.data?.message }
    } finally {
      setLoading(false)
    }
  }

  // ========== MENU/DISH OPERATIONS ==========

  // Create Dish
  const createDish = async (dishData) => {
    setLoading(true)
    try {
      const result = await api.post('menu', dishData)

      if (result.status === 200 || result.status === 201) {
        setMessage(result.data.message)
        setDishes((prev) => [...prev, result.data.data])
        return { success: true, data: result.data.data }
      }
    } catch (error) {
      console.error(error)
      setMessage(error.response?.data?.message || 'Failed to create dish')
      return { success: false, message: error.response?.data?.message }
    } finally {
      setLoading(false)
    }
  }

  // Get All Available Dishes
  const getAllAvailableDishes = async () => {
    setLoading(true)
    try {
      const result = await api.get('menu')

      if (result.status === 200) {
        setDishes(result.data.data)
        setMessage(result.data.message)
        return { success: true, data: result.data.data }
      }
    } catch (error) {
      console.error(error)
      setMessage(error.response?.data?.message || 'Failed to fetch dishes')
      return { success: false, message: error.response?.data?.message }
    } finally {
      setLoading(false)
    }
  }

  // Update Dish
  const updateDish = async (id, dishData) => {
    setLoading(true)
    try {
      const result = await api.patch(`menu/${id}`, dishData)

      if (result.status === 200) {
        setMessage(result.data.message)
        // Update local state
        setDishes((prev) =>
          prev.map((dish) => (dish.menu_id === id ? { ...dish, ...dishData } : dish)),
        )
        return { success: true, data: result.data }
      }
    } catch (error) {
      console.error(error)
      setMessage(error.response?.data?.message || 'Failed to update dish')
      return { success: false, message: error.response?.data?.message }
    } finally {
      setLoading(false)
    }
  }

  // Delete Dish
  const deleteDish = async (id) => {
    setLoading(true)
    try {
      const result = await api.delete(`menu/${id}`)

      if (result.status === 200) {
        setMessage(result.data.message)
        // Remove from local state
        setDishes((prev) => prev.filter((dish) => dish.menu_id !== id))
        return { success: true, message: result.data.message }
      }
    } catch (error) {
      console.error(error)
      setMessage(error.response?.data?.message || 'Failed to delete dish')
      return { success: false, message: error.response?.data?.message }
    } finally {
      setLoading(false)
    }
  }

  // ========== UTILITY FUNCTIONS ==========

  // Clear message
  const clearMessage = () => {
    setMessage(null)
  }

  // Clear selected category
  const clearSelectedCategory = () => {
    setSelectedCategory(null)
  }

  // Clear selected dish
  const clearSelectedDish = () => {
    setSelectedDish(null)
  }

  return (
    <MenuContext.Provider
      value={{
        // Category functions
        createCategory,
        getAllCategories,
        getCategoryById,
        updateCategory,
        deleteCategory,

        // Dish functions
        createDish,
        getAllAvailableDishes,
        updateDish,
        deleteDish,

        // Utility functions
        clearMessage,
        clearSelectedCategory,
        clearSelectedDish,

        // States
        categories,
        selectedCategory,
        dishes,
        selectedDish,
        message,
        loading,
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

export { MenuProvider, MenuContext }
