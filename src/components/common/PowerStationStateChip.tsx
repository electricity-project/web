import * as React from 'react'
import { PowerStationState, powerStationStateToString } from './types'
import { CheckCircleOutline, Construction, ErrorOutline, HelpOutline, PauseCircleOutline } from '@mui/icons-material'
import { Chip, Tooltip } from '@mui/material'

const PowerStationStateChip: React.FC<{ powerStationState: PowerStationState | undefined }> = ({ powerStationState }) => {
  let icon, color, title, label
  switch (powerStationState) {
    case PowerStationState.Working:
      color = 'success' as const
      icon = <CheckCircleOutline />
      title = 'Elektrownia produkuje prąd'
      label = powerStationStateToString(PowerStationState.Working, true)
      break
    case PowerStationState.Stopped:
      color = undefined
      icon = <PauseCircleOutline />
      title = 'Elektrownia nie produkuje prądu'
      label = powerStationStateToString(PowerStationState.Stopped, true)
      break
    case PowerStationState.Damaged:
      color = 'error' as const
      icon = <ErrorOutline />
      title = 'Elektrownia jest niesprawna'
      label = powerStationStateToString(PowerStationState.Damaged, true)
      break
    case PowerStationState.Maintenance:
      color = 'warning' as const
      icon = <Construction />
      title = 'Elektrownia jest naprawiana'
      label = powerStationStateToString(PowerStationState.Maintenance, true)
      break
    default:
      color = 'default' as const
      icon = <HelpOutline />
      label = 'Nieznany'
      title = 'Status elektrowni jest nieznany'
  }
  return (
    <Tooltip disableInteractive title={title} >
      <Chip
        size="medium"
        variant="outlined"
        color={color}
        icon={icon}
        label={label} />
    </Tooltip>
  )
}

export default PowerStationStateChip
