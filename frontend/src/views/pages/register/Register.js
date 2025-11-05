import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilEnvelopeOpen } from '@coreui/icons'
import { useFormik } from 'formik'
import * as Yup from 'yup'

const Register = () => {
  const [plans, setPlans] = useState([])

  //  Simulate fetching plans (you can replace with API call)
  useEffect(() => {
    const planOptions = [
      { id: 101, name: 'Basic Plan' },
      { id: 102, name: 'Standard Plan' },
      { id: 103, name: 'Premium Plan' },
    ]
    setPlans(planOptions)
  }, [])

  //  Formik setup
  const formik = useFormik({
    initialValues: {
      restaurant_name: '',
      subdomain: '',
      email: '',
      password: '',
      plan_id: '',
    },
    validationSchema: Yup.object({
      restaurant_name: Yup.string().required('Restaurant name is required'),
      subdomain: Yup.string().required('Subdomain is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      plan_id: Yup.number().required('Please select a plan'),
    }),
    onSubmit: (values) => {
      console.log('Registration Data:', values)
      // You can make API call here
    },
  })

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={formik.handleSubmit}>
                  <h1>Register Tenant</h1>
                  <p className="text-body-secondary">Create your restaurant account</p>

                  {/* Restaurant Name */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      type="text"
                      name="restaurant_name"
                      placeholder="Restaurant Name"
                      value={formik.values.restaurant_name}
                      onChange={formik.handleChange}
                    />
                  </CInputGroup>
                  {formik.errors.restaurant_name && (
                    <div className="text-danger mb-2">{formik.errors.restaurant_name}</div>
                  )}

                  {/* Subdomain */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>🌐</CInputGroupText>
                    <CFormInput
                      type="text"
                      name="subdomain"
                      placeholder="Subdomain (e.g. kpbk)"
                      value={formik.values.subdomain}
                      onChange={formik.handleChange}
                    />
                  </CInputGroup>
                  {formik.errors.subdomain && (
                    <div className="text-danger mb-2">{formik.errors.subdomain}</div>
                  )}

                  {/* Email */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilEnvelopeOpen} />
                    </CInputGroupText>
                    <CFormInput
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                    />
                  </CInputGroup>
                  {formik.errors.email && (
                    <div className="text-danger mb-2">{formik.errors.email}</div>
                  )}

                  {/* Password */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                    />
                  </CInputGroup>
                  {formik.errors.password && (
                    <div className="text-danger mb-2">{formik.errors.password}</div>
                  )}

                  {/* Plan Dropdown */}
                  <CInputGroup className="mb-3">
                    <CInputGroupText>📦</CInputGroupText>
                    <CFormSelect
                      name="plan_id"
                      value={formik.values.plan_id}
                      onChange={formik.handleChange}
                    >
                      <option value="">Select Plan</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name}
                        </option>
                      ))}
                    </CFormSelect>
                  </CInputGroup>
                  {formik.errors.plan_id && (
                    <div className="text-danger mb-2">{formik.errors.plan_id}</div>
                  )}

                  {/* Submit Button */}
                  <div className="d-grid">
                    <CButton color="success" type="submit">
                      Register
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

export default Register
