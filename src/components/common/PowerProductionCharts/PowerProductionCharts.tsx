import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { LineChart } from '@mui/x-charts'
import type { JSX } from 'react'
import * as React from 'react'

import {
  type PowerProductionAggregation
} from '../../../redux/slices/powerProductionSlice'
import { type PowerProduction } from '../../../redux/slices/powerStationDetailsSlice'
import { CustomAxisContentWithoutTime, CustomAxisContentWithTime } from './CustomAxisContent'

interface PowerProductionChartsProps {
  dataKey: string
  last60MinutesDataset: PowerProductionAggregation[] | PowerProduction[]
  last48HoursDataset: PowerProductionAggregation[] | PowerProduction[]
  last60DaysDataset: PowerProductionAggregation[] | PowerProduction[]
}

const PowerProductionCharts: React.FC<PowerProductionChartsProps> =
  ({
    dataKey,
    last60MinutesDataset,
    last48HoursDataset,
    last60DaysDataset
  }) => {
    const [tabIndex, setTabIndex] = React.useState(0)

    const handleTabChange = (_event: React.SyntheticEvent, newTabIndex: number): void => {
      setTabIndex(newTabIndex)
    }

    const createPowerProductionChart: () => JSX.Element = () => {
      const chartDatasets: Array<Array<{ timestamp: Date, aggregatedValue: number } | { timestamp: Date, power: number }>> = [last60MinutesDataset, last48HoursDataset, last60DaysDataset]
      const tickNumber = tabIndex === 1 ? 48 : 60
      const tickLabelInterval =
      tabIndex === 0
        ? (time: { getMinutes: () => number }) => time.getMinutes() % 5 === 0
        : tabIndex === 1
          ? (time: { getHours: () => number }) => time.getHours() % 4 === 0
          : (time: { getDay: () => number }) => time.getDay() % 4 === 0

      return (
      <LineChart
        slots={{
          axisContent: tabIndex === 2 ? CustomAxisContentWithoutTime : CustomAxisContentWithTime
        }}
        margin={{ left: 90 }}
        xAxis={[
          {
            dataKey: 'timestamp',
            scaleType: 'time',
            tickNumber,
            tickLabelInterval,
            valueFormatter: (value: Date): string => {
              let options: Intl.DateTimeFormatOptions
              if (tabIndex === 2) {
                options = { day: 'numeric', month: 'short' }
                return value.toLocaleDateString('pl-PL', options)
              }
              options = { hour: '2-digit', minute: '2-digit', hour12: false }
              return value.toLocaleString('pl-PL', options)
            }
          }
        ]}
        series={[
          {
            dataKey,
            curve: 'linear',
            label: 'Produkcja energii elektrycznej (kWh)'
          }
        ]}
        dataset={chartDatasets[tabIndex]}
      />
      )
    }

    return (
    <Box sx={{ width: '100%', minHeight: '350px', flex: 1, display: 'flex', flexFlow: 'column', typography: 'body1', mt: 3 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabIndex} onChange={handleTabChange}>
          <Tab label="Ostatnie 60 minut" sx={{ textTransform: 'none' }} />
          <Tab label="Ostatnie 48 godzin" sx={{ textTransform: 'none' }} disabled={last48HoursDataset.length === 0}/>
          <Tab label="Ostatnie 60 dni" sx={{ textTransform: 'none' }} disabled={last60DaysDataset.length === 0} />
        </Tabs>
      </Box>
      <Box sx={{ width: '100%', minWidth: '700px', minHeight: '200px', flex: 1, padding: 0, border: 1, borderTop: 0, borderColor: 'divider' }}>
        {createPowerProductionChart()}
      </Box>
    </Box>
    )
  }

export default PowerProductionCharts
