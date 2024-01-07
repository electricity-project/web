import { type ChartsAxisContentProps, ChartsAxisTooltipContent } from '@mui/x-charts'
import * as React from 'react'

const CustomAxisContent: React.FC<{ chartsAxisContentProps: ChartsAxisContentProps, isTime: boolean }> = (
  {
    chartsAxisContentProps,
    isTime
  }) => {
  const valueFormatter = (value: Date): string => {
    let options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
    if (isTime) {
      options = { ...options, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
      return value.toLocaleString('pl-PL', options)
    }
    return value.toLocaleDateString('pl-PL', options)
  }
  const contentProps = { ...chartsAxisContentProps, axis: { ...chartsAxisContentProps.axis, valueFormatter } }
  return (
    <ChartsAxisTooltipContent contentProps={contentProps} axisData={chartsAxisContentProps.axisData} classes={chartsAxisContentProps.classes}/>
  )
}

export const CustomAxisContentWithTime: React.FC<ChartsAxisContentProps> = (chartsAxisContentProps) => {
  return (
    <CustomAxisContent chartsAxisContentProps={chartsAxisContentProps} isTime={true} />
  )
}

export const CustomAxisContentWithoutTime: React.FC<ChartsAxisContentProps> = (chartsAxisContentProps) => {
  return (
    <CustomAxisContent chartsAxisContentProps={chartsAxisContentProps} isTime={false} />
  )
}
