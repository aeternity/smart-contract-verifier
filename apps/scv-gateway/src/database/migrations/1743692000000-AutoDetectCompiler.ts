import { MigrationInterface, QueryRunner } from 'typeorm';

export class AutoDetectCompiler1743692000000 implements MigrationInterface {
  name = 'AutoDetectCompiler1743692000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ALTER COLUMN "compiler" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ALTER COLUMN "compiler" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "contracts" SET "compiler" = '' WHERE "compiler" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contracts" ALTER COLUMN "compiler" SET NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "contract_submissions" SET "compiler" = '' WHERE "compiler" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "contract_submissions" ALTER COLUMN "compiler" SET NOT NULL`,
    );
  }
}
