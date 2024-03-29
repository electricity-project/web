import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Button, CircularProgress,
  Dialog,
  DialogActions,
  DialogContent, DialogContentText,
  DialogTitle,
  FormControl, IconButton, InputAdornment,
  InputLabel,
  MenuItem, OutlinedInput,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField
} from '@mui/material'
import Box from '@mui/material/Box'
import * as React from 'react'
import { type ChangeEvent, useState } from 'react'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  clearUsernameValidationError,
  closeCreateUserDialog, createUser,
  selectIsCreateUserDialogOpen, selectIsCreateUserError, selectIsCreateUserPending,
  selectIsUsernameValidationError, selectIsUsernameValidationPending, selectOneTimePassword, validateUsername
} from '../../redux/slices/adminPanelSlice'
import { UserRole, userRoleToString } from '../common/types'

const CreateUserDialogContent: React.FC<{ afterCreateAction: () => void }> = ({ afterCreateAction }) => {
  const dispatch = useAppDispatch()
  const isUsernameValidationPending: boolean = useAppSelector(selectIsUsernameValidationPending)
  const isUsernameValidationError: boolean = useAppSelector(selectIsUsernameValidationError)
  const isCreateUserPending = useAppSelector(selectIsCreateUserPending)
  const isCreateUserError = useAppSelector(selectIsCreateUserError)
  const oneTimePassword = useAppSelector(selectOneTimePassword)
  const [username, setUsername] = useState<string>('')
  const [role, setRole] = useState<UserRole>(UserRole.User)
  const [showOneTimePassword, setShowOneTimePassword] = useState(false)

  const isCreateButtonDisabled = username === '' || isUsernameValidationError || isUsernameValidationPending

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value
    if (value === '') {
      dispatch(clearUsernameValidationError())
    } else {
      void dispatch(validateUsername(value))
    }
    setUsername(value)
  }

  const handleRoleChange = (event: SelectChangeEvent<UserRole>): void => {
    setRole(event.target.value as UserRole)
  }

  const handleDialogClose = (): void => {
    dispatch(closeCreateUserDialog())
  }

  const handleCreate = (): void => {
    dispatch(createUser({ username, role }))
      .then((result) => {
        if (result.type === createUser.fulfilled.type) {
          afterCreateAction()
        }
      }).catch(() => {})
  }

  const handleClickShowOneTimePassword = (): void => {
    setShowOneTimePassword((show) => !show)
  }

  const handleMouseDownOneTimePassword = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
  }

  if (isCreateUserPending) {
    return (
      <>
        <DialogTitle>Kreator użytkownika</DialogTitle>
        <DialogContent sx={{ minWidth: 620, minHeight: 282.1 }} dividers>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 224.1 }}>
            <CircularProgress size={32} />
          </Box>
        </DialogContent>
      </>
    )
  }

  if (!isCreateUserPending && !isCreateUserError && oneTimePassword !== undefined) {
    return (
      <>
        <DialogTitle>Kreator użytkownika</DialogTitle>
        <DialogContent sx={{ maxWidth: 620, minHeight: 229.6 }} dividers>
          <DialogContentText>
            Użytkownik <b>{username}</b> został utworzony pomyślnie!
          </DialogContentText>
          <DialogContentText mt={1.25}>
            Poniżej znajduje się hasło jednorazowe, którego należy użyć przy pierwszym logowaniu.
            Po zamknięciu tego okna hasła nie da się wyświetlić ponownie.
          </DialogContentText>
          <FormControl sx={{ mt: 4.5 }} variant="outlined" fullWidth>
            <InputLabel htmlFor="outlined-adornment-password">Hasło jednorazowe</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password"
              readOnly
              value={oneTimePassword}
              type={showOneTimePassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowOneTimePassword}
                    onMouseDown={handleMouseDownOneTimePassword}
                    edge="end"
                  >
                    {showOneTimePassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
              label="Hasło jednorazowe"
            />
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3 }}>
          <Button onClick={handleDialogClose}>Zakończ</Button>
        </DialogActions>
      </>
    )
  }

  let spacing = 5.24
  if (isCreateUserError && isUsernameValidationError) {
    spacing = 2
  } else if (isCreateUserError) {
    spacing = 4.865
  } else if (isUsernameValidationError) {
    spacing = 2.375
  }

  return (
    <>
      <DialogTitle>Kreator użytkownika</DialogTitle>
      <DialogContent sx={{ minWidth: 620 }} dividers>
        <Stack spacing={3} pt={isCreateUserError ? 0 : 2.75} pb={isCreateUserError ? 0 : 2.5}>
          {isCreateUserError && (
            <DialogContentText color={'error'} fontSize={14}>
              Wystąpił błąd. Spróbuj ponownie.
            </DialogContentText>
          )}
          <Stack spacing={spacing}>
            <TextField
              required
              error={isUsernameValidationError}
              focused
              id="username"
              label="Nazwa użytkownika"
              type="text"
              variant="outlined"
              helperText={isUsernameValidationError ? 'Nazwa użytkownika jest zajęta' : ''}
              value={username}
              onChange={handleUsernameChange}
              color={isUsernameValidationError
                ? 'error'
                : isUsernameValidationPending || username === '' ? 'primary' : 'success'}/>
            <FormControl>
              <InputLabel id="role-select-label">Rola</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={role}
                label="Rola"
                onChange={handleRoleChange}
              >
                <MenuItem value={UserRole.Admin}>{userRoleToString(UserRole.Admin, true)}</MenuItem>
                <MenuItem value={UserRole.User}>{userRoleToString(UserRole.User, true)}</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3 }}>
        <Button onClick={handleDialogClose}>Anuluj</Button>
        <Button disabled={isCreateButtonDisabled} onClick={handleCreate}>Utwórz</Button>
      </DialogActions>
    </>
  )
}

const CreateUserDialog: React.FC<{ afterCreateAction: () => void }> = ({ afterCreateAction }) => {
  const isCreateUserDialogOpen = useAppSelector(selectIsCreateUserDialogOpen)

  return (
    <Dialog open={isCreateUserDialogOpen} maxWidth={'md'}>
      <CreateUserDialogContent afterCreateAction={afterCreateAction} />
    </Dialog>
  )
}

export default CreateUserDialog
