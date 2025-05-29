import { JobPosting } from 'src/job-posting/entities/job-posting.entity';
import { UserProfile } from 'src/user-profile/entities/user-profile.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('ranks')
export class Rank {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  rank_name: string;

  @Column({ type: 'int' })
  orderId: number;

  @Column({ type: 'datetime', nullable: true })
  created_at: Date;

  @Column({ type: 'datetime', nullable: true })
  updated_at: Date;

  @Column({ type: 'char', length: 50, nullable: true })
  created_by: string;

  @Column({ type: 'char', length: 50, nullable: true })
  updated_by: string;

  @Column({ type: 'tinyint', default: 0 })
  is_deleted: boolean;

  @OneToMany(() => UserProfile, (userProfile) => userProfile.rank) // Relation with applications
  userProfile: UserProfile[];

  @OneToMany(() => JobPosting, (jobPosting) => jobPosting.ranks) // Relation with applications
  jobPosting: JobPosting[];
}
