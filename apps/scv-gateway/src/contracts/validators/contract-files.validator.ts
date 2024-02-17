import { ContractSubmissionDto } from '../dto/contract-submission.dto';
import { ContractFilenameValidator } from './contract-filename.validator';

const CONTRACT_FILES_COUNT_LIMIT = 100;
const CONTRACT_SIZE_LIMIT = 200000; //200kb

export class ContractFilesValidator {
  static validate(
    contractSubmissionDto: ContractSubmissionDto,
    sourceFiles: Array<Express.Multer.File>,
  ) {
    if (
      !sourceFiles.find(
        (file) => file.originalname === contractSubmissionDto.entryFile,
      )
    ) {
      throw new Error(
        'Entry file does not match any of the uploaded source files',
      );
    }

    if (sourceFiles.length > CONTRACT_FILES_COUNT_LIMIT) {
      throw new Error(
        `Number of source files exceeds the limit of ${CONTRACT_FILES_COUNT_LIMIT} files`,
      );
    }

    let totalSize = 0;
    const sourcefileValidator = new ContractFilenameValidator();
    for (const file of sourceFiles) {
      if (!file.originalname.endsWith('.aes')) {
        throw new Error(`File ${file.originalname} is not a valid *.aes file`);
      }
      if (!sourcefileValidator.validate(file.originalname)) {
        throw new Error(
          `File ${file.originalname} is not a valid relative contract file path. Only alphanumeric characters, underscores, dashes, dots and slashes are allowed.`,
        );
      }
      totalSize += file.size;
    }

    if (totalSize > CONTRACT_SIZE_LIMIT) {
      throw new Error(
        `Total size of source files exceeds the limit of ${CONTRACT_SIZE_LIMIT} bytes`,
      );
    }

    return true;
  }
}
