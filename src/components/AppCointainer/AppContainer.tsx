import * as React from 'react'
import Box from '@mui/material/Box'
import Toolbar from '@mui/material/Toolbar'
import { Outlet, useLocation, matchPath } from 'react-router-dom'
import AppHeader from './AppBar'
import AppSideNav from './AppSideNav'
import { Backdrop, CssBaseline } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Typography from '@mui/material/Typography'

const AppContainer: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const { pathname } = useLocation()
  let viewHeaderText

  switch (pathname) {
    case '/power-stations':
      viewHeaderText = 'Elektrownie'
      break
    case '/power-stations/new':
      viewHeaderText = 'Nowe elektrownie'
      break
    case matchPath('/power-stations/:id', pathname)?.pathname:
      viewHeaderText = 'Szczegóły elektrowni'
      break
    case '/power-prediction':
      viewHeaderText = 'Predykcja produkcji prądu'
      break
    case '/admin':
      viewHeaderText = 'Panel administratora'
      break
    default:
      viewHeaderText = 'Stan produkcji prądu'
      break
  }

  const toggleDrawer = (): void => {
    setIsOpen(!isOpen)
  }

  return (
    <>
      <Backdrop sx={{ color: '#000000', zIndex: 1098 }} open={isOpen} />
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
            <AppBar
              position="static"
              style={{
                height: 64.2,
                backgroundColor: '#ffffff',
                color: '#000000',
                justifyContent: 'center',
                paddingLeft: 16,
                zIndex: 1097
              }}
            >
              <Typography variant='h4'>
                {viewHeaderText}
              </Typography>
            </AppBar>

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
    </>
  )
}

export default AppContainer
