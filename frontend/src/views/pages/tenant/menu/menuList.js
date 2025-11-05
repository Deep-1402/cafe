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
import { MenuContext } from '../../../../context/menu'
import { TenantContext } from '../../../../context/tenent'

const MenuList = () => {
  const {
    getAllAvailableDishes,
    updateDish,
    deleteDish,
    dishes,
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

  const [toggleLoading, setToggleLoading] = useState({})

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
      getAllAvailableDishes()
    }
  }, [permissionsLoaded, permission.canView])

  const handleAddMenu = () => {
    navigate('/tenant/menu')
  }

  const handleEdit = (menuId) => {
    navigate(`/tenant/menu/${menuId}`)
  }

  const handleDelete = async (menuId) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      const result = await deleteDish(menuId)
      if (result.success) {
        getAllAvailableDishes() // Refresh the list
      }
    }
  }

  const handleToggleAvailability = async (menuId, currentStatus) => {
    setToggleLoading((prev) => ({ ...prev, [menuId]: true }))

    const result = await updateDish(menuId, {
      is_available: !currentStatus,
    })

    if (result.success) {
      getAllAvailableDishes() // Refresh the list
    }

    setToggleLoading((prev) => ({ ...prev, [menuId]: false }))
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
        <div className="alert alert-danger">You don't have permission to view menu items.</div>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Menu Management</h3>
        {permission.canCreate && (
          <CButton color="primary" onClick={handleAddMenu}>
            <CIcon icon={cilPlus} className="me-2" />
            Add Menu Item
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
              <CTableHeaderCell scope="col">Menu ID</CTableHeaderCell>
              <CTableHeaderCell scope="col">Name</CTableHeaderCell>
              <CTableHeaderCell scope="col">Category</CTableHeaderCell>
              <CTableHeaderCell scope="col">Price</CTableHeaderCell>
              <CTableHeaderCell scope="col">Prep Time</CTableHeaderCell>
              <CTableHeaderCell scope="col">Type</CTableHeaderCell>
              <CTableHeaderCell scope="col">Availability</CTableHeaderCell>
              {(permission.canEdit || permission.canDelete) && (
                <CTableHeaderCell scope="col" className="text-center">
                  Actions
                </CTableHeaderCell>
              )}
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {dishes && dishes.length > 0 ? (
              dishes.map((dish, index) => (
                <CTableRow key={dish.menu_id}>
                  <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
                  <CTableDataCell>{dish.menu_id}</CTableDataCell>
                  <CTableDataCell>{dish.name}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="info">{dish.category?.name || 'N/A'}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell>${dish.price}</CTableDataCell>
                  <CTableDataCell>{dish.preparation_time} min</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={dish.is_vegetarian ? 'success' : 'warning'}>
                      {dish.is_vegetarian ? 'Veg' : 'Non-Veg'}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell>
                    {permission.canEdit ? (
                      <CButton
                        color={dish.is_available ? 'success' : 'secondary'}
                        size="sm"
                        onClick={() =>
                          handleToggleAvailability(dish.menu_id, dish.is_available)
                        }
                        disabled={toggleLoading[dish.menu_id]}
                      >
                        {toggleLoading[dish.menu_id] ? (
                          <CSpinner size="sm" />
                        ) : dish.is_available ? (
                          'Available'
                        ) : (
                          'Unavailable'
                        )}
                      </CButton>
                    ) : (
                      <CBadge color={dish.is_available ? 'success' : 'secondary'}>
                        {dish.is_available ? 'Available' : 'Unavailable'}
                      </CBadge>
                    )}
                  </CTableDataCell>
                  {(permission.canEdit || permission.canDelete) && (
                    <CTableDataCell className="text-center">
                      {permission.canEdit && (
                        <CButton
                          color="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(dish.menu_id)}
                        >
                          <CIcon icon={cilPencil} className="me-1" />
                        </CButton>
                      )}
                      {permission.canDelete && (
                        <CButton
                          color="danger"
                          size="sm"
                          onClick={() => handleDelete(dish.menu_id)}
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
                  colSpan={permission.canEdit || permission.canDelete ? '9' : '8'}
                  className="text-center py-4"
                >
                  No menu items found
                </CTableDataCell>
              </CTableRow>
            )}
          </CTableBody>
        </CTable>
      )}
    </div>
  )
}

export default MenuList