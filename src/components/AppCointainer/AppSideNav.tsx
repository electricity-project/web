import * as React from 'react'
import Toolbar from '@mui/material/Toolbar'
import MuiDrawer, { type DrawerProps as MuiDrawerProps } from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import { Link, matchPath, useLocation } from 'react-router-dom'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { ElectricBolt, QueryStats, WindPower, ManageAccounts } from '@mui/icons-material'
import { type CSSObject, styled, type Theme } from '@mui/material'

const navElements = [
  {
    key: 'power-production',
    linkTo: '/power-production',
    icon: <ElectricBolt />,
    text: 'Stan produkcji prądu',
    isSelectedPattern: '/power-production'
  },
  {
    key: 'power-stations',
    linkTo: '/power-stations',
    icon: <WindPower/>,
    text: 'Elektrownie',
    isSelectedPattern: { path: '/power-stations', end: false }
  },
  {
    key: 'power-prediction',
    linkTo: '/power-prediction',
    icon: <QueryStats />,
    text: 'Predykcja produkcji prądu',
    isSelectedPattern: '/power-prediction'
  },
  {
    key: 'admin',
    linkTo: '/admin',
    icon: <ManageAccounts />,
    text: 'Panel administratora',
    isSelectedPattern: '/admin'
  }
]

const drawerWidth = 260

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen
  }),
  overflowX: 'hidden'
})

const closedMixin = (theme: Theme): CSSObject => ({
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`
  },
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  overflowX: 'hidden'
})

interface DrawerProps extends MuiDrawerProps {
  isOpen: boolean
}

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== 'open'
})<DrawerProps>(({ theme, isOpen }) => ({
  width: drawerWidth,
  flexShrink: 0,
  zIndex: 1099,
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  ...(isOpen && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme)
  }),
  ...(!isOpen && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme)
  })
})
)

interface AppSideNavProps {
  isOpen: boolean
}

const AppSideNav: React.FC<AppSideNavProps> = ({ isOpen }) => {
  const location = useLocation()
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      isOpen={isOpen}
    >
      <Toolbar />
      <List disablePadding>
        {navElements.map((navElement) => (
          <>
            <ListItem key={navElement.key} disablePadding>
              <ListItemButton
                component={Link} to={navElement.linkTo}
                selected={matchPath(navElement.isSelectedPattern, location.pathname) !== null}
                sx={{ minHeight: 64.2, px: 2.5 }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: 2.5, justifyContent: 'center' }}>
                  {navElement.icon}
                </ListItemIcon>
                <ListItemText primary={navElement.text} sx={{ opacity: isOpen ? 1 : 1 }}/>
              </ListItemButton>
            </ListItem>
            <Divider/>
          </>
        ))}
      </List>
    </Drawer>
  )
}

export default AppSideNav
