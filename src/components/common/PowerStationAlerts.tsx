import * as React from 'react'
import { Alert, Snackbar } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  clearAlert, clearAlertProps,
  selectAlertProps,
  selectAlertsQueue,
  selectIsAlertVisible,
  updateAlert
} from '../../redux/slices/powerStationsSlice'
import { useEffect } from 'react'

const PowerStationAlerts: React.FC = () => {
  const dispatch = useAppDispatch()
  const isAlertVisible = useAppSelector(selectIsAlertVisible)
  const alertProps = useAppSelector(selectAlertProps)
  const alertsQueue = useAppSelector(selectAlertsQueue)

  useEffect(() => {
    if (alertsQueue.length > 0 && alertProps === undefined) {
      dispatch(updateAlert())
    } else if (alertsQueue.length > 0 && alertProps !== undefined && isAlertVisible) {
      dispatch(clearAlert())
    }
  }, [alertsQueue, alertProps, isAlertVisible])

  const handleAlertClose = (_event?: React.SyntheticEvent | Event, reason?: string): void => {
    if (reason === 'clickaway') {
      return
    }
    dispatch(clearAlert())
  }

  const handleAlertTransitionExited = (): void => {
    dispatch(clearAlertProps())
  }

  return (
    <Snackbar
      key={alertProps?.key}
      open={isAlertVisible}
      autoHideDuration={5000}
      style={{ zIndex: 1299 }}
      onClose={handleAlertClose}
      TransitionProps={{ onExited: handleAlertTransitionExited }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={handleAlertClose} severity={alertProps?.severity} sx={{ width: '100%' }}>
        {alertProps?.message}
      </Alert>
    </Snackbar>
  )
}

export default PowerStationAlerts
