import { MigrationInterface, QueryRunner } from 'typeorm';

export class SubmissionVerification1696408787963 implements MigrationInterface {
  name = 'SubmissionVerification1696408787963';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ADD "submitted_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contract_submissions_status_enum" AS ENUM('pending', 'success', 'fail')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ADD "status" "public"."contract_submissions_status_enum" NOT NULL DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ADD "result" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_source_files" DROP COLUMN "file_path"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_source_files" ADD "file_path" character varying NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_source_files" DROP COLUMN "file_path"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_source_files" ADD "file_path" character varying(127) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" DROP COLUMN "result"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" DROP COLUMN "status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."contract_submissions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" DROP COLUMN "submitted_at"`,
    );
  }
}
