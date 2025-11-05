import React, { useContext, useEffect, useState } from 'react'
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CSpinner,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilPlus, cilPencil, cilTrash } from '@coreui/icons'
import { MenuContext } from '../../../../context/menu'
import { TenantContext } from '../../../../context/tenent'

const CategoryList = () => {
  const {
    getAllCategories,
    deleteCategory,
    categories,
    message,
    loading: menuLoading,
  } = useContext(MenuContext)

  const { userPermissions, loading, permissionsLoaded } = useContext(TenantContext)

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
      const menuModule = userPermissions.find((perm) => perm.module?.name === 'Menu')

      const newPermissions = {
        canView: menuModule?.can_view || false,
        canCreate: menuModule?.can_create || false,
        canEdit: menuModule?.can_edit || false,
        canDelete: menuModule?.can_delete || false,
      }

      setPermission(newPermissions)
    }
  }, [userPermissions, permissionsLoaded])

  useEffect(() => {
    if (permissionsLoaded && permission.canView) {
      getAllCategories()
    }
  }, [permissionsLoaded, permission.canView])

  const handleAddCategory = () => {
    navigate('/tenant/catagory')
  }

  const handleEdit = (categoryId) => {
    navigate(`/tenant/catagory/${categoryId}`)
  }

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      const result = await deleteCategory(categoryId)
      if (result.success) {
        getAllCategories() // Refresh the list
      }
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
          You don't have permission to view categories.
        </div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Category Management</h3>
        {permission.canCreate && (
          <CButton color="primary" onClick={handleAddCategory}>
            <CIcon icon={cilPlus} className="me-2" />
            Add Category
          </CButton>
        )}
      </div>

      {message && <div className="alert alert-info mb-3">{message}</div>}

      {menuLoading ? (
        <div className="text-center py-4">
          <CSpinner color="primary" />
        </div>
      ) : (
        <CTable striped hover responsive align="middle">
          <CTableHead color="light">
            <CTableRow>
              <CTableHeaderCell scope="col">#</CTableHeaderCell>
              <CTableHeaderCell scope="col">Category ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Description</CTableHeaderCell>
              {(permission.canEdit || permission.canDelete) && (
                <CTableHeaderCell scope="col" className="text-center">
                  Actions
                </CTableHeaderCell>
              )}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {categories && categories.length > 0 ? (
              categories.map((category, index) => (
                <CTableRow key={category.category_id}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                  <CTableDataCell>{category.category_id}</CTableDataCell>
                  <CTableDataCell>{category.name}</CTableDataCell>
                  <CTableDataCell>{category.description}</CTableDataCell>
                  {(permission.canEdit || permission.canDelete) && (
                    <CTableDataCell className="text-center">
                      {permission.canEdit && (
                        <CButton
                          color="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(category.category_id)}
                        >
                          <CIcon icon={cilPencil} className="me-1" />
                        </CButton>
                      )}
                      {permission.canDelete && (
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDelete(category.category_id)}
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
                <CTableDataCell
                  colSpan={permission.canEdit || permission.canDelete ? '5' : '4'}
                  className="text-center py-4"
                >
                  No categories found
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      )}
    </div>
  )
}

export default CategoryList