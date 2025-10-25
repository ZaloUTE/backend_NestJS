import { IsInt, Min, IsMongoId, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class GetPostsQueryDto {
    @Type(() => Number)
    @IsDefined({ message: 'page không được bỏ trống' })
    @IsInt({ message: 'page phải là số nguyên' })
    @Min(1, { message: 'page phải lớn hơn hoặc bằng 1' })
    page: number;

    @Type(() => Number)
    @IsDefined({ message: 'limit không được bỏ trống' })
    @IsInt({ message: 'limit phải là số nguyên' })
    @Min(1, { message: 'limit phải lớn hơn hoặc bằng 1' })
    limit: number;

    @IsMongoId({ message: 'userId phải là ObjectId hợp lệ' })
    @IsDefined({ message: 'userId không được bỏ trống' })
    userId: string;
}


// khi dùng @Query , @Param, @Body thì nestJS tự động chuyển đổi thành class DTO này luôn không cần contructor