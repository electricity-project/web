import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  closeDisconnectConfirmDialog,
  selectDisconnectConfirmDialog,
  selectIsDisconnectConfirmDialogOpen
} from '../../redux/slices/powerStationDetailsSlice'
import {
  disconnectPowerStation
} from '../../redux/slices/powerStationsSlice'

const PowerStationDisconnectConfirmDialog: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
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
            navigate('/power-stations')
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
