/*
as you know i gave you all the api as and you gave me menu  context and which have catagory and menu crud i want catagory crud in one page and menu crud in other one as you know i gave you all the responce of the api so create catagpry and menu crud for me but i wil give you all pages hint 
first 
1. catagory (create and update) fields are : "name",  "description"
this is sample page start
-----------------------------------
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
this is sample page end which is register and update page and when successfully submit it shows the /tenant/catagory/get page 
--------------------------------
and when i /tenant/catagory page it shows  create page and when /tenant/catagory/101(catagoryid) it shows update page and 

now show catagpory page which is tenant/catagory/get page
and i want the catagory_id name description and in actionc(edit and delte just like sample page below permission wise) and add catagory button as insammpke below permission wise

this is catagory show page which is permisssion wise and i want permission as sample below
----------------------------------------------------------------------
this sample show  permissiom page start
import React, { useContext, useEffect, useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CBadge,
  CSpinner,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import { TenantContext } from '../../../context/tenent'

const UserList = () => {
  const { 
    getUsers, 
    message, 
    users, 
    userPermissions, 
    loading, 
    permissionsLoaded 
  } = useContext(TenantContext)
  
  const [permission, setPermission] = useState({
    canView: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  })

  const navigate = useNavigate()


  // Update permissions whenever userPermissions changes
  useEffect(() => {


    if (permissionsLoaded && userPermissions.length > 0) {
      const userModule = userPermissions.find((perm) => perm.module?.name === 'User')

      const newPermissions = {
        canView: userModule?.can_view || false,
        canCreate: userModule?.can_create || false,
        canEdit: userModule?.can_edit || false,
        canDelete: userModule?.can_delete || false,
      }
  
      setPermission(newPermissions)
    } 
  }, [userPermissions, permissionsLoaded])

  useEffect(() => {
    if (permissionsLoaded) {
      getUsers()
    }
  }, [permissionsLoaded])

  const handleAddUser = () => {
    navigate('/users/add')
  }

  const handleEdit = (userId) => {
    navigate(`/users/edit/${userId}`)
  }

  const handleDelete = (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      console.log('Delete user:', userId)
    }
  }

  // Show loading spinner while permissions are being fetched
  if (loading || !permissionsLoaded) {
    return (
      <div className="p-4 text-center">
        <CSpinner color="primary" />
        <p className="mt-2">Loading permissions...</p>
      </div>
    )
  }

  // If user doesn't have view permission, show access denied
  if (!permission.canView) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">
          You don't have permission to view users.
        </div>
        <div className="alert alert-info">
          <h5>Debug Info:</h5>
          <p>Permissions Loaded: {permissionsLoaded ? 'Yes' : 'No'}</p>
          <p>User Permissions Count: {userPermissions.length}</p>
          <pre>{JSON.stringify(userPermissions, null, 2)}</pre>
          <pre>{JSON.stringify(permission, null, 2)}</pre>
        </div>
      </div>
    )
  }
  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>User Management</h3>
        {permission.canCreate && (
          <CButton color="primary" onClick={handleAddUser}>
            <CIcon icon={cilPlus} className="me-2" />
            Add User
          </CButton>
        )}
      </div>

      {message && <div className="alert alert-info mb-3">{message}</div>}

      <CTable striped hover responsive align="middle">
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">User ID</CTableHeaderCell>
            <CTableHeaderCell scope="col">Username</CTableHeaderCell>
            <CTableHeaderCell scope="col">Email</CTableHeaderCell>
            <CTableHeaderCell scope="col">Role</CTableHeaderCell>
            <CTableHeaderCell scope="col">Status</CTableHeaderCell>
            {(permission.canEdit || permission.canDelete) && (
              <CTableHeaderCell scope="col" className="text-center">
                Actions
              </CTableHeaderCell>
            )}
          </CTableRow>
        </CTableHead>
        <CTableBody>
          {users && users.length > 0 ? (
            users.map((user, index) => (
              <CTableRow key={user.user_id}>
                <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                <CTableDataCell>{user.user_id}</CTableDataCell>
                <CTableDataCell>{user.username}</CTableDataCell>
                <CTableDataCell>{user.email}</CTableDataCell>
                <CTableDataCell>
                  <CBadge color="info">{user.role?.name || 'N/A'}</CBadge>
                </CTableDataCell>
                <CTableDataCell>
                  <CBadge color={user.is_active ? 'success' : 'secondary'}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </CBadge>
                </CTableDataCell>
                {(permission.canEdit || permission.canDelete) && (
                  <CTableDataCell className="text-center">
                    {permission.canEdit && (
                      <CButton
                        color="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(user.user_id)}
                      >
                        <CIcon icon={cilPencil} className="me-1" />
                      </CButton>
                    )}
                    {permission.canDelete && (
                      <CButton
                        color="danger"
                        size="sm"
                        onClick={() => handleDelete(user.user_id)}
                      >
                        <CIcon icon={cilTrash} className="me-1" />
                      </CButton>
                    )}
                  </CTableDataCell>
                )}
              </CTableRow>
            ))
          ) : (
            <CTableRow>
              <CTableDataCell colSpan="7" className="text-center py-4">
                No users found
              </CTableDataCell>
            </CTableRow>
          )}
        </CTableBody>
      </CTable>
    </div>
  )
}

export default UserList

this sample show  permissiom page end
-----------------------------------------------------------------------
as well as menu crud i want  as the first sample of i gave you i want exaclu like that but i want fields are "category_id"(dropdown menu get from menu context and show catgory name),"name"(dish name),"description"(dish description),"price"(price),"preparation_time"(in minute),"is_vegetarian": (radio button boolean)

and as well as lising show in second sample code but i want extra column for is_avaolable and thats where the one button like active status button on and off is_available and second time press not available and when when  this button presses the update api called and then but this button also shows permission wise also 
alwell as add menu and delete menu just like catagory 
understand if any question ask me before coding
*/