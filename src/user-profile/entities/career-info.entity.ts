import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Generated } from 'typeorm';

@Entity({name: 'career_info'})
export class CareerInfo {
  @PrimaryColumn({type: 'uuid'})
  @Generated('uuid')
  id: string;

  @Column()
  user_id?: string;

  @Column()
  work_experience_from?: Date;

  @Column()
  work_experience_to?: Date;

  @Column()
  work_experience_title?: string;

  @Column()
  work_experience_employer?: string;

  @Column()
  highest_education_level?: string;

  @Column()
  education_from?: Date;

  @Column()
  education_to?: Date;

  @Column()
  education_title?: string;

  @Column()
  education_institute?: string;

  @Column()
  course_from?: Date;

  @Column()
  course_to?: Date;

  @Column()
  course_title?: string;

  @Column()
  course_provider?: string;

  @Column()
  certification_from?: Date;

  @Column()
  certification_to?: Date;

  @Column()
  certification_title?: string;

  @Column()
  certification_issuer?: string;

  @Column()
  cv_path?: string;

  @Column()
  is_deleted?: boolean;

  @Column()
  created_on?: Date;

  @Column()
  updated_on?: Date;

  @Column()
  createdBy?: string;

  @Column()
  updatedBy?: string;

  @Column()
  deletedBy?: string;
}
