export const convertDate = (serial: number): Date => {
  const date = excelDateToJSDate(serial);
  return utcToKoreanTDate(date);
};

export const excelDateToJSDate = (serial: number): Date => {
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  const date = new Date(utc_value * 1000);
  return date;
};

export const utcToKoreanTDate = (date: Date): Date => {
  const koreaTimeOffset = date.getTime() + 9 * 60 * 60 * 1000; // 9시간을 밀리초로 변환하여 추가
  const koreaDate = new Date(koreaTimeOffset);

  return koreaDate;
};
