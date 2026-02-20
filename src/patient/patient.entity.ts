import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../auth/user.entity';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  phone: string;

  // 🔐 Link with User (AUTH)
  @OneToOne(() => User, (user) => user.patient)
  @JoinColumn()
  user: User;
}
