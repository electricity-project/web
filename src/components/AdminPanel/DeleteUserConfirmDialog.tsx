import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import * as React from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  closeDeleteUserConfirmDialog, deleteUser,
  selectDeleteUserConfirmDialogId,
  selectIsDeleteUserConfirmDialogOpen
} from '../../redux/slices/adminPanelSlice'

const DeleteUserConfirmDialog: React.FC<{ afterConfirm: () => void }> = ({ afterConfirm }) => {
  const dispatch = useAppDispatch()
  const isDeleteUserConfirmDialogOpen = useAppSelector(selectIsDeleteUserConfirmDialogOpen)
  const userToDeleteId = useAppSelector(selectDeleteUserConfirmDialogId)

  const handleNo = (): void => {
    dispatch(closeDeleteUserConfirmDialog())
  }

  const handleYes = (): void => {
    dispatch(closeDeleteUserConfirmDialog())
    if (userToDeleteId !== undefined) {
      dispatch(deleteUser(userToDeleteId))
        .then((result) => {
          if (result.type === deleteUser.fulfilled.type) {
            afterConfirm()
          }
        }).catch(() => {})
    }
  }

  return (
    <Dialog
      maxWidth="xs"
      open={isDeleteUserConfirmDialogOpen}
    >
      <DialogTitle>Czy jesteś pewny?</DialogTitle>
      <DialogContent dividers>
        {'Wybrany użytkownik zostanie usunięty z systemu. Czy chcesz kontunuować?'}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleNo}>Nie</Button>
        <Button onClick={handleYes}>Tak</Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteUserConfirmDialog
