export type VerificationTaskDto = {
  submissionId: string;
  contractId: string;
  compiler: string;
  entryFile: string;
  bytecode: string;
  encodedInitCallParameters: string;
  sourceFiles: Array<{
    filePath: string;
    content: string;
  }>;
};
