export const toEnum = <TEnum extends Record<string, string>, TDefault>(
  value: string,
  enumObj: TEnum,
  defaultValue?: TDefault,
): TEnum[keyof TEnum] | TDefault | undefined => {
  const enumValues = Object.values(enumObj);
  if (enumValues.includes(value as TEnum[keyof TEnum])) {
    return value as TEnum[keyof TEnum];
  } else {
    return defaultValue;
  }
};
