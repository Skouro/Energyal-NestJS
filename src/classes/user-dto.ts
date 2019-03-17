import { Citys, IUser } from '../interfaces/user.interface';
import { Electrodomestic } from '../interfaces/electrodomestic.interface';

export class UserDto implements IUser {
  constructor(user?: IUser) {
    this.name = user.name;
    this.city = user.city;
    this.email = user.email;
    this.password = user.password;
    this.electrodomestics = user.electrodomestics;
    this.status = user.status;
  }
  city: string;
  electrodomestics: [Electrodomestic];
  email: string;
  name: string;
  password: string;
  status: boolean;
}