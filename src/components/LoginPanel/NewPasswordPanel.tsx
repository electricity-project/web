import { Visibility, VisibilityOff } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import {
  DialogActions, DialogContent, DialogContentText, DialogTitle,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Stack
} from '@mui/material'
import * as React from 'react'
import { type ChangeEvent, useState } from 'react'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  changePassword,
  clearPasswordChangeError,
  selectIsPasswordChangeError, selectIsPasswordChangePending
} from '../../redux/slices/userAuthSlice'

const NewPasswordPanel: React.FC = () => {
  const dispatch = useAppDispatch()
  const isPasswordChangePending = useAppSelector(selectIsPasswordChangePending)
  const isPasswordChangeError = useAppSelector(selectIsPasswordChangeError)
  const [newPassword, setNewPassword] = useState<string>('')
  const [newPasswordRepeat, setNewPasswordRepeat] = useState<string>('')
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const isPasswordRepeatDifferent = newPassword !== newPasswordRepeat && newPasswordRepeat !== ''
  const isPasswordChangeDisabled = newPassword === '' || newPasswordRepeat === '' || isPasswordRepeatDifferent

  const handleNewPasswordChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setNewPassword(event.target.value)
  }

  const handlePasswordRepeatChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setNewPasswordRepeat(event.target.value)
  }

  const handleClickShowPassword = (): void => {
    setShowPassword((show) => !show)
  }

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
  }

  const handlePasswordChange = (): void => {
    void dispatch(changePassword(newPassword))
  }

  const onEnterPressed = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' && !isPasswordChangeDisabled) {
      handlePasswordChange()
      event.preventDefault()
    }
  }

  const onFocus = (): void => {
    dispatch(clearPasswordChangeError())
  }

  return (
    <>
      <DialogTitle fontWeight={'bold'}>Ustawianie nowego hasła</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} pt={0.75} pb={0}>
          <Stack spacing={6} pt={0} pb={0}>
            <FormControl variant="standard" fullWidth error={isPasswordChangeError}>
              <InputLabel htmlFor="password-input">Nowe hasło</InputLabel>
              <Input
                id="password-input"
                readOnly={isPasswordChangePending}
                value={newPassword}
                onChange={handleNewPasswordChange}
                onKeyDown={onEnterPressed}
                onFocus={onFocus}
                type={showPassword ? 'text' : 'password'}
                endAdornment={<InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    disabled={isPasswordChangePending}
                  >
                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                  </IconButton>
                </InputAdornment>}/>
            </FormControl>
            <FormControl variant="standard" fullWidth error={isPasswordChangeError || isPasswordRepeatDifferent}>
              <InputLabel htmlFor="password-repeat-input">Powtórz nowe hasło</InputLabel>
              <Input
                id="password-repeat-input"
                readOnly={isPasswordChangePending}
                value={newPasswordRepeat}
                onChange={handlePasswordRepeatChange}
                onKeyDown={onEnterPressed}
                onFocus={onFocus}
                type={showPassword ? 'text' : 'password'}
                endAdornment={<InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    disabled={isPasswordChangePending}
                  >
                    {showPassword ? <VisibilityOff/> : <Visibility/>}
                  </IconButton>
                </InputAdornment>}/>
            </FormControl>
          </Stack>
          <DialogContentText color={'error'} sx={{ minHeight: 24 }}>
            {isPasswordRepeatDifferent
              ? 'Hasła nie są identyczne'
              : isPasswordChangeError ? 'Nie udało się zmienić hasła. Spróbuj ponownie.' : ''}
          </DialogContentText>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <LoadingButton
          fullWidth
          loading={isPasswordChangePending}
          loadingIndicator="Ustawianie hasła…"
          disabled={isPasswordChangeDisabled}
          onClick={handlePasswordChange}
          variant="contained"
          sx={{ fontSize: 22, fontWeight: 'bold', pt: 1 }}
        >
          Ustaw hasło
        </LoadingButton>
      </DialogActions>
    </>
  )
}

export default NewPasswordPanel
