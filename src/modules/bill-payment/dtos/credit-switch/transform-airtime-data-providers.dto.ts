export class CreditSwitchAirtimeTransferResponseDto {
  serviceCategoryId: string;
  name: string;
  logo: string;
  identifier: string;

  static fromObject(
    data: Record<string, string>,
  ): CreditSwitchAirtimeTransferResponseDto[] {
    return Object.entries(data).map(([name, serviceCategoryId]) => {
      const formattedIdentifier = name.toUpperCase().replace(/\s+/g, '_');
      const identifier =
        formattedIdentifier === 'GLOBACOM'
          ? 'GLO'
          : formattedIdentifier === '9_MOBILE'
            ? 'NINE_MOBILE'
            : formattedIdentifier;

      const logoObj = {
        MTN: 'https://res.cloudinary.com/dcm6r6nv7/image/upload/v1739372524/mtn_eudpji.png',
        GLO: 'https://res.cloudinary.com/dcm6r6nv7/image/upload/v1739372524/glo_ta8ya8.png',
        NINE_MOBILE:
          'https://res.cloudinary.com/dcm6r6nv7/image/upload/v1739372524/9-mobile_qjyndd.png',
        AIRTEL:
          'https://res.cloudinary.com/dcm6r6nv7/image/upload/v1739372524/airtel_pzriyg.png',
      };

      return {
        serviceCategoryId,
        name,
        logo: logoObj[identifier],
        identifier,
      };
    });
  }
}
