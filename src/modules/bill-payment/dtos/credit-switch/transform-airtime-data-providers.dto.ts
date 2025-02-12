export class CreditSwitchAirtimeTransferResponseDto {
    serviceCategoryId: string;
    name: string;
    logo: string;
    identifier: string;

    static fromObject(data: Record<string, string>): CreditSwitchAirtimeTransferResponseDto[] {
        return Object.entries(data).map(([name, serviceCategoryId]) => ({
            serviceCategoryId,
            name,
            logo: `https://example.com/logos/${name.toLowerCase().replace(/\s+/g, '-')}.png`,
            identifier: name.toUpperCase().replace(/\s+/g, '_')
        }));
    }
}
