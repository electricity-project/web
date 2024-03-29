import { Backdrop, ClickAwayListener, CssBaseline } from '@mui/material'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import * as React from 'react'
import { useEffect } from 'react'
import { matchPath, Navigate, Outlet, useLocation } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { getUserInfo, refreshAuthTokens, selectTokenExpirationTime, selectUser } from '../../redux/slices/userAuthSlice'
import { UserRole } from '../common/types'
import AppHeader from './AppBar'
import AppSideNav from './AppSideNav'
import ViewBar from './ViewBar'

const AppContainer: React.FC = () => {
  const dispatch = useAppDispatch()
  const [isOpen, setIsOpen] = React.useState(false)
  const user = useAppSelector(selectUser)
  const tokenExpirationTime = useAppSelector(selectTokenExpirationTime)
  const isAdmin = user?.role === UserRole.Admin
  const { pathname } = useLocation()

  useEffect(() => {
    void (async () => {
      await dispatch(getUserInfo())
    })()
    if (tokenExpirationTime !== undefined) {
      void dispatch(refreshAuthTokens())
      const interval = setInterval(() => {
        void dispatch(refreshAuthTokens())
      }, tokenExpirationTime)
      return () => {
        clearInterval(interval)
      }
    }
  }, [])

  const toggleDrawer = (): void => {
    setIsOpen(!isOpen)
  }

  const handleClickAway = (): void => {
    if (isOpen) {
      toggleDrawer()
    }
  }

  if (!isAdmin && matchPath('/admin', pathname) !== null) {
    return <Navigate to={'/power-production'} replace />
  }

  return (
    <>
      <Backdrop sx={{ color: '#000000', zIndex: 1098 }} open={isOpen} />
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline/>
          <AppHeader onIconClick={toggleDrawer} />
          <AppSideNav isOpen={isOpen} />
          <Box sx={{ height: '100vh', display: 'flex', flexFlow: 'column', flex: 1, minWidth: 0 }}>
            <Toolbar style={{ padding: 0 }}/>
            <Box
              component="main"
              sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
            >
              <ViewBar />
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                p: 2,
                minHeight: 0,
                overflow: 'hidden',
                overflowY: 'auto',
                overflowX: 'auto'
              }}>
                <Outlet/>
              </Box>
            </Box>
          </Box>
        </Box>
      </ClickAwayListener>
    </>
  )
}

export default AppContainer
