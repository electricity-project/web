import { KeyboardArrowDown, Logout, Menu as MenuIcon } from '@mui/icons-material'
import { alpha, Button, IconButton, Menu, MenuItem, type MenuProps, Stack, styled, type Theme } from '@mui/material'
import AppBar from '@mui/material/AppBar'
import Divider from '@mui/material/Divider'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import * as React from 'react'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { logout, selectToken, selectUser } from '../../redux/slices/userAuthSlice'

interface AppHeaderProps {
  onIconClick: () => void
}

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right'
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right'
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 160,
    color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '8px 0'
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(2.5)
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        )
      }
    }
  }
}))

const AppHeader: React.FC<AppHeaderProps> = ({ onIconClick }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const isMenuOpen = Boolean(anchorEl)
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectToken)
  const user = useAppSelector(selectUser)

  const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = (): void => {
    setAnchorEl(null)
  }

  const handleLogout = (): void => {
    void dispatch(logout())
  }

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
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          System Zarządzania OZE
        </Typography>
        {token !== undefined && (
          <Stack direction={'row'} spacing={3}>
            <Divider orientation="vertical" flexItem light color={'white'} />
            <Button
              id="user-button"
              aria-controls={isMenuOpen ? 'user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isMenuOpen ? 'true' : undefined}
              variant="contained"
              disableElevation
              onClick={handleClick}
              endIcon={<KeyboardArrowDown />}
              sx={[
                { border: `1px solid ${isMenuOpen ? '' : 'transparent'}`, textTransform: 'none' },
                (theme: Theme) => ({
                  '&:hover': {
                    border: '1px solid',
                    backgroundColor: theme.palette.primary.main
                  }
                })
              ]}
            >
              {user?.username}
            </Button>
            <StyledMenu
              id="user-menu"
              MenuListProps={{
                'aria-labelledby': 'user-button'
              }}
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleClose}
            >
              <MenuItem onClick={handleLogout} disableRipple>
                <Logout />
                Wyloguj
              </MenuItem>
            </StyledMenu>
          </Stack>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default AppHeader
