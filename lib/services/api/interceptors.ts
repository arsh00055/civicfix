import { AxiosResponse, AxiosError } from 'axios';

export const responseInterceptor = (response: AxiosResponse) => {
  return response.data;
};

export const errorInterceptor = (error: AxiosError) => {
  if (error.response) {
    const data = error.response.data as { message?: string } | undefined;
    const message = (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string')
      ? data.message
      : 'An error occurred';
    throw new Error(message);
  } else if (error.request) {
    throw new Error('Network error. Please check your connection.');
  } else {
    throw new Error('An unexpected error occurred.');
  }
};