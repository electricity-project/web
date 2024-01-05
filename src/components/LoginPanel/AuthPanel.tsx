import { Dialog, type Theme } from '@mui/material'
import Box from '@mui/material/Box'
import * as React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAppSelector } from '../../redux/hooks'
import { selectToken, selectUser } from '../../redux/slices/userAuthSlice'
import { UserRole } from '../common/types'
import LoginPanel from './LoginPanel'
import NewPasswordPanel from './NewPasswordPanel'

const AuthPanel: React.FC = () => {
  const location = useLocation()
  const token = useAppSelector(selectToken)
  const user = useAppSelector(selectUser)

  const isPasswordChangeNeeded = user?.role === UserRole.UserChangePassword

  if (token !== undefined && !isPasswordChangeNeeded) {
    return <Navigate to={location.state?.prev?.pathname ?? '/power-production'} replace />
  }

  return (
    <>
      <Box sx={(theme: Theme) => ({ width: '100hh', height: '100vh', backgroundColor: theme.palette.divider })} />
      <Dialog open={true} maxWidth={'sm'} fullWidth hideBackdrop>
        {isPasswordChangeNeeded ? <NewPasswordPanel /> : <LoginPanel />}
      </Dialog>
    </>
  )
}

export default AuthPanel
