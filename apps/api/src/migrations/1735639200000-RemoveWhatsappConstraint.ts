import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveWhatsappConstraint1735639200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remove the whatsapp_format constraint
    await queryRunner.query(
      `ALTER TABLE profiles DROP CONSTRAINT IF EXISTS whatsapp_format`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-add the constraint if needed
    await queryRunner.query(
      `ALTER TABLE profiles ADD CONSTRAINT whatsapp_format CHECK (whatsapp_number IS NULL OR whatsapp_number ~ '^\\+33[0-9]{9}$')`
    );
  }
}
