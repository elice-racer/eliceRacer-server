import * as argon2 from 'argon2';

export const hashPassword = async (password: string) => {
  return argon2.hash(password);
};
