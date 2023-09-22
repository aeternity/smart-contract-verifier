import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1695376484295 implements MigrationInterface {
    name = 'InitialSchema1695376484295'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "contract_submission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "contract_id" character varying(63) NOT NULL, CONSTRAINT "PK_c94e6e55be1d22c9409d9f69c80" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "contract_submission"`);
    }
}
