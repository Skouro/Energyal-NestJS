import { Injectable } from '@nestjs/common';
import { MeterService } from '../meter/meter.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IMeasurment } from '../../interfaces/measurment.interface';
import { CustomException } from '../../utils/custom-exception';
import { PruebaGateway } from '../../gateways/prueba.gateway';
import { MeasurementGateway } from '../../gateways/measurement.gateway';

@Injectable()
export class MeasurmentService {
  // @ts-ignore
  constructor(@InjectModel('Measurement') private measurementModel: Model,
              private meterService: MeterService,
              private  socket: MeasurementGateway) {
  }

  async insert(measurement: IMeasurment) {
    let result;
    let exception;
    const meter = await this.meterService.getOne(measurement.meter);
    if (!meter.electrodomestic) {
      return Promise.reject(CustomException.clientError('No ha sido registrado por ningún usuario'));
    }
    measurement.meter = meter._id;
    const power = meter.electrodomestic.voltage * measurement.irms;
    measurement.endTime = new Date();
    measurement.startTime = new Date(new Date().getTime() - measurement.interval);
    measurement.endTime.setHours(measurement.endTime.getHours() - 5);
    measurement.startTime.setHours(measurement.startTime.getHours() - 5);
    const joules = power * measurement.interval;
    measurement.kwh = joules / 3600000;
    measurement.value = measurement.kwh * 217.53;
    const newMeasurement = new this.measurementModel(measurement);
    await newMeasurement.save().then(res => {
      if (!res) {
        exception = 'No se encontró el medidor';
      }
      result = res;
      this.socket.sendMeasuremest(res);

    }).catch(reason => {
      exception = reason;
      console.log(reason);
    });
    return await result == null ? Promise.reject(exception) : Promise.resolve(result);
  }
}
