import React, { useContext, useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
  CFormCheck,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilFastfood, cilDescription, cilDollar, cilClock } from '@coreui/icons'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useNavigate, useParams } from 'react-router-dom'
import { MenuContext } from '../../../../context/menu'

const MenuForm = () => {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const {
    createDish,
    updateDish,
    getAllAvailableDishes,
    getAllCategories,
    categories,
    dishes,
    message,
    clearMessage,
  } = useContext(MenuContext)

  // Formik setup
  const formik = useFormik({
    initialValues: {
      category_id: '',
      name: '',
      description: '',
      price: '',
      preparation_time: '',
      is_vegetarian: true,
    },
    validationSchema: Yup.object({
      category_id: Yup.number().required('Please select a category'),
      name: Yup.string().required('Dish name is required'),
      description: Yup.string().required('Description is required'),
      price: Yup.number()
        .positive('Price must be positive')
        .required('Price is required')
        .test('decimal', 'Price can have maximum 2 decimal places', (value) => {
          if (value) {
            return /^\d+(\.\d{1,2})?$/.test(value.toString())
          }
          return true
        }),
      preparation_time: Yup.number()
        .positive('Preparation time must be positive')
        .integer('Preparation time must be a whole number')
        .required('Preparation time is required'),
      is_vegetarian: Yup.boolean().required(),
    }),
    onSubmit: async (values) => {
      setLoading(true)
      let result

      const payload = {
        ...values,
        price: parseFloat(values.price),
        preparation_time: parseInt(values.preparation_time),
      }

      if (isEditMode) {
        result = await updateDish(id, payload)
      } else {
        result = await createDish(payload)
      }

      setLoading(false)

      if (result.success) {
        setTimeout(() => {
          navigate('/tenant/menu/get')
        }, 1500)
      }
    },
  })

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true)
      await getAllCategories()
      setCategoriesLoading(false)
    }
    fetchCategories()
  }, [])

  // Fetch dish data if in edit mode
  useEffect(() => {
    if (isEditMode && dishes.length === 0) {
      getAllAvailableDishes()
    }

    if (isEditMode && dishes.length > 0) {
      const dish = dishes.find((d) => d.menu_id === parseInt(id))
      if (dish) {
        formik.setValues({
          category_id: dish.category_id || '',
          name: dish.name || '',
          description: dish.description || '',
          price: dish.price || '',
          preparation_time: dish.preparation_time || '',
          is_vegetarian: dish.is_vegetarian || false,
        })
      }
    }

    return () => clearMessage()
  }, [id, isEditMode, dishes])

  if (loading && isEditMode && dishes.length === 0) {
    return (
      <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center justify-content-center">
        <CSpinner color="primary" />
      </div>
    )
  }

  // Filter active categories (non-deleted)
  const activeCategories = categories.filter((cat) => !cat.deletedAt)

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={formik.handleSubmit}>
                  <h1>{isEditMode ? 'Update Menu Item' : 'Create Menu Item'}</h1>
                  <p className="text-body-secondary">
                    {isEditMode ? 'Update dish details' : 'Add a new dish to your menu'}
                  </p>

                  {message && (
                    <div className={`alert alert-info mb-3`} role="alert">
                      {message}
                    </div>
                  )}

                  {/* Category Dropdown */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>📂</CInputGroupText>
                    <CFormSelect
                      name="category_id"
                      value={formik.values.category_id}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      invalid={formik.touched.category_id && Boolean(formik.errors.category_id)}
                      disabled={categoriesLoading}
                    >
                      <option value="">
                        {categoriesLoading ? 'Loading categories...' : 'Select Category'}
                      </option>
                      {activeCategories.map((category) => (
                        <option key={category.category_id} value={category.category_id}>
                          {category.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>
                  {formik.touched.category_id && formik.errors.category_id && (
                    <div className="text-danger mb-2">{formik.errors.category_id}</div>
                  )}

                  {/* Dish Name */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilFastfood} />
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      name="name"
                      placeholder="Dish Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      invalid={formik.touched.name && Boolean(formik.errors.name)}
                    />
                  </CInputGroup>
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-danger mb-2">{formik.errors.name}</div>
                  )}

                  {/* Description */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilDescription} />
                    </CInputGroupText>
                    <CFormTextarea
                      name="description"
                      placeholder="Description"
                      rows="3"
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      invalid={formik.touched.description && Boolean(formik.errors.description)}
                    />
                  </CInputGroup>
                  {formik.touched.description && formik.errors.description && (
                    <div className="text-danger mb-2">{formik.errors.description}</div>
                  )}

                  {/* Price */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilDollar} />
                    </CInputGroupText>
                    <CFormInput
                      type="number"
                      step="0.01"
                      name="price"
                      placeholder="Price"
                      value={formik.values.price}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      invalid={formik.touched.price && Boolean(formik.errors.price)}
                    />
                  </CInputGroup>
                  {formik.touched.price && formik.errors.price && (
                    <div className="text-danger mb-2">{formik.errors.price}</div>
                  )}

                  {/* Preparation Time */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilClock} />
                    </CInputGroupText>
                    <CFormInput
                      type="number"
                      name="preparation_time"
                      placeholder="Preparation Time (minutes)"
                      value={formik.values.preparation_time}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      invalid={
                        formik.touched.preparation_time && Boolean(formik.errors.preparation_time)
                      }
                    />
                  </CInputGroup>
                  {formik.touched.preparation_time && formik.errors.preparation_time && (
                    <div className="text-danger mb-2">{formik.errors.preparation_time}</div>
                  )}

                  {/* Is Vegetarian Radio Buttons */}
                  <div className="mb-3">
                    <label className="form-label">Dish Type</label>
                    <div>
                      <CFormCheck
                        type="radio"
                        name="is_vegetarian"
                        id="vegetarian"
                        label="Vegetarian"
                        value="true"
                        checked={formik.values.is_vegetarian === true}
                        onChange={() => formik.setFieldValue('is_vegetarian', true)}
                      />
                      <CFormCheck
                        type="radio"
                        name="is_vegetarian"
                        id="non_vegetarian"
                        label="Non-Vegetarian"
                        value="false"
                        checked={formik.values.is_vegetarian === false}
                        onChange={() => formik.setFieldValue('is_vegetarian', false)}
                      />
                    </div>
                  </div>

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <CButton
                      color="secondary"
                      type="button"
                      onClick={() => navigate('/tenant/menu/get')}
                      disabled={loading}
                    >
                      Cancel
                    </CButton>
                    <CButton color="success" type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <CSpinner size="sm" className="me-2" />
                          {isEditMode ? 'Updating...' : 'Creating...'}
                        </>
                      ) : isEditMode ? (
                        'Update Menu Item'
                      ) : (
                        'Create Menu Item'
                      )}
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default MenuForm