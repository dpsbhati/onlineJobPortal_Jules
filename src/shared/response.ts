// import { HttpException } from '@nestjs/common';

export const WriteResponse = (
  statusCode: number,
  data: any = {},
  message: string = null,
) => {
  if (statusCode == 200) {
    return { statusCode, message: message ? message : 'Success', data };
  } else if (statusCode == 400) {
    return {
      statusCode,
      message: message ? message : "Record Not Found.",
      data,
    };
  } else if (statusCode == 500) {
    return { statusCode, message: message ?? 'Internal server error' };
  } else if (statusCode == 404) {
    return { statusCode, message: "Record Not Found." };
  } else {
    return { statusCode, message };
  }
};

export const paginateResponse = (list: any, count: number, total?: number, perPage?: number): any => {
  return {
    statusCode: list.length ? 200 : 400,
    message: list.length ? 'Success' : 'Record not found.',
    data: list,total,
    count,
  }
};
