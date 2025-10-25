import { IsDefined, IsMongoId } from "class-validator";

export class GetTokenRequest {
    @IsMongoId({ message: 'Id phải là một object hợp lệ'})
    @IsDefined({ message: 'Id không thể để trống'})
    userId: string;
}