import * as React from 'react'
import Typography from '@mui/material/Typography'
import { Card, CardContent, Grid } from '@mui/material'
import classes from './PowerProduction.module.css'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { LineChart } from '@mui/x-charts'
import { type JSX, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  fetchPowerProduction, selectActualPowerProduction, selectAllPowerStations,
  selectLast48HoursDataset, selectLast60DaysDataset,
  selectLast60MinutesDataset, selectPowerStationsMaintenance, selectRunningPowerStations
} from '../../redux/slices/powerProductionSlice'

const UPDATE_INTERVAL = 60000 // 1 minute

const PowerProduction: React.FC = () => {
  const [tabIndex, setTabIndex] = React.useState(0)
  const dispatch = useAppDispatch()

  useEffect(() => {
    void dispatch(fetchPowerProduction())
    const interval = setInterval(() => {
      void dispatch(fetchPowerProduction())
    }, UPDATE_INTERVAL)
    return () => { clearInterval(interval) }
  }, [])

  const handleChange = (_event: React.SyntheticEvent, newTabIndex: number): void => {
    setTabIndex(newTabIndex)
  }

  const getChart: () => JSX.Element = () => {
    const last60MinutesDataset = useAppSelector(selectLast60MinutesDataset)
    const last48HoursDataset = useAppSelector(selectLast48HoursDataset)
    const last60DaysDataset = useAppSelector(selectLast60DaysDataset)
    const chartDatasets = [last60MinutesDataset, last48HoursDataset, last60DaysDataset]
    const tickNumber = tabIndex === 1 ? 48 : 60
    const tickLabelInterval =
      tabIndex === 0
        ? (time: { getMinutes: () => number }) => time.getMinutes() % 5 === 0
        : tabIndex === 1
          ? (time: { getHours: () => number }) => time.getHours() % 4 === 0
          : undefined

    return (
      <LineChart
        // slotProps={{ axisContent: { axisValue: 'test' } }}
        xAxis={[
          {
            dataKey: 'timestamp',
            scaleType: 'time',
            tickNumber,
            tickLabelInterval
          }
        ]}
        series={[
          {
            dataKey: 'aggregatedValue',
            curve: 'linear',
            label: 'Produkcja prądu (kWh)'
          }
        ]}
        dataset={chartDatasets[tabIndex] ?? []}
      />
    )
  }

  const getActualPowerProductionText = (): string => {
    const actualPowerProduction = useAppSelector(selectActualPowerProduction)
    return actualPowerProduction === undefined ? '-' : `${actualPowerProduction} kWh`
  }

  const getRunningPowerStationsText = (): string => {
    const allPowerStations = useAppSelector(selectAllPowerStations)
    const runningPowerStations = useAppSelector(selectRunningPowerStations)
    return allPowerStations === undefined || runningPowerStations === undefined
      ? '-'
      : `${runningPowerStations} / ${allPowerStations}`
  }

  const getPowerStationsMaintenanceText = (): string => {
    const powerStationsMaintenance = useAppSelector(selectPowerStationsMaintenance)
    return (powerStationsMaintenance ?? '-').toString()
  }

  return (
    <>
      <Typography variant='h4' mb={4}>
        Stan produkcji prądu
      </Typography>
      <Grid
        container
        direction="row"
        justifyContent="space-around"
        alignItems="center"
      >
        <Grid item className={classes.gridItem}>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Typography variant={'h5'} className={classes.cardName}>
                Sumaryczna produkcja prądu
              </Typography>
              <Typography variant={'h6'} mt={4} textAlign={'center'}>
                {getActualPowerProductionText()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item className={classes.gridItem}>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Typography variant={'h5'} className={classes.cardName}>
                Liczba aktywnych elektrownii
              </Typography>
              <Typography variant={'h6'} mt={4} textAlign={'center'}>
                {getRunningPowerStationsText()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item className={classes.gridItem}>
          <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
              <Typography variant={'h5'} className={classes.cardName}>
                Liczba elektrowni w naprawie
              </Typography>
              <Typography variant={'h6'} mt={4} textAlign={'center'}>
                {getPowerStationsMaintenanceText()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ width: '100%', minHeight: 0, flex: 1, display: 'flex', flexFlow: 'column', typography: 'body1', mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabIndex} onChange={handleChange}>
            <Tab label="Ostatnie 60 minut" sx={{ textTransform: 'none' }} />
            <Tab label="Ostatnie 48 godzin" sx={{ textTransform: 'none' }} />
            <Tab label="Ostatnie 60 dni" sx={{ textTransform: 'none' }} />
          </Tabs>
        </Box>
        <Box sx={{ width: '100%', minWidth: '700px', minHeight: '200px', flex: 1, padding: 0, border: 1, borderTop: 0, borderColor: 'divider' }}>
          {getChart()}
        </Box>
      </Box>
    </>
  )
}

export default PowerProduction
