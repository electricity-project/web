import { Visibility, VisibilityOff } from '@mui/icons-material'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
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
  clearOneTimePassword,
  closeEditUserDialog,
  resetPassword,
  selectEditedUserData,
  selectIsEditUserDialogOpen,
  selectIsEditUserError,
  selectIsEditUserPending,
  selectIsUsernameValidationError,
  selectIsUsernameValidationPending,
  selectOneTimePassword, updateUser,
  validateUsername
} from '../../redux/slices/adminPanelSlice'
import { selectUser } from '../../redux/slices/userAuthSlice'
import { UserRole, userRoleToString } from '../common/types'

const EditUserDialogContent: React.FC<{ afterEditAction: () => void }> = ({ afterEditAction }) => {
  const dispatch = useAppDispatch()
  const isUsernameValidationPending: boolean = useAppSelector(selectIsUsernameValidationPending)
  const isUsernameValidationError: boolean = useAppSelector(selectIsUsernameValidationError)
  const editedUser = useAppSelector(selectEditedUserData)
  const editedUserData = editedUser?.userData
  const isEditUserPending = useAppSelector(selectIsEditUserPending)
  const isEditUserError = useAppSelector(selectIsEditUserError)
  const oneTimePassword = useAppSelector(selectOneTimePassword)
  const loggedUsed = useAppSelector(selectUser)
  const [newUsername, setNewUsername] = useState<string>(editedUserData?.username as string)
  const [newRole, setNewRole] = useState<UserRole>(editedUserData?.role as UserRole)
  const [showOneTimePassword, setShowOneTimePassword] = useState(false)

  const isNotDifferent = newUsername === editedUserData?.username && newRole === editedUserData?.role
  const isSaveButtonDisabled = isNotDifferent || newUsername === '' || isUsernameValidationError || isUsernameValidationPending

  const handleUsernameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value = event.target.value
    void dispatch(validateUsername(value))
    setNewUsername(value)
  }

  const handleRoleChange = (event: SelectChangeEvent<UserRole>): void => {
    setNewRole(event.target.value as UserRole)
  }

  const handlePasswordReset = (): void => {
    void dispatch(resetPassword(editedUserData?.username as string))
  }

  const handleDialogClose = (): void => {
    dispatch(closeEditUserDialog())
  }

  const handleSave = (): void => {
    dispatch(updateUser({ id: editedUser?.id ?? '', newValue: { username: newUsername, role: newRole } }))
      .then((result) => {
        if (result.type === updateUser.fulfilled.type) {
          afterEditAction()
          handleDialogClose()
        }
      }).catch(() => {})
  }

  const handleClickShowOneTimePassword = (): void => {
    setShowOneTimePassword((show) => !show)
  }

  const handleMouseDownOneTimePassword = (event: React.MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault()
  }

  const handleBackToEdit = (): void => {
    dispatch(clearOneTimePassword())
  }

  if (isEditUserPending || !(isEditUserPending || isEditUserError || editedUserData !== undefined)) {
    return (
      <>
        <DialogTitle>Edycja użytkownika</DialogTitle>
        <DialogContent sx={{ minWidth: 620, minHeight: 278.1 }} dividers>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220.1 }}>
            <CircularProgress size={32} />
          </Box>
        </DialogContent>
      </>
    )
  }

  if (!isEditUserError && oneTimePassword !== undefined) {
    return (
      <>
        <DialogTitle>Edycja użytkownika</DialogTitle>
        <DialogContent sx={{ maxWidth: 620, minHeight: 225.6 }} dividers>
          <DialogContentText>
            Hasło zostało zresetowane pomyślnie!
          </DialogContentText>
          <DialogContentText mt={1}>
            Poniżej znajduje się hasło jednorazowe, którego należy użyć przy następnym logowaniu.
            Po zamknięciu tego okna hasła nie da się wyświetlić ponownie.
          </DialogContentText>
          <FormControl sx={{ mt: 4.25 }} variant="outlined" fullWidth>
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
          <Button onClick={handleBackToEdit}>Wróć do edycji</Button>
          <Button onClick={handleDialogClose}>Zamknij</Button>
        </DialogActions>
      </>
    )
  }

  return (
    <>
      <DialogTitle>Edycja użytkownika</DialogTitle>
      <DialogContent sx={{ minWidth: 620 }} dividers>
        <Stack spacing={isEditUserError ? 3.5 : 5.75} pt={isEditUserError ? 0 : 2.25} pb={isEditUserError ? 0 : 2}>
          {isEditUserError && (
            <DialogContentText color={'error'}>
              Wystąpił błąd. Spróbuj ponownie.
            </DialogContentText>
          )}
          <TextField
            required
            focused
            id="username"
            label="Nazwa użytkownika"
            type="text"
            variant="outlined"
            value={newUsername}
            onChange={handleUsernameChange}
            color={isUsernameValidationError
              ? 'error'
              : isUsernameValidationPending || newUsername === '' || newUsername === editedUserData?.username ? 'primary' : 'success'}/>
          <FormControl>
            <InputLabel id="role-select-label">Rola</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={newRole}
              disabled={loggedUsed?.username === editedUserData?.username}
              label="Rola"
              onChange={handleRoleChange}
            >
              <MenuItem value={UserRole.Admin}>{userRoleToString(UserRole.Admin, true)}</MenuItem>
              <MenuItem value={UserRole.User}>{userRoleToString(UserRole.User, true)}</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3 }}>
        <Button onClick={handlePasswordReset}>Zresetuj hasło</Button>
        <div style={{ flex: 1 }}></div>
        <Button onClick={handleDialogClose}>Anuluj</Button>
        <Button disabled={isSaveButtonDisabled} onClick={handleSave}>Zapisz</Button>
      </DialogActions>
    </>
  )
}

const EditUserDialog: React.FC<{ afterEditAction: () => void }> = ({ afterEditAction }) => {
  const isEditUserDialogOpen = useAppSelector(selectIsEditUserDialogOpen)

  return (
    <Dialog open={isEditUserDialogOpen} maxWidth={'md'}>
      <EditUserDialogContent afterEditAction={afterEditAction} />
    </Dialog>
  )
}

export default EditUserDialog
