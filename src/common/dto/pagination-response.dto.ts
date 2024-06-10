export class Pagination {
  next?: string;
  count: number;
  total?: number;

  constructor(next: string, count: number, total: number) {
    this.next = next;
    this.count = count;
    this.total = total;
  }
}

export class PaginationResponseDto<T> {
  data: T;
  message: string;
  statusCode: number;
  pagination: Pagination;

  constructor(code: number, message: string, pagination: Pagination, data?: T) {
    this.message = message;
    this.statusCode = code;
    this.data = data;
    this.pagination = pagination;
  }
}
