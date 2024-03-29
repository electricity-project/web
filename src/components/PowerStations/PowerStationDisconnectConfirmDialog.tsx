import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import * as React from 'react'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  closeDisconnectConfirmDialog, disconnectPowerStation,
  selectDisconnectConfirmDialog,
  selectIsDisconnectConfirmDialogOpen
} from '../../redux/slices/powerStationsSlice'

const PowerStationDisconnectConfirmDialog: React.FC<{ afterConfirm: () => void }> = ({ afterConfirm }) => {
  const dispatch = useAppDispatch()
  const isDisconnectConfirmDialogOpen = useAppSelector(selectIsDisconnectConfirmDialogOpen)
  const powerStationToDisconnect = useAppSelector(selectDisconnectConfirmDialog)

  const handleNo = (): void => {
    dispatch(closeDisconnectConfirmDialog())
  }

  const handleYes = (): void => {
    dispatch(closeDisconnectConfirmDialog())
    if (powerStationToDisconnect !== undefined) {
      dispatch(disconnectPowerStation(powerStationToDisconnect))
        .then((result) => {
          if (result.type === disconnectPowerStation.fulfilled.type) {
            afterConfirm()
          }
        }).catch(() => {})
    }
  }

  return (
    <Dialog
      maxWidth="xs"
      open={isDisconnectConfirmDialogOpen}
    >
      <DialogTitle>Czy jesteś pewny?</DialogTitle>
      <DialogContent dividers>
        {'Wybrana elektrownia zostanie odłączona od systemu. Czy chcesz kontunuować?'}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleNo}>Nie</Button>
        <Button onClick={handleYes}>Tak</Button>
      </DialogActions>
    </Dialog>
  )
}

export default PowerStationDisconnectConfirmDialog
