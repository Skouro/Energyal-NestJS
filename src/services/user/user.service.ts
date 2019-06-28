import { Model } from 'mongoose';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EncryptPipe } from '../../pipes/encrypt.pipe';
import * as bcrypt from 'bcrypt';
import { CustomException } from '../../utils/custom-exception';
// @ts-ignore
import * as  emailExistence from 'email-existence';
import { UserSocketService } from '../user-socket/user-socket.service';
import { ParameterService } from '../parameter/parameter.service';
import { UserDto } from './../../dto/user.dto';
import { ParameterDto } from './../../dto/parameter.dto';

@Injectable()
export class UserService {
  constructor(
    // @ts-ignore
    @InjectModel('User') private userModel: Model,
    // @ts-ignore
    @InjectModel('Electrodomestic') private electrodomesticModel: Model,
    private parameterService: ParameterService,
  ) {
  }

  async create(user: UserDto): Promise<UserDto> {
    user.password = new EncryptPipe().transform(user.password);
    return await new this.userModel(user).save()
      .then(value => {
        const param = new ParameterDto();
        param.user = value._id;
        this.parameterService.add(param);
      })
      .catch(reason => {
        CustomException.saveExceptio(reason);
      });
  }

  async login(user: UserDto) {
    return new Promise((resolve, reject) => {
      this.userModel.findOne({ email: user.email }, 'city email name password stratum', (err, res) => {
        if (err) {
          reject(new HttpException({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: err,
          }, 400));
        }
        if (!res) {
          reject(new HttpException({
            status: HttpStatus.BAD_REQUEST,
            error: 'Usuario o contraseña incorrecta',
          }, 400));
        } else {
          if (!bcrypt.compareSync(user.password, res.password)) {
            reject(new HttpException({
              status: HttpStatus.UNAUTHORIZED,
              error: 'Usuario o contraseña incorrecta',
            }, 400));
          }
        }

        resolve(res);
      });
    });
  }

  async findAll(): Promise<[UserDto]> {
    return await this.userModel.find().exec();
  }

  async getElectrodomestics(idUser) {
    const electros = await this.userModel.findOne({ _id: idUser })
      .populate('electrodomestics.electrodomestic', 'name')
      .exec();
    return electros;
  }

  async addElectrodomestic(idUser, idElectro, role?) {
    return await this.userModel.findOne({ _id: idUser }, (err, res) => {
      res.electrodomestics.push({ electrodomestic: idElectro, role });
      res.save();
    });
  }

  async challengPassword(idUser, oldPassword, newPassword): Promise<any> {
    let w;
    await this.userModel.findOne({ _id: idUser }, 'password', (err, res) => {
      if (bcrypt.compareSync(oldPassword, res.password)) {
        res.password = new EncryptPipe().transform(newPassword);
        res.save().then(value => value);
        w = true;
      } else {
        w = false;
      }
    });
    return w;
  }

  emailExist(email): Promise<any> {
    return new Promise((resolve, reject) => {
      emailExistence.check(email, (err, inf) => {
        resolve(inf);
      });
    });
  }

  async userExist(email) {
    return await this.userModel.findOne({ email }, 'email', (err, res) => {
      return res;
    });
  }

  async getMeters(user) {
    let meters;
    await this.userModel.findById(user, 'electrodomestics')
      .populate('electrodomestic').then(async value => {
        const idsElectro = value.electrodomestics.map((electro) => electro.electrodomestic);
        const auxMeters = await this.electrodomesticModel.find({ _id: { $in: idsElectro } });
        meters = auxMeters.map((item) => item.meter);
      });

    return meters;
  }

  async getOne(id) {
    return await this.userModel.findById(id);
  }
}
