import { applications } from 'src/application/entities/application.entity';
import { CoursesAndCertification } from 'src/courses_and_certification/entities/courses_and_certification.entity';
import { Users } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';

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

  @ManyToOne(() => Users, (user) => user.jobPosting,)
  @JoinColumn({ name: 'created_by'})
  user: Users;

  @Column({
    type: 'enum',
    enum: ['draft', 'posted'], 
    nullable: true, 
  })
  jobpost_status: string;

  @Column({
    type:'enum',
    enum:["facebook","linkedin"],
    nullable:true,
  })
  social_media_type:string[]

  @Column()
  posted_at: String;
  // For full datetime (date + time)
// @Column({ type: 'timestamp', nullable: true })
// posted_at: Date;

// For date only (without time)
@Column({ type: 'date', nullable: true })
posted_date: Date;


  @Column({
    type:'enum',
    enum:["hold","open","close"],
    nullable:true,
  })
  job_opening:string
  

  @Column({ type: 'text', nullable: true })
  application_instruction: string;

  @Column({type:"longtext",nullable:true})
  employee_experience:string

  @OneToMany(() => CoursesAndCertification, (job) => job.job)
  courses_and_certification: CoursesAndCertification[];

  @Column({
  type:'enum',
  enum:['postnow','schedulelater'],
  nullable:true})
  job_type_post:string

  @OneToMany(() => applications, (application) => application.job) // Relation with applications
  applications: applications[]; 

}
