import { CategorizedTransaction } from "./entities";

export const serverUrl = 'http://localhost:8000';
// export const serverUrl = 'https://tsmealwheel.herokuapp.com';

export const apiUrlFragment = '/api/v1/';

export type StringToTransactionsLUT = {
  [key: string]: CategorizedTransaction[];
}
