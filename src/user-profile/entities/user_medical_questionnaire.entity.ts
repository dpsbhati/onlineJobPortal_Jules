import { Entity, PrimaryColumn, Generated, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'user_medical_questionnaire' })
export class UserMedicalQuestion {

  @PrimaryColumn({ type: 'uuid' })
  @Generated('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  disease_unfit_service:string;

  @Column()
  accident_disability:string;

  @Column()
  psychiatric_treatment:string;

  @Column()
  alcohol_drug_addiction:string; 

  @Column()
  blacklisted_illegal_activities:string;

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
