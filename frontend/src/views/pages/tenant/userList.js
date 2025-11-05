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