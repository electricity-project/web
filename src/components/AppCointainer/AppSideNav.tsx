import { ElectricBolt, ManageAccounts, QueryStats, WindPower } from '@mui/icons-material'
import { type CSSObject, styled, type Theme } from '@mui/material'
import Divider from '@mui/material/Divider'
import MuiDrawer, { type DrawerProps as MuiDrawerProps } from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Toolbar from '@mui/material/Toolbar'
import type { JSX } from 'react'
import * as React from 'react'
import { Link, matchPath, useLocation } from 'react-router-dom'

import { useAppSelector } from '../../redux/hooks'
import { selectUser } from '../../redux/slices/userAuthSlice'
import { UserRole } from '../common/types'

interface PathPattern {
  path: string
  end: boolean
}

interface NavElement {
  key: string
  linkTo: string
  icon: JSX.Element
  text: string
  isSelectedPattern: string | PathPattern
}

const getNavElements = (isAdmin: boolean): NavElement[] => {
  const navElements = [
    {
      key: 'power-production',
      linkTo: '/power-production',
      icon: <ElectricBolt />,
      text: 'Stan produkcji energii elektrycznej',
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
      text: 'Predykcja produkcji energii elektrycznej',
      isSelectedPattern: '/power-prediction'
    }
  ]

  if (isAdmin) {
    navElements.push({
      key: 'admin',
      linkTo: '/admin',
      icon: <ManageAccounts />,
      text: 'Panel administratora',
      isSelectedPattern: '/admin'
    })
  }
  return navElements
}

const drawerWidth = 360

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
  position: 'fixed',
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
  const { pathname } = useLocation()
  const user = useAppSelector(selectUser)
  const isAdmin = user?.role === UserRole.Admin

  return (
    <>
      <div style={{ width: '65px' }}></div>
      <Drawer
        variant="permanent"
        anchor="left"
        isOpen={isOpen}
      >
        <Toolbar />
        <List disablePadding>
          {getNavElements(isAdmin).map((navElement) => (
            <>
              <ListItem key={navElement.key} disablePadding>
                <ListItemButton
                  component={Link} to={navElement.linkTo}
                  selected={matchPath(navElement.isSelectedPattern, pathname) !== null}
                  sx={{ minHeight: 64.2, px: 2.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 0, mr: 2.5, justifyContent: 'center' }}>
                    {navElement.icon}
                  </ListItemIcon>
                  <ListItemText primary={navElement.text} sx={{ opacity: isOpen ? 1 : 1 }} />
                </ListItemButton>
              </ListItem>
              <Divider />
            </>
          ))}
        </List>
      </Drawer>
    </>
  )
}

export default AppSideNav
