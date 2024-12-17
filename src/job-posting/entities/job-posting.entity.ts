import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class JobPosting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  company: string;

  @Column()
  location: string;

  @Column()
  salary: number;

  @Column()
  postedDate: Date;
}
