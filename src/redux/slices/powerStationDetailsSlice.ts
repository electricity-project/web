import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type RootState } from '../store'
import axios from '../../axiosConfig'
import type { GridRowId, GridValidRowModel } from '@mui/x-data-grid'

export const fetchPowerStationDetails = createAsyncThunk(
  'powerStationDetails/fetch',
  async (id: GridRowId, { rejectWithValue }) => {
    return await axios.get(`/power-station/${id}`)
      .then(response => {
        return response.data
      }).catch(error => {
        console.error(error)
        return rejectWithValue(error)
      })
  }
)

interface powerStationDetailsState {
  details: any
  isDisconnectConfirmDialogOpen: boolean
  disconnectConfirmDialogId: GridRowId | undefined
}

const initialState: powerStationDetailsState = {
  details: undefined,
  isDisconnectConfirmDialogOpen: false,
  disconnectConfirmDialogId: undefined
}

const powerStationDetailsSlice = createSlice({
  name: 'powerStationDetails',
  initialState,
  reducers: {
    reset: () => initialState,
    openDisconnectConfirmDialog: (state, action) => {
      state.isDisconnectConfirmDialogOpen = true
      state.disconnectConfirmDialogId = action.payload
    },
    closeDisconnectConfirmDialog: (state) => {
      state.isDisconnectConfirmDialogOpen = false
      state.disconnectConfirmDialogId = undefined
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPowerStationDetails.pending, (state) => {
        state.details = undefined
      })
      .addCase(fetchPowerStationDetails.fulfilled, (state, action: PayloadAction<GridValidRowModel[]>) => {
        state.details = action.payload
      })
      .addCase(fetchPowerStationDetails.rejected, (state, action: any) => {

      })
  }
})

export const {
  reset,
  openDisconnectConfirmDialog,
  closeDisconnectConfirmDialog
} = powerStationDetailsSlice.actions
export const selectIsDisconnectConfirmDialogOpen = (state: RootState): boolean => state.powerStationDetails.isDisconnectConfirmDialogOpen
export const selectDisconnectConfirmDialogId = (state: RootState): GridRowId | undefined => state.powerStationDetails.disconnectConfirmDialogId
export default powerStationDetailsSlice.reducer
