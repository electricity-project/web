import * as React from 'react'
import { GridFooterContainer } from '@mui/x-data-grid'
import { Button, Grid } from '@mui/material'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  clear,
  connectPowerStations,
  PowerStationStatus,
  selectIsLoading,
  selectRows
} from '../../redux/slices/powerStationCreatorSlice'
import Box from '@mui/material/Box'
import { useNavigate } from 'react-router-dom'

const PowerStationsCreatorFooter: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const rows = useAppSelector(selectRows)
  const isLoading = useAppSelector(selectIsLoading)

  const handleSave = async (): Promise<void> => {
    await dispatch(connectPowerStations(rows.map((row) => row.ipv6)))
    navigate('/power-stations')
  }
  const handleCancel = (): void => {
    navigate('/power-stations')
    dispatch(clear())
  }

  const isSaveDisabled = (): boolean => {
    return isLoading || rows.length === 0 || rows.some((row) => row.status !== PowerStationStatus.Success)
  }

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
          <Button variant="contained" onClick={() => { void handleSave() }} disabled={isSaveDisabled()}>
            Dodaj do systemu
          </Button>
        </Grid>
      </Grid>
      </Box>
    </GridFooterContainer>
  )
}

export default PowerStationsCreatorFooter
