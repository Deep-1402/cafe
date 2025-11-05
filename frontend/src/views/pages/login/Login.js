import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import { TenantContext } from '../../../context/tenent'
// import { useDispatch, useSelector } from 'react-redux'
// import { login } from '../../../slices/auth'

// Yup validation schema
// const validationSchema =

const Login = () => {
  // const [message , setMessage ] = useState(null)
  // let { message, status } = useSelector((state) => state.auth)
  // const dispatch = useDispatch()
  const { login, userPermissions , message} = useContext(TenantContext)

  //  useFormik hook
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      console.log('Login form submitted:', values)
      // Here you can handle actual login API call
      await login(values)
      // console.log(userPermissions, "ss")
    },
  })
  // useEffect(() => {
  //   if (userPermissions) {
  //     console.log('Permissions updated:', userPermissions)
  //     // e.g. navigate('/tenant/users/get')
  //   }
  // }, [userPermissions])

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  {/*  Formik form */}
                  <CForm onSubmit={formik.handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>

                    {/*  Email Input */}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        name="email"
                        placeholder="Email"
                        autoComplete="username"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                      />
                    </CInputGroup>
                    {formik.errors.email && (
                      <div className="text-danger mb-2">{formik.errors.email}</div>
                    )}

                    {/*  Password Input */}
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        name="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={formik.values.password}
                        onChange={formik.handleChange}
                      />
                    </CInputGroup>
                    {formik.errors.password && (
                      <div className="text-danger mb-2">{formik.errors.password}</div>
                    )}
                    {message && <div className="text-danger mb-2">{message}</div>}

                    {/*  Buttons */}
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>

              {/*  Right-side card */}
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
