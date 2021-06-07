import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinColumn } from "typeorm";
import { Event } from "./Event"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    userId: string

    @Column()
    userName: string;

    @ManyToOne( type => Event, event => event.users )
    event: Event

    constructor( userName: string, event?: Event ) {
        this.userName = userName
        this.event = event
    }
}
