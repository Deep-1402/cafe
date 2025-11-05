import React, { useEffect } from 'react'
import {
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CButton,
  CBadge,
} from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getAll } from '../../../slices/master/subscription'

const PlanTable = () => {

  const {message , plans} = useSelector(state => state.subscription)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  useEffect(()=>{
    dispatch(getAll())
  },[])

  return (
    <div className="p-4">
      <h3>Available Plans</h3>

      <CTable striped hover responsive align="middle">
        <CTableHead color="light">
          <CTableRow>
            <CTableHeaderCell scope="col">#</CTableHeaderCell>
            <CTableHeaderCell scope="col">Id</CTableHeaderCell>
            <CTableHeaderCell scope="col">Name</CTableHeaderCell>
            <CTableHeaderCell scope="col">Price</CTableHeaderCell>
            <CTableHeaderCell scope="col">Description</CTableHeaderCell>
            <CTableHeaderCell scope="col">Max Users</CTableHeaderCell>
            <CTableHeaderCell scope="col">Status</CTableHeaderCell>
            <CTableHeaderCell scope="col">Created At</CTableHeaderCell>
            <CTableHeaderCell scope="col" className="text-center">
              Actions
            </CTableHeaderCell>
          </CTableRow>
        </CTableHead>

        <CTableBody>
          {plans.map((plan, index) => (
            <CTableRow key={index}>
              <CTableHeaderCell scope="row">{index + 1}</CTableHeaderCell>
              <CTableHeaderCell>{plan.id}</CTableHeaderCell>
              <CTableDataCell>{plan.name}</CTableDataCell>
              <CTableDataCell>&#8377;{plan.price}</CTableDataCell>
              <CTableDataCell>{plan.description}</CTableDataCell>
              <CTableDataCell>{plan.max_users}</CTableDataCell>
              <CTableDataCell>
                <CBadge color={plan.is_active ? 'success' : 'secondary'}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </CBadge>
              </CTableDataCell>
              <CTableDataCell>{new Date(plan.createdAt).toLocaleDateString()}</CTableDataCell>
              <CTableDataCell className="text-center">
                <CButton color="warning" size="sm" className="me-2">
                  Update
                </CButton>
                <CButton color="danger" size="sm">
                  Delete
                </CButton>
              </CTableDataCell>
            </CTableRow>
          ))}
        </CTableBody>
      </CTable>
    </div>
  )
}

export default PlanTable
