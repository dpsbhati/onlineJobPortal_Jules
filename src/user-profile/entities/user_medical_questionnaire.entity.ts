import { Entity, PrimaryColumn, Generated, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'user_medical_questionnaire' })
export class UserMedicalQuestion {

  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  disease_unfit_service:boolean;

  @Column()
  accident_disability:boolean;

  @Column()
  psychiatric_treatment:boolean;

  @Column()
  alcohol_drug_addiction:boolean; 

  @Column()
  blacklisted_illegal_activities:boolean;

  @Column()
  reason: string;

   @CreateDateColumn()
    created_at: Date;
  
    @UpdateDateColumn()
    updated_at: Date;
  
    @Column({ type: 'boolean', default: false })
    is_deleted: boolean;
  
    @Column()
    created_by: string;
  
    @Column({})
    updated_by: string;
}
