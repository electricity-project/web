import * as React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAppSelector } from '../redux/hooks'
import { selectToken } from '../redux/slices/userAuthSlice'

const ProtectedRoute: React.FC = () => {
  const token = useAppSelector(selectToken)
  const location = useLocation()

  if (token === undefined) {
    return <Navigate to={'/login'} replace state={{ prev: location }}/>
  }

  return <Outlet />
}

export default ProtectedRoute
