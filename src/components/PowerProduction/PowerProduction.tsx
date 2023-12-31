import * as React from 'react'
import Typography from '@mui/material/Typography'
import { Card, CardContent, Grid } from '@mui/material'
import classes from './PowerProduction.module.css'
import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import {
  fetchLast48HoursPowerProduction, fetchLast60DaysPowerProduction,
  fetchLast60MinutesPowerProduction, fetchPowerStationsCount, selectActualPowerProduction, selectAllPowerStations,
  selectLast48HoursDataset, selectLast60DaysDataset,
  selectLast60MinutesDataset, selectPowerStationsMaintenance, selectRunningPowerStations
} from '../../redux/slices/powerProductionSlice'
import PowerProductionCharts from '../common/PowerProductionCharts/PowerProductionCharts'

// eslint-disable-next-line
const UPDATE_INTERVAL = Number(process.env.REACT_APP_API_UPDATE_INTERVAL || 60000) // 1 minute

interface CardProps {
  key: string
  header: string
  text: string
}

const PowerProduction: React.FC = () => {
  const dispatch = useAppDispatch()
  const last60MinutesDataset = useAppSelector(selectLast60MinutesDataset)
  const last48HoursDataset = useAppSelector(selectLast48HoursDataset)
  const last60DaysDataset = useAppSelector(selectLast60DaysDataset)

  useEffect(() => {
    void dispatch(fetchLast60MinutesPowerProduction())
    void dispatch(fetchLast48HoursPowerProduction())
    void dispatch(fetchLast60DaysPowerProduction())
    void dispatch(fetchPowerStationsCount())
    const interval = setInterval(() => {
      void dispatch(fetchLast60MinutesPowerProduction())
      void dispatch(fetchLast48HoursPowerProduction())
      void dispatch(fetchLast60DaysPowerProduction())
      void dispatch(fetchPowerStationsCount())
    }, UPDATE_INTERVAL)
    return () => { clearInterval(interval) }
  }, [])

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

  const getCardsProps = (): CardProps[] => [
    {
      key: 'actual-power-production',
      header: 'Sumaryczna produkcja prądu',
      text: getActualPowerProductionText()
    },
    {
      key: 'running-power-stations',
      header: 'Liczba aktywnych elektrowni',
      text: getRunningPowerStationsText()
    },
    {
      key: 'maintenance-power-stations',
      header: 'Liczba elektrowni w naprawie',
      text: getPowerStationsMaintenanceText()
    }
  ]

  return (
    <>
      <Grid
        container
        direction="row"
        justifyContent="space-around"
        alignItems="center"
        mt={0.5}
      >
        {getCardsProps().map((props) => {
          // eslint-disable-next-line react/prop-types
          const { key, header, text } = props
          return (
            <Grid item className={classes.gridItem} key={key}>
              <Card className={classes.card}>
                <CardContent className={classes.cardContent}>
                  <Typography variant={'h5'} className={classes.cardName}>
                    {header}
                  </Typography>
                  <Typography variant={'h6'} mt={4} textAlign={'center'}>
                    {text}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
      <PowerProductionCharts
        dataKey={'aggregatedValue'}
        last60MinutesDataset={last60MinutesDataset}
        last48HoursDataset={last48HoursDataset}
        last60DaysDataset={last60DaysDataset} />
    </>
  )
}

export default PowerProduction
