import { MigrationInterface, QueryRunner } from 'typeorm';

export class Verification1705265414349 implements MigrationInterface {
  name = 'Verification1705265414349';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_submission_source_files" DROP CONSTRAINT "FK_73efed57f0f46c53b85c22aa451"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contract_verification_history_prev_status_enum" AS ENUM('new', 'pending', 'processing', 'success', 'fail_retry', 'fail')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contract_verification_history_new_status_enum" AS ENUM('new', 'pending', 'processing', 'success', 'fail_retry', 'fail')`,
    );
    await queryRunner.query(
      `CREATE TABLE "contract_verification_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "submission_id" character varying(63) NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "prev_status" "public"."contract_verification_history_prev_status_enum" NOT NULL, "new_status" "public"."contract_verification_history_new_status_enum" NOT NULL, "result" character varying, "source" character varying, CONSTRAINT "PK_2222b5b1f98ba539aa230484bb2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD "aci" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD "bytecode" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD "encoded_init_call_parameters" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD "init_call_parameters" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD "verified_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ADD "bytecode" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ADD "encoded_init_call_parameters" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ADD "last_update" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ADD "retry_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ADD "retry_after" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "UQ_d4c091e72433a7125d9158170e7" UNIQUE ("contract_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_source_files" DROP COLUMN "contract_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_source_files" ADD "contract_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."contract_submissions_status_enum" RENAME TO "contract_submissions_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contract_submissions_status_enum" AS ENUM('new', 'pending', 'processing', 'success', 'fail_retry', 'fail')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ALTER COLUMN "status" TYPE "public"."contract_submissions_status_enum" USING "status"::"text"::"public"."contract_submissions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ALTER COLUMN "status" SET DEFAULT 'new'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."contract_submissions_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_source_files" ADD CONSTRAINT "FK_5b84de52dc435d17be549cd8189" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submission_source_files" ADD CONSTRAINT "FK_73efed57f0f46c53b85c22aa451" FOREIGN KEY ("submission_id") REFERENCES "contract_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP TABLE "contract_submission"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_submission_source_files" DROP CONSTRAINT "FK_73efed57f0f46c53b85c22aa451"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_source_files" DROP CONSTRAINT "FK_5b84de52dc435d17be549cd8189"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."contract_submissions_status_enum_old" AS ENUM('pending', 'success', 'fail')`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ALTER COLUMN "status" TYPE "public"."contract_submissions_status_enum_old" USING "status"::"text"::"public"."contract_submissions_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."contract_submissions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."contract_submissions_status_enum_old" RENAME TO "contract_submissions_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_source_files" DROP COLUMN "contract_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_source_files" ADD "contract_id" character varying(63) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "UQ_d4c091e72433a7125d9158170e7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" DROP COLUMN "retry_after"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" DROP COLUMN "retry_count"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" DROP COLUMN "last_update"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" DROP COLUMN "encoded_init_call_parameters"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" DROP COLUMN "bytecode"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP COLUMN "verified_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP COLUMN "init_call_parameters"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP COLUMN "encoded_init_call_parameters"`,
    );
    await queryRunner.query(`ALTER TABLE "contracts" DROP COLUMN "bytecode"`);
    await queryRunner.query(`ALTER TABLE "contracts" DROP COLUMN "aci"`);
    await queryRunner.query(`DROP TABLE "contract_verification_history"`);
    await queryRunner.query(
      `DROP TYPE "public"."contract_verification_history_new_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."contract_verification_history_prev_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submission_source_files" ADD CONSTRAINT "FK_73efed57f0f46c53b85c22aa451" FOREIGN KEY ("submission_id") REFERENCES "contract_submissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "contract_submission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contract_id" character varying(63) NOT NULL, CONSTRAINT "PK_c94e6e55be1d22c9409d9f69c80" PRIMARY KEY ("id"))`,
    );
  }
}
