import { JobPosting } from 'src/job-posting/entities/job-posting.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('courses_and_certification')
export class CoursesAndCertification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'char', length: 36 })
  job_id: string;


  @Column({ type: 'datetime', nullable: true })
  start_date: Date;

  @Column({ type: 'datetime', nullable: true })
  end_date: Date;

  @Column({ type: 'text', nullable: true })
  organization_name: string;

  @Column({ type: 'longtext', nullable: true })
  certification_description: string;


  @Column({ default: false })
  is_deleted: boolean;

  @Column({ type: 'char', length: 36, nullable: true })
  created_by: string;

  @Column({ type: 'char', length: 36, nullable: true })
  updated_by: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'char', nullable: true })
  certification_file: string;

  @ManyToOne(() => JobPosting, (jobPosting) => jobPosting.courses_and_certification)
  @JoinColumn({ name: 'job_id' })
  job: JobPosting;

}
