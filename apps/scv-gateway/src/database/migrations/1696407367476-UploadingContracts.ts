import { MigrationInterface, QueryRunner } from 'typeorm';

export class UploadingContracts1696407367476 implements MigrationInterface {
  name = 'UploadingContracts1696407367476';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "contract_submissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contract_id" character varying(63) NOT NULL, "license" character varying(127) NOT NULL, "compiler" character varying(63) NOT NULL, "entry_file" character varying NOT NULL, CONSTRAINT "PK_b5db2fef965ba53ade9c9a6933f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "contract_submission_source_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_path" character varying NOT NULL, "content" character varying NOT NULL, "submission_id" uuid, CONSTRAINT "PK_5600d799577864aed9c43dcfd45" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "contracts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contract_id" character varying(63) NOT NULL, "license" character varying(127) NOT NULL, "compiler" character varying(63) NOT NULL, "entry_file" character varying NOT NULL, CONSTRAINT "PK_2c7b8f3a7b1acdd49497d83d0fb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "contract_source_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contract_id" character varying(63) NOT NULL, "file_name" character varying(127) NOT NULL, "content" character varying NOT NULL, CONSTRAINT "PK_0d6efaaf4d2908d5c38895acfc4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submission_source_files" ADD CONSTRAINT "FK_73efed57f0f46c53b85c22aa451" FOREIGN KEY ("submission_id") REFERENCES "contract_submissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_submission_source_files" DROP CONSTRAINT "FK_73efed57f0f46c53b85c22aa451"`,
    );
    await queryRunner.query(`DROP TABLE "contract_source_files"`);
    await queryRunner.query(`DROP TABLE "contracts"`);
    await queryRunner.query(`DROP TABLE "contract_submission_source_files"`);
    await queryRunner.query(`DROP TABLE "contract_submissions"`);
  }
}
