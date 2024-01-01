import * as React from 'react'
import { PowerStationType } from './types'
import { HelpOutline, SolarPower, WindPower } from '@mui/icons-material'
import { Chip, Tooltip } from '@mui/material'

const PowerStationTypeChip: React.FC<{ powerStationType: PowerStationType | undefined }> = ({ powerStationType }) => {
  let icon, color, title, borderColor, label
  switch (powerStationType) {
    case PowerStationType.WindTurbine:
      borderColor = color = '#6a86d3'
      icon = <WindPower color='inherit' />
      title = 'Turbina wiatrowa'
      label = 'Wiatrowa'
      break
    case PowerStationType.SolarPanel:
      borderColor = color = '#e1b907'
      icon = <SolarPower color='inherit' />
      title = 'Panele solarne'
      label = 'Słoneczna'
      break
    default:
      color = '#616161'
      borderColor = 'default'
      icon = <HelpOutline sx={{ color }} />
      title = 'Typ elektrowni nie jest znany'
      label = 'Nieznany'
  }
  return (
    <Tooltip disableInteractive title={title} >
      <Chip
        size="medium"
        variant="outlined"
        color={'default'}
        sx={{ color, borderColor }}
        icon={icon}
        label={label} />
    </Tooltip>
  )
}

export default PowerStationTypeChip
