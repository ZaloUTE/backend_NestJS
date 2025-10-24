import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, maxlength: 100 })
  name: string;

  @Prop({
    type: Date,
    validate: {
      validator: (value: Date) => {
        if (!value) return true; // cho phép bỏ trống
        const today = new Date();
        let age = today.getFullYear() - value.getFullYear();
        const m = today.getMonth() - value.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < value.getDate())) {
          age--;
        }
        return age >= 18 && age <= 100;
      },
      message: (props: any) =>
        props.value
          ? `Tuổi phải từ 18 đến 100! (${props.value.toDateString()})`
          : 'Ngày sinh không hợp lệ!',
    },
  })
  dateOfBirth: Date;


  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, unique: true })
  mssv: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: ['nam', 'nữ', 'khác'] })
  gender?: string;

  @Prop()
  address?: string;

  @Prop({ maxlength: 500 })
  bio?: string;

  @Prop()
  avatar?: string;

  @Prop({ enum: ['user', 'admin'], default: 'user' })
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
