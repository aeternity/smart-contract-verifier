import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { isAddressValid, Encoding } from '@aeternity/aepp-sdk';

@ValidatorConstraint({ name: 'contractId', async: false })
export class ContractIdValidator implements ValidatorConstraintInterface {
  validate(text: string) {
    console.log('validating', text);
    return isAddressValid(text, Encoding.ContractAddress);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not a valid contract id`;
  }
}
