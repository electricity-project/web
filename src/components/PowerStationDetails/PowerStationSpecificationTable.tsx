import {
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableRow,
  Tooltip
} from '@mui/material'
import Box from '@mui/material/Box'
import ipaddr from 'ipaddr.js'
import type { JSX } from 'react'
import * as React from 'react'

import {
  type PowerStationDetails,
  type SolarPanelDetails,
  type WindTurbineDetails
} from '../../redux/slices/powerStationDetailsSlice'
import PowerStationStateChip from '../common/PowerStationStateChip'
import PowerStationTypeChip from '../common/PowerStationTypeChip'
import { PowerStationType } from '../common/types'

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.body}`]: {
    fontSize: 16,
    whiteSpace: 'nowrap',
    width: '50%'
  },
  [`&.${tableCellClasses.body}.th`]: {
    fontWeight: 'bold',
    paddingLeft: '30%',
    whiteSpace: 'nowrap',
    width: 'auto'
  }
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0
  }
}))

const PowerStationSpecificationTable: React.FC<{ powerStationDetails: PowerStationDetails }> = ({ powerStationDetails }) => {
  const createOtherRows = (): JSX.Element | null => {
    switch (powerStationDetails.type) {
      case PowerStationType.WindTurbine:
        return (
          <StyledTableRow>
            <StyledTableCell align="left" className={'th'}>Długość łopat wirnika</StyledTableCell>
            <StyledTableCell align="left">{(powerStationDetails as WindTurbineDetails).bladeLength}</StyledTableCell>
          </StyledTableRow>
        )
      case PowerStationType.SolarPanel:
        return (
          <StyledTableRow>
            <StyledTableCell align="left" className={'th'}>Optymalna temperatura</StyledTableCell>
            <StyledTableCell align="left">{(powerStationDetails as SolarPanelDetails).optimalTemperature} °C</StyledTableCell>
          </StyledTableRow>
        )
      default:
        return null
    }
  }

  return (
    <Box sx={{ width: '100%', minWidth: '700px', flex: 1, padding: 0 }}>
      <TableContainer component={Paper} >
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableBody>
            <StyledTableRow>
              <StyledTableCell align="left" className={'th'}>Adres IPv6</StyledTableCell>
              <StyledTableCell align="left">
                <Tooltip disableInteractive title={ipaddr.isValid(powerStationDetails.ipv6) ? ipaddr.parse(powerStationDetails.ipv6).toString() : powerStationDetails.ipv6} >
                  <span>{powerStationDetails.ipv6}</span>
                </Tooltip>
                {}
              </StyledTableCell>
            </StyledTableRow>
            <StyledTableRow>
              <StyledTableCell align="left" className={'th'}>Typ</StyledTableCell>
              <StyledTableCell align="left">
                <PowerStationTypeChip powerStationType={powerStationDetails.type} />
              </StyledTableCell>
            </StyledTableRow>
            <StyledTableRow>
              <StyledTableCell align="left" className={'th'}>Status</StyledTableCell>
              <StyledTableCell align="left">
                <PowerStationStateChip powerStationState={powerStationDetails.state} />
              </StyledTableCell>
            </StyledTableRow>
            <StyledTableRow>
              <StyledTableCell align="left" className={'th'}>Data utworzenia</StyledTableCell>
              <StyledTableCell align="left">
                {powerStationDetails.creationTime.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </StyledTableCell>
            </StyledTableRow>
            {createOtherRows()}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default PowerStationSpecificationTable
