// đây là class DTO trả kết quả về cho client
export class ResponseData<D> {
    data: D | D[]; // trả về 1 đối tượng hoặc là 1 mãng các đối tượng
    statusCode: number;
    message: string;

    constructor (data: D | D[], statusCode: number, message: string){
        this.data = data;
        this.statusCode = statusCode;
        this.message = message;
    }
}