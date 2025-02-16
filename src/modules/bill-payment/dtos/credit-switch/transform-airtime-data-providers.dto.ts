import { LOGO_MAP } from '../../../../shared/constants/logo';

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

      return {
        serviceCategoryId,
        name,
        logo: LOGO_MAP[identifier],
        identifier,
      };
    });
  }
}
