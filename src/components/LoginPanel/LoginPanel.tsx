import { Visibility, VisibilityOff } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
  Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Stack,
  TextField, type Theme
} from '@mui/material'
import Box from '@mui/material/Box'
import * as React from 'react'
import { type ChangeEvent, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { login, selectIsLoginPending, selectToken } from '../../redux/slices/userAuthSlice'

const LoginPanel: React.FC = () => {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectToken)
  const isLoginPending = useAppSelector(selectIsLoginPending)
  const location = useLocation()
  const [username, setUsername] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const isLoginDisabled = username === '' || password === ''

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setUsername(event.target.value)
  }

  const handlePasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setPassword(event.target.value)
  }

  const handleClickShowPassword = (): void => {
    setShowPassword((show) => !show)
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
  }

  const handleLogin = (): void => {
    void dispatch(login({ username, password }))
  }

  const onEnterPressed = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' && !isLoginDisabled) {
      handleLogin()
      event.preventDefault()
    }
  }

  if (token !== undefined) {
    return <Navigate to={location.state?.prev?.pathname ?? '/power-production'} replace />
  }

  return (
    <>
      <Box sx={(theme: Theme) => ({ width: '100hh', height: '100vh', backgroundColor: theme.palette.divider })} />
      <Dialog open={true} maxWidth={'sm'} fullWidth hideBackdrop>
        <DialogTitle fontWeight={'bold'}>Panel logowania</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={6} pt={0.75} pb={1.75}>
            <TextField
              required
              id="login-input"
              label="Login"
              InputProps={{
                readOnly: isLoginPending
              }}
              variant="standard"
              value={username}
              onChange={handleUsernameChange}
              onKeyDown={onEnterPressed}
              fullWidth/>
            <FormControl variant="standard" fullWidth>
              <InputLabel htmlFor="password-input">Hasło *</InputLabel>
              <Input
                id="password-input"
                required
                readOnly={isLoginPending}
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={onEnterPressed}
                type={showPassword ? 'text' : 'password'}
                endAdornment={<InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    disabled={isLoginPending}
                  >
                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                  </IconButton>
                </InputAdornment>}/>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <LoadingButton
            fullWidth
            loading={isLoginPending}
            loadingIndicator="Logowanie…"
            disabled={isLoginDisabled}
            onClick={handleLogin}
            variant="contained"
            sx={{ fontSize: 22, fontWeight: 'bold', pt: 1 }}
          >
            Zaloguj
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default LoginPanel
