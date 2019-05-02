import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MeterService } from '../services/meter/meter.service';
import { Server } from 'socket.io';

@WebSocketGateway()
export class MeterGateway {
  @WebSocketServer()
  server: Server;

  constructor(private meterService: MeterService) {
  }

  @SubscribeMessage('newMeterSession')
  newSession(client: any, payload) {
    const meter: { serial } = (JSON.parse(payload));
    this.meterService.getOwner(meter.serial).then(value => { // ingresa medidor en la sala de su dueño
      client.join(value.user); // cada usuario tiene una sala la cual es us id mongo
      // client.join(value.user).broadcast.to('dsfaf').emit()
    });
  }
}
