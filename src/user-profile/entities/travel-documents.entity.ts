import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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
