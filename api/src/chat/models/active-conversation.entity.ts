import { UserEntity } from "src/auth/models/user.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('active_conversation')
export class ActiveConversationEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: number;

    @Column()
    socketId: string;

    @Column()
    conversationId: number;
}