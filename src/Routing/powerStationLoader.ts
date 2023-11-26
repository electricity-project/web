// TODO
const powerStationLoader = async ({ params }: { params: any }): Promise<{ type: string | undefined, id: number | undefined }> => {
  if (params.id === '1') {
    return { type: 'wind-turbine', ...params }
  } else if (params.id === '2') {
    return { type: 'solar-panel', ...params }
  }
  return { id: undefined, type: undefined }
}

export default powerStationLoader
