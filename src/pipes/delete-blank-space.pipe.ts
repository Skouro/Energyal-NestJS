import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class DeleteBlankSpacePipe implements PipeTransform {
  transform(value: any, metadata?: ArgumentMetadata) {
    for (const v in value) {
      if (typeof value[v] == 'string') {
        value[v] = value[v].trim();
      }
    }
    return value;
  }
}
