import { applications } from 'src/application/entities/application.entity';
import { CoursesAndCertification } from 'src/courses_and_certification/entities/courses_and_certification.entity';
import { Rank } from 'src/ranks/entities/rank.entity';
import { Users } from 'src/user/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

export enum JobTypePost {
  POST_NOW = 'Postnow',
  SCHEDULE_LATER = 'Schedulelater',
}

export enum JobPostStatus {
  DRAFT = 'Draft',
  POSTED = 'Posted',
}

export enum JobOpeningStatus {
  HOLD = 'Hold',
  OPEN = 'Active',
  CLOSE = 'Close',
  ARCHIVED = 'Archived',
}
@Entity('job_postings')
export class JobPosting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  job_type: string;

  @Column({ type: 'text', nullable: true })
  qualifications: string;

  @Column({ type: 'text', nullable: true })
  skills_required: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column()
  featured_image: string;

  @Column({ type: 'datetime', nullable: true })
  date_published: Date;

  @Column({ type: 'datetime', nullable: true })
  deadline: Date;

  @Column({ type: 'text', nullable: true })
  short_description: string;

  @Column({ type: 'longtext', nullable: true })
  full_description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  assignment_duration: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  employer: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  rank: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  required_experience: string;

  @Column({ type: 'varchar', nullable: true })
  start_salary: string;

  @Column({ type: 'int', nullable: true })
  end_salary: number;

  @Column({ type: 'int' })
  number_of_vacancy: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  vessel_type: string;

  @Column({ type: 'int', nullable: true })
  salary: number;

  @Column({ type: 'int', nullable: true })
  applicant_number: number;

  @Column({ type: 'int', nullable: true })
  country_code: string;

  @Column({ type: 'int', nullable: true })
  state_code: number;

  @Column({ type: 'int', nullable: true })
  city: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ default: false })
  is_deleted: boolean;

  @Column({ type: 'char', length: 36, nullable: true })
  created_by: string;

  @Column({ type: 'char', length: 36, nullable: true })
  updated_by: string;

  @Column({ type: 'text', nullable: true })
  work_type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'varchar', length: 250, nullable: true })
  file: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: JobPostStatus,
    nullable: true,
  })
  jobpost_status: JobPostStatus;

  @Column({
    type: 'enum',
    enum: ['facebook', 'linkedin'],
    nullable: true,
  })
  social_media_type: string[];

  @Column()
  posted_at: String;

  @Column()
  posted_date: string;

  @Column({
    type: 'enum',
    enum: JobOpeningStatus,
    nullable: true,
  })
  job_opening: JobOpeningStatus;

  @Column({ type: 'text', nullable: true })
  application_instruction: string;

  @Column({ type: 'longtext', nullable: true })
  employee_experience: string;

  @OneToMany(() => CoursesAndCertification, (job) => job.job)
  courses_and_certification: CoursesAndCertification[];

  @Column({
    type: 'enum',
    enum: JobTypePost,
    nullable: true,
  })
  job_type_post: JobTypePost;

  @OneToMany(() => applications, (application) => application.job) // Relation with applications
  applications: applications[];

  @ManyToOne(() => Users, (user) => user.jobPosting)
  @JoinColumn({ name: 'created_by' })
  user: Users;

  @ManyToOne(() => Rank, (ranks) => ranks.jobPosting)
  @JoinColumn({ name: 'rank' })
  ranks: Rank;
}
export class Job {
  @Column()
  job_id: string;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;
}
