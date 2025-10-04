// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ApiResponse<T = any> = {
  status: "success" | "error";
  message: string;
  data?: T;
};
