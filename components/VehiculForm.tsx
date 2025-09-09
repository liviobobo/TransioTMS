import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'react-toastify'
import api from '../utils/api'
import { VEHICLE_STATUS } from '../utils/constants'
import { useLoading } from '../hooks/useLoading'

import { VehiculHeader } from './vehicul/VehiculHeader'
import { VehiculInfoSection } from './vehicul/VehiculInfoSection'
import { SpecificatiiTehnice } from './vehicul/SpecificatiiTehnice'
import { IntretinereSection } from './vehicul/IntretinereSection'
import { StatusSection } from './vehicul/StatusSection'
import { ReparatiiSection } from './vehicul/ReparatiiSection'
import { VehiculFormActions } from './vehicul/VehiculFormActions'
import { VehiculFormProps, VehiculFormData } from './vehicul/types'

export default function VehiculForm({ vehicul, onSuccess, onCancel }: VehiculFormProps) {
  const { loading, execute: saveVehicul } = useLoading()

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<VehiculFormData>({
    defaultValues: {
      numarInmatriculare: '',
      marca: '',
      model: '',
      anFabricatie: new Date().getFullYear(),
      capacitate: 0,
      unitateCapacitate: 'tone',
      spatiuIncarcare: {
        dimensiuni: {
          unitateDimensiuni: 'metri'
        },
        tipIncarcare: ''
      },
      kmActuali: 0,
      intervalRevizie: {
        km: 10000,
        luni: 6
      },
      asigurareExpira: new Date(),
      itpExpira: new Date(),
      status: 'Activ',
      reparatii: []
    }
  })

  const reparatiiFieldArray = useFieldArray({
    control,
    name: 'reparatii'
  })

  useEffect(() => {
    if (vehicul) {
      reset({
        numarInmatriculare: vehicul.numarInmatriculare || '',
        marca: vehicul.marca || '',
        model: vehicul.model || '',
        anFabricatie: vehicul.anFabricatie || new Date().getFullYear(),
        capacitate: vehicul.capacitate || 0,
        unitateCapacitate: vehicul.unitateCapacitate || 'tone',
        spatiuIncarcare: {
          dimensiuni: {
            inaltime: vehicul.spatiuIncarcare?.dimensiuni?.inaltime,
            latime: vehicul.spatiuIncarcare?.dimensiuni?.latime,
            lungime: vehicul.spatiuIncarcare?.dimensiuni?.lungime,
            unitateDimensiuni: vehicul.spatiuIncarcare?.dimensiuni?.unitateDimensiuni || 'metri'
          },
          tipIncarcare: vehicul.spatiuIncarcare?.tipIncarcare || '',
          infoSpatiu: vehicul.spatiuIncarcare?.infoSpatiu || ''
        },
        kmActuali: vehicul.kmActuali || 0,
        dataUltimeiRevizii: vehicul.dataUltimeiRevizii ? new Date(vehicul.dataUltimeiRevizii) : undefined,
        kmUltimaRevizie: vehicul.kmUltimaRevizie,
        intervalRevizie: {
          km: vehicul.intervalRevizie?.km || 10000,
          luni: vehicul.intervalRevizie?.luni || 6
        },
        asigurareExpira: vehicul.asigurareExpira ? new Date(vehicul.asigurareExpira) : new Date(),
        itpExpira: vehicul.itpExpira ? new Date(vehicul.itpExpira) : new Date(),
        status: vehicul.status || 'Activ',
        note: vehicul.note || '',
        reparatii: vehicul.reparatii?.map((rep: any) => ({
          ...rep,
          data: new Date(rep.data)
        })) || []
      })
    }
  }, [vehicul, reset])

  const onSubmit = async (data: VehiculFormData) => {
    await saveVehicul(async () => {
      const submitData = {
        ...data,
        asigurareExpira: data.asigurareExpira.toISOString(),
        itpExpira: data.itpExpira.toISOString(),
        dataUltimeiRevizii: data.dataUltimeiRevizii?.toISOString(),
        reparatii: data.reparatii.map(rep => ({
          ...rep,
          data: rep.data.toISOString()
        }))
      }

      let response
      if (vehicul?._id) {
        response = await api.put(`/vehicule/${vehicul._id}`, submitData)
      } else {
        response = await api.post('/vehicule', submitData)
      }

      if (response.data.success) {
        toast.success(vehicul ? 'Vehicul actualizat cu succes!' : 'Vehicul adăugat cu succes!')
        onSuccess()
        return response.data
      }

      throw new Error('Eroare la salvarea vehiculului')
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <VehiculHeader vehicul={vehicul} onCancel={onCancel} />

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          <VehiculInfoSection register={register} errors={errors} />

          <SpecificatiiTehnice register={register} control={control} errors={errors} />

          <IntretinereSection register={register} control={control} errors={errors} />

          <StatusSection 
            register={register} 
            control={control} 
            errors={errors} 
            statusOptions={VEHICLE_STATUS}
          />

          <ReparatiiSection 
            control={control} 
            fieldArray={reparatiiFieldArray} 
            errors={errors} 
          />

          <VehiculFormActions 
            loading={loading} 
            vehicul={vehicul} 
            onCancel={onCancel} 
          />
        </form>
      </div>
    </div>
  )
}