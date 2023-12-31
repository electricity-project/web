import { Button, Grid } from '@mui/material'
import Box from '@mui/material/Box'
import { GridFooterContainer } from '@mui/x-data-grid'
import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  connectPowerStations,
  reset,
  selectIsLoading,
  selectRows
} from '../../redux/slices/powerStationsCreatorSlice'
import { addAlertToQueue } from '../../redux/slices/powerStationsSlice'
import { PowerStationCreationStatus } from '../common/types'

const PowerStationsCreatorFooter: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const rows = useAppSelector(selectRows)
  const isLoading = useAppSelector(selectIsLoading)

  const handleSave = (): void => {
    dispatch(connectPowerStations(rows.map((row) => row.ipv6)))
      .then((result) => {
        if (result.type === connectPowerStations.fulfilled.type) {
          dispatch(addAlertToQueue({ key: new Date().getTime(), severity: 'success', message: 'Pomyślnie dodano nowe elektrownie' }))
          navigate('/power-stations')
        }
      }).catch(() => {})
  }
  const handleCancel = (): void => {
    navigate('/power-stations', { state: { block: false } })
    dispatch(reset())
  }

  const isSaveDisabled: boolean = isLoading ||
    rows.length === 0 ||
    rows.some((row) => row.status !== PowerStationCreationStatus.Success)

  return (
    <GridFooterContainer>
      <div style={{ flex: 1, minWidth: 0 }}></div>
      <Box paddingX={1} paddingY={1}>
      <Grid
        container
        direction="row"
        justifyContent="space-around"
        alignItems="center"
      >
        <Grid item>
          <Button variant="outlined" onClick={handleCancel}>
            Anuluj
          </Button>
        </Grid>
        <Grid item>
          <div style={{ width: 12 }}></div>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={handleSave} disabled={isSaveDisabled}>
            Dodaj do systemu
          </Button>
        </Grid>
      </Grid>
      </Box>
    </GridFooterContainer>
  )
}

export default PowerStationsCreatorFooter
