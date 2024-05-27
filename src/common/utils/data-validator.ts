import { HttpStatus } from '@nestjs/common';
import { BusinessException } from 'src/exception';

// 데이터 유효성 검사 및 키 매핑 함수
export const validateData = (data: any[], fields: any[]): any[] => {
  const keyCache: any = {};

  const validData = data
    .map((item) => {
      const newItem: any = {};

      // fields를 사용하여 keyCache 구축 및 필드 검증
      fields.forEach((field) => {
        if (!keyCache[field.key]) {
          keyCache[field.key] = Object.keys(item).find((key) =>
            field.terms.some((term) => key.includes(term)),
          );
        }

        // 새로운 키 할당
        if (keyCache[field.key]) {
          newItem[field.key] = item[keyCache[field.key]];
        }
      });

      const filledFields = fields.filter((field) => newItem[field.key]).length;
      const missingFields = fields.filter(
        (field) => !newItem[field.key],
      ).length;

      if (filledFields > 0 && missingFields > 0) {
        throw new BusinessException(
          'admin',
          `${JSON.stringify(item)}필드에 빈 값이 존재합니다.`,
          `${JSON.stringify(item)}필드에 빈 값이 존재합니다. 채워서 다시 입력해주세요`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // 모든 필수 필드가 존재하는지 확인
      const hasAllRequiredFields = fields.every((field) => newItem[field.key]);

      if (!hasAllRequiredFields) {
        console.error(
          `Missing required fields in item: ${JSON.stringify(item)}`,
        );
        return null; // 해당 엔트리 건너뛰기
      }

      // 필수 필드가 모두 있으면 newItem 반환
      return newItem;
    })
    .filter((item) => item !== null); // null 아닌 항목만 필터링

  return validData;
};

export const validateCoaches = (data: any[], fields: any[]): any[] => {
  const keyCache: any = {};

  const validData = data
    .map((item) => {
      const newItem: any = {};

      // fields를 사용하여 keyCache 구축 및 필드 검증
      fields.forEach((field) => {
        if (!keyCache[field.key]) {
          keyCache[field.key] = Object.keys(item).find((key) =>
            field.terms.some((term) => key.includes(term)),
          );
        }

        // 새로운 키 할당
        if (keyCache[field.key]) {
          newItem[field.key] = item[keyCache[field.key]];
        }
      });
      const coaches = Object.keys(item)
        .filter((key) => key.toLowerCase().includes('코치'))
        .map((key) => item[key])
        .filter(Boolean);
      if (coaches.length > 0) {
        newItem.coaches = coaches;
      } else {
        newItem.coaches = []; // 코치 정보가 없다면 빈 배열 할당
      }
      return newItem;
    })
    .filter((item) => item !== null); // null 아닌 항목만 필터링

  return validData;

  return data.map((item) => {
    const coaches = Object.keys(item)
      .filter((key) => key.toLowerCase().includes('코치'))
      .map((key) => item[key])
      .filter(Boolean);
    if (coaches.length > 0) {
      item.coaches = coaches;
    } else {
      item.coaches = []; // 코치 정보가 없다면 빈 배열 할당
    }
    return item;
  });
};
