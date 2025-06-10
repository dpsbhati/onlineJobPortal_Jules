import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { JobPosting } from 'src/job-posting/entities/job-posting.entity';
import { Users } from 'src/user/entities/user.entity';
import { UserProfile } from 'src/user-profile/entities/user-profile.entity';

@Entity('applications') // Explicitly set the table name
export class applications {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  job_id: string;

  @Column({
    type: 'enum',
    enum: [
      'Pending',
      'Shortlisted',
      'Processed',
      'Endorsed',
      'Approved',
      'Deployed',
      'Rejected',
      'Cancelled',
    ],
    nullable: true,
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  comments: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cv_path: string;

  @Column({ type: 'text', nullable: true })
  additional_info: string;

  @Column({ type: 'text', nullable: true })
  work_experiences: string;

  @CreateDateColumn()
  applied_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @Column()
  created_by: string;

  @Column()
  updated_by: string;

  @Column()
  source_of_job: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  certification_path: string;

  @ManyToOne(() => Users, (user) => user.applications) // Define relation with User
  @JoinColumn({ name: 'user_id' }) // Map the relation to the existing user_id column
  user: Users;

  @ManyToOne(() => JobPosting, (job) => job.applications) // Define relation with JobPosting
  @JoinColumn({ name: 'job_id' }) // Map the relation to the existing job_id column
  job: JobPosting;
}
