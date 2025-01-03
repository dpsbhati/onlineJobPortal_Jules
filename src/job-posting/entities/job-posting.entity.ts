import { Users } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

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

  @Column({ type: 'varchar', length: 255, nullable: true })
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

  @Column({ type: 'int', nullable: true })
  start_salary: number;

  @Column({ type: 'int', nullable: true })
  end_salary: number;

  @Column({ type: 'int', nullable: true })
  salary: number;

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

  @ManyToOne(() => Users, (user) => user.id, { nullable: true })
  @JoinColumn({ name: 'created_by', referencedColumnName: 'id' })
  user: Users;
}
