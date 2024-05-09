export const generateVerificationCode = (): string => {
  const min = 100000; // 6자리 숫자의 최소값
  const max = 999999; // 6자리 숫자의 최대값
  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
};
