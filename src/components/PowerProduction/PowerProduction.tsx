import * as React from 'react'
import Typography from '@mui/material/Typography'
import { Card, CardContent, Grid } from '@mui/material'
import classes from './PowerProduction.module.css'
import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { LineChart } from '@mui/x-charts'
import { type JSX } from 'react'
import moment from 'moment'

const testDataset1 = []

moment.locale('pl')

for (let i = 60; i > 0; i--) {
  const newDate = moment().subtract(i, 'm').toDate()
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  testDataset1.push({ timestamp: newDate, aggregatedValue: Math.floor(Math.random() * (100 + 1)) })
}

const testDataset2 = []

for (let i = 48; i > 0; i--) {
  const newDate = moment().subtract(i, 'h').toDate()
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  testDataset2.push({ timestamp: newDate, aggregatedValue: Math.floor(Math.random() * (100 + 1)) })
}

const testDataset3 = []

for (let i = 59; i >= 0; i--) {
  const newDate = moment().subtract(i, 'day').toDate()
  newDate.setHours(0)
  newDate.setMinutes(0)
  newDate.setSeconds(0)
  newDate.setMilliseconds(0)
  testDataset3.push({ timestamp: newDate, aggregatedValue: Math.floor(Math.random() * (100 + 1)) })
}

const testDatasets = [testDataset1, testDataset2, testDataset3]

const PowerProduction: React.FC = () => {
  const [value, setValue] = React.useState(0)

  const handleChange = (_event: React.SyntheticEvent, newValue: number): void => {
    setValue(newValue)
  }

  const chart: () => JSX.Element = () => {
    const tickNumber = value === 1 ? 48 : 60
    const tickLabelInterval = value === 0 ? (time: { getMinutes: () => number }) => time.getMinutes() % 5 === 0 : value === 1 ? (time: { getHours: () => number }) => time.getHours() % 4 === 0 : undefined
    console.log(testDatasets[value])
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
        dataset={testDatasets[value]}
      />
    )
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
              500000 kWh
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
              1300 / 1500
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
              10
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    <Box sx={{ width: '100%', minHeight: 0, flex: 1, display: 'flex', flexFlow: 'column', typography: 'body1', mt: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Ostatnie 60 minut" sx={{ textTransform: 'none' }} />
          <Tab label="Ostatnie 48 godzin" sx={{ textTransform: 'none' }} />
          <Tab label="Ostatnie 60 dni" sx={{ textTransform: 'none' }} />
        </Tabs>
      </Box>
      <Box sx={{ width: '100%', minWidth: '700px', minHeight: '200px', flex: 1, padding: 0, border: 1, borderTop: 0, borderColor: 'divider' }}>
        {chart()}
      </Box>
    </Box>
    </>
  )
}

export default PowerProduction
