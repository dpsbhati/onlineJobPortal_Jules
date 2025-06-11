import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('travel_documents')
export class TravelDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  document_name?: string;

  @Column()
  user_id?: string;

  @Column()
  document_number?: string;

  @Column()
  issue_place?: string;

  @Column({ type: 'date', nullable: true })
  issue_date?: Date;

  @Column({ type: 'date', nullable: true })
  exp_date?: Date;
}
