import * as React from 'react'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import { Outlet } from 'react-router-dom'
import AppHeader from './AppBar'
import AppSideNav from './AppSideNav'
import { CssBaseline } from '@mui/material'

const AppContainer: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const toggleDrawer = (): void => {
    setIsOpen(!isOpen)
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppHeader onIconClick={toggleDrawer} />
      <AppSideNav isOpen={isOpen} />
      <Box sx={{ height: '100vh', display: 'flex', flexFlow: 'column', flex: 1, minWidth: 0 }}>
        <Toolbar style={{ padding: 0 }}/>
        <Box
          component="main"
          sx={{ display: 'flex', flexDirection: 'column', flex: 1, p: 2, minHeight: 0 }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default AppContainer
