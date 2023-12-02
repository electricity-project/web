import * as React from 'react'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { IconButton } from '@mui/material'
import { Menu } from '@mui/icons-material'
import AppBar from '@mui/material/AppBar'

interface AppHeaderProps {
  onIconClick: () => void
}

const AppHeader: React.FC<AppHeaderProps> = ({ onIconClick }) => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onIconClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <Menu />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          System Zarządzania OZE
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default AppHeader
