import * as React from 'react'
import Toolbar from '@mui/material/Toolbar'
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import { Link } from 'react-router-dom'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { ElectricBolt, QueryStats, WindPower, ManageAccounts } from '@mui/icons-material'

const AppSideNav: React.FC = () => {
  return (
    <Drawer
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box'
        },
        zIndex: 1099
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar />
      <Divider />
      <List>
        <ListItem key={'power-production'} disablePadding>
          <ListItemButton component={Link} to={'/power-production'}>
            <ListItemIcon>
              <ElectricBolt />
            </ListItemIcon>
            <ListItemText primary={'Stan produkcji prądu'} />
          </ListItemButton>
        </ListItem>
        <ListItem key={'power-stations'} disablePadding>
          <ListItemButton component={Link} to={'/power-stations'}>
            <ListItemIcon>
              <WindPower />
            </ListItemIcon>
            <ListItemText primary={'Elektrownie'} />
          </ListItemButton>
        </ListItem>
        <ListItem key={'power-prediction'} disablePadding>
          <ListItemButton component={Link} to={'/power-prediction'}>
            <ListItemIcon>
              <QueryStats />
            </ListItemIcon>
            <ListItemText primary={'Predykcja produkcji prądu'} />
          </ListItemButton>
        </ListItem>
        <ListItem key={'admin'} disablePadding>
          <ListItemButton component={Link} to={'/admin'}>
            <ListItemIcon>
              <ManageAccounts />
            </ListItemIcon>
            <ListItemText primary={'Panel administratora'} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  )
}

export default AppSideNav
