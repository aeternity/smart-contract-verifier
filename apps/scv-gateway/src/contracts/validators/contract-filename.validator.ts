import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import * as path from 'path';

const SAMPLE_ROOT = '/usr/foo/bar';

@ValidatorConstraint({ name: 'entryFile', async: false })
export class ContractFilenameValidator implements ValidatorConstraintInterface {
  validate(text: string) {
    if (text.indexOf('\0') !== -1) {
      return false;
    }

    if (!/^(?!\.)(?!.*\.$)(?!.*\.\.)[a-zA-Z0-9_\-\/.]+$/.test(text)) {
      return false;
    }

    const path_string = path.join(SAMPLE_ROOT, text);

    if (path_string.indexOf(SAMPLE_ROOT) !== 0) {
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} is not a valid relative contract file path. Only alphanumeric characters, underscores, dashes, dots and slashes are allowed.`;
  }
}
