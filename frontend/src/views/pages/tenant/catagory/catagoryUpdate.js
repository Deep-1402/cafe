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
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilNotes, cilDescription } from '@coreui/icons'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useNavigate, useParams } from 'react-router-dom'
import { MenuContext } from '../../../../context/menu'

const CategoryForm = () => {
  const { id } = useParams()
  const isEditMode = Boolean(id)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    createCategory,
    updateCategory,
    getCategoryById,
    message,
    clearMessage,
    selectedCategory,
  } = useContext(MenuContext)

  // Formik setup
  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Category name is required'),
      description: Yup.string().required('Description is required'),
    }),
    onSubmit: async (values) => {
      setLoading(true)
      let result

      if (isEditMode) {
        result = await updateCategory(id, values)
      } else {
        result = await createCategory(values)
      }

      setLoading(false)

      if (result.success) {
        setTimeout(() => {
          navigate('/tenant/catagory/get')
        }, 1500)
      }
    },
  })

  // Fetch category data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchCategory = async () => {
        setLoading(true)
        const result = await getCategoryById(id)
        setLoading(false)

        if (result.success) {
          formik.setValues({
            name: result.data.name || '',
            description: result.data.description || '',
          })
        } else {
          navigate('/tenant/catagory/get')
        }
      }
      fetchCategory()
    }

    return () => clearMessage()
  }, [id, isEditMode])

  if (loading && isEditMode) {
    return (
      <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center justify-content-center">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={formik.handleSubmit}>
                  <h1>{isEditMode ? 'Update Category' : 'Create Category'}</h1>
                  <p className="text-body-secondary">
                    {isEditMode ? 'Update category details' : 'Create a new menu category'}
                  </p>

                  {message && (
                    <div className={`alert alert-info mb-3`} role="alert">
                      {message}
                    </div>
                  )}

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilNotes} />
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      name="name"
                      placeholder="Category Name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      invalid={formik.touched.name && Boolean(formik.errors.name)}
                    />
                  </CInputGroup>
                  {formik.touched.name && formik.errors.name && (
                    <div className="text-danger mb-2">{formik.errors.name}</div>
                  )}

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

                  <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                    <CButton
                      color="secondary"
                      type="button"
                      onClick={() => navigate('/tenant/catagory/get')}
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
                        'Update Category'
                      ) : (
                        'Create Category'
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

export default CategoryForm