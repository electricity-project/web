import { Visibility, VisibilityOff } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Stack,
  TextField
} from '@mui/material'
import * as React from 'react'
import { type ChangeEvent, useState } from 'react'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  clearLoginError,
  login,
  selectIsLoginError,
  selectIsLoginPending
} from '../../redux/slices/userAuthSlice'

const LoginPanel: React.FC = () => {
  const dispatch = useAppDispatch()
  const isLoginPending = useAppSelector(selectIsLoginPending)
  const isLoginError = useAppSelector(selectIsLoginError)
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

  const onFocus = (): void => {
    dispatch(clearLoginError())
  }

  return (
    <>
      <DialogTitle fontWeight={'bold'}>Panel logowania</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} pt={0.75} pb={0}>
          <Stack spacing={6} pt={0} pb={0}>
            <TextField
              id="login-input"
              label="Login"
              error={isLoginError}
              InputProps={{
                readOnly: isLoginPending
              }}
              variant="standard"
              value={username}
              onChange={handleUsernameChange}
              onKeyDown={onEnterPressed}
              onFocus={onFocus}
              fullWidth/>
            <FormControl variant="standard" fullWidth error={isLoginError}>
              <InputLabel htmlFor="password-input">Hasło</InputLabel>
              <Input
                id="password-input"
                readOnly={isLoginPending}
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={onEnterPressed}
                onFocus={onFocus}
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
          <DialogContentText color={'error'} sx={{ minHeight: 24 }}>
            {isLoginError && 'Nieprawidłowy login lub hasło'}
          </DialogContentText>
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
    </>
  )
}

export default LoginPanel
