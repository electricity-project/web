import 'moment/locale/pl'

import { Button, Card, CardContent, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import { LineChart } from '@mui/x-charts'
import { DateCalendar } from '@mui/x-date-pickers'
import moment, { type Moment } from 'moment'
import * as React from 'react'
import { type JSX, useEffect, useState } from 'react'

import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  clearPowerProductionPrediction,
  fetchPowerProductionPrediction,
  fetchPowerStationsCount, reset, selectAllDayPowerProductionPrediction,
  selectAllPowerStations, selectIsPrediction,
  selectPowerProductionPrediction,
  selectWorkingPowerStations
} from '../../redux/slices/powerProductionPredictionSlice'
import {
  CustomAxisContentWithTime
} from '../common/PowerProductionCharts/CustomAxisContent'
import { PowerStationsScope } from '../common/types'

const PowerProductionPrediction: React.FC = () => {
  const dispatch = useAppDispatch()
  const isPrediction = useAppSelector(selectIsPrediction)
  const powerProductionPrediction = useAppSelector(selectPowerProductionPrediction)
  const allDayPowerProductionPrediction = useAppSelector(selectAllDayPowerProductionPrediction)
  const allPowerStations = useAppSelector(selectAllPowerStations)
  const workingPowerStations = useAppSelector(selectWorkingPowerStations)
  const [date, setDate] = useState<Moment>(moment().add(1, 'days'))
  const [powerStationsScope, setPowerStationsScope] = React.useState<PowerStationsScope>(PowerStationsScope.AllPowerStations)

  useEffect(() => {
    return () => {
      dispatch(reset())
    }
  }, [])

  const handlePowerStationsChange = (_event: React.MouseEvent<HTMLElement>, newAlignment: PowerStationsScope): void => {
    setPowerStationsScope(newAlignment)
  }

  const handleDateChange = (newValue: Moment): void => {
    setDate(newValue)
  }

  const handleMakePrediction = (): void => {
    void dispatch(fetchPowerStationsCount())
    void dispatch(fetchPowerProductionPrediction({ date: date.toDate().toLocaleDateString(), powerStationsScope }))
  }

  const handleClearPrediction = (): void => {
    void dispatch(clearPowerProductionPrediction())
  }

  const getPowerStationsNumberText = (): string => {
    if (powerProductionPrediction === undefined) {
      return '-'
    }
    return String((powerStationsScope === PowerStationsScope.AllPowerStations ? allPowerStations : workingPowerStations) ?? '-')
  }

  const getAllDayPowerProductionPredictionText = (): string => {
    return allDayPowerProductionPrediction === undefined || allPowerStations === undefined ? '-' : allDayPowerProductionPrediction + ' kWh'
  }

  const createPowerProductionPredictionChart: () => JSX.Element = () => {
    const tickNumber = 24
    const tickLabelInterval = (time: { getHours: () => number }): boolean => time.getHours() % 2 === 0

    return (
      <LineChart
        slots={{
          axisContent: CustomAxisContentWithTime
        }}
        margin={{ left: 90 }}
        xAxis={[
          {
            dataKey: 'timestamp',
            scaleType: 'time',
            tickNumber,
            tickLabelInterval,
            valueFormatter: (value: Date): string =>
              value.toLocaleString('pl-PL', { hour: '2-digit', minute: '2-digit', hour12: false })
          }
        ]}
        series={[
          {
            dataKey: 'powerProduction',
            curve: 'linear',
            label: 'Produkcja prądu (kWh)'
          }
        ]}
        dataset={powerProductionPrediction as Array<{ timestamp: Date, powerProduction: number }>}
      />
    )
  }

  const createPowerTurnOnPredictionChart: () => JSX.Element = () => {
    const tickNumber = 24
    const tickLabelInterval = (time: { getHours: () => number }): boolean => time.getHours() % 2 === 0

    return (
      <LineChart
        slots={{
          axisContent: CustomAxisContentWithTime
        }}
        margin={{ left: 90 }}
        xAxis={[
          {
            dataKey: 'timestamp',
            scaleType: 'time',
            tickNumber,
            tickLabelInterval,
            valueFormatter: (value: Date): string =>
              value.toLocaleString('pl-PL', { hour: '2-digit', minute: '2-digit', hour12: false })
          }
        ]}
        series={[
          {
            dataKey: 'runningPowerStationsNumber',
            curve: 'linear',
            label: 'Liczba uruchomionych elektrowni',
            color: 'orange'
          }
        ]}
        dataset={powerProductionPrediction as Array<{ timestamp: Date, runningPowerStationsNumber: number }>}
      />
    )
  }

  return (
    <>
      <Stack direction={'row'} justifyContent={'flex-start'} spacing={20} p={1}>
        <Box minWidth={150} minHeight={150}>
          <Card>
          <DateCalendar
            disableHighlightToday
            disabled={isPrediction}
            value={date}
            onChange={handleDateChange}
            views={['day']}
            defaultValue={moment().add(1, 'days')}
            minDate={moment().add(1, 'days')}
            maxDate={moment().add(14, 'days')}
            sx={{ m: 0 }} />
          </Card>
        </Box>
        <Stack spacing={5}>
          <Stack direction={'row'} spacing={5} justifyContent={'space-between'}>
            <ToggleButtonGroup
              disabled={isPrediction}
              value={powerStationsScope}
              exclusive
              onChange={handlePowerStationsChange}
            >
              <ToggleButton value={PowerStationsScope.AllPowerStations}>
                Wszystkie elektrownie
              </ToggleButton>
              <ToggleButton value={PowerStationsScope.WorkingPowerStations}>
                Tylko sprawne
              </ToggleButton>
            </ToggleButtonGroup>
            {isPrediction
              ? (<Button variant={'outlined'} onClick={handleClearPrediction}>Wyczyść predykcję</Button>)
              : (<Button variant={'contained'} onClick={handleMakePrediction}>Wykonaj predykcję</Button>)}
          </Stack>
          <Stack direction={'row'} spacing={5}>
            <Card sx={{ minWidth: 350, minHeight: 150 }} raised>
              <CardContent sx={{ pt: 3 }}>
                <Typography variant={'h5'} textAlign={'center'} fontWeight={'bold'}>
                  Liczba elektrowni
                </Typography>
                <Typography variant={'h6'} mt={4} textAlign={'center'}>
                  {getPowerStationsNumberText()}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ minWidth: 350, minHeight: 150 }} raised>
              <CardContent sx={{ pt: 3 }}>
                <Typography variant={'h5'} textAlign={'center'} fontWeight={'bold'}>
                  Prąd sumarycznie
                </Typography>
                <Typography variant={'h6'} mt={4} textAlign={'center'}>
                  {getAllDayPowerProductionPredictionText()}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </Stack>
      {powerProductionPrediction !== undefined && allPowerStations !== undefined && (
        <>
          <Box sx={{
            width: '100%',
            minWidth: '700px',
            minHeight: '400px',
            flex: 1,
            padding: 0,
            border: 1,
            borderTop: 0,
            borderColor: 'divider'
          }}>
            <Divider orientation="horizontal" flexItem/>
            {createPowerProductionPredictionChart()}
          </Box>
          <Box sx={{
            width: '100%',
            minWidth: '700px',
            minHeight: '400px',
            flex: 1,
            padding: 0,
            border: 1,
            borderTop: 0,
            borderColor: 'divider'
          }}>
            {createPowerTurnOnPredictionChart()}
          </Box>
        </>
      )}
    </>
  )
}

export default PowerProductionPrediction
