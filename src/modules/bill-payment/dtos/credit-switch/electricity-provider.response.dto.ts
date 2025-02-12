import {HttpException, HttpStatus} from "@nestjs/common";

export const CreditSwitchElectricityProvidersResponseDto = [
    // {
    //     "serviceCategoryId": "BEDC",
    //     "name": "BEDC",
    //     "identifier": "BENIN",
    //     "isFixedAmount": false,
    //     "description": "Benin Electricity Distribution Company",
    //     "logoUrl": "logo url"
    // },
    {
        "serviceCategoryId": "EKEDC",
        "name": "EKEDC",
        "identifier": "EKO",
        "isFixedAmount": false,
        "description": "Eko Electricity Distribution Company",
        "logoUrl": "logo url"
    },
    {
        "serviceCategoryId": "AEDC",
        "name": "AEDC",
        "identifier": "ABUJA",
        "isFixedAmount": false,
        "description": "Abuja Electricity Distribution Company",
        "logoUrl": "logo url"
    },
    {
        "serviceCategoryId": "EEDC",
        "name": "EEDC",
        "identifier": "ENUGU",
        "isFixedAmount": false,
        "description": "Enugu Electricity Distribution Company",
        "logoUrl": "logo url"
    },
    {
        "serviceCategoryId": "IBEDC",
        "name": "IBEDC",
        "identifier": "IBADAN",
        "isFixedAmount": false,
        "description": "Ibadan Electricity Distribution Company",
        "logoUrl": "logo url"
    },
    {
        "serviceCategoryId": "IKEDC",
        "name": "IKEDC",
        "identifier": "IKEJA",
        "isFixedAmount": false,
        "description": "Ikeja Electricity Distribution Company",
        "logoUrl": "logo url"
    },
    {
        "serviceCategoryId": "JEDC",
        "name": "JEDC",
        "identifier": "JOS",
        "isFixedAmount": false,
        "description": "JOS Electricity Distribution Company",
        "logoUrl": "logo url"
    },
    {
        "serviceCategoryId": "KAEDC",
        "name": "KAEDC",
        "identifier": "KADUNA",
        "isFixedAmount": false,
        "description": "Kaduna Electricity Distribution Company",
        "logoUrl": "logo url"
    },
    {
        "serviceCategoryId": "KEDCO",
        "name": "KEDCO",
        "identifier": "KANO",
        "isFixedAmount": false,
        "description": "Kano Electricity Distribution Company",
        "logoUrl": "logo url"
    },
    {
        "serviceCategoryId": "PHEDC",
        "name": "PHEDC",
        "identifier": "PORTHARCOURT",
        "isFixedAmount": false,
        "description": "PortHarcourt Electricity Distribution Company",
        "logoUrl": "logo url"
    },
    // {
    //     "serviceCategoryId": "YEDC",
    //     "name": "YEDC",
    //     "identifier": "YOLA",
    //     "isFixedAmount": false,
    //     "description": "Yola Electricity distribution company",
    //     "logoUrl": "logo url"
    // }
]

export function CreditSwitchElectricityServiceId(name: string, type) {
    const electricityObj = {
        "IKEJA-PREPAID": "E01E",
        "IKEJA-POSTPAID": "E02E",
        "IBEDC-PREPAID": "E03E", // Ibadan Electricity Distribution Company
        "IBEDC-POSTPAID": "E04E",
        "EKEDC-PREPAID": "E05E", // Eko Electricity Distribution Company
        "EKEDC-POSTPAID": "E06E",
        "AEDC-PREPAID": "E07E", // Abuja Electricity Distribution Company
        "AEDC-POSTPAID": "E08E",
        "PHEDC-PREPAID": "E09E", // Port Harcourt Electricity Distribution Company
        "PHEDC-POSTPAID": "E10E",
        "KAEDC-PREPAID": "E11E", // Kaduna Electricity Distribution Company
        "KAEDC-POSTPAID": "E12E",
        "JEDC-PREPAID": "E13E", // Jos Electricity Distribution Company
        "JEDC-POSTPAID": "E14E",
        "EEDC-PREPAID": "E15E", // Enugu Electricity Distribution Company
        "EEDC-POSTPAID": "E16E",
        "KEDCO-PREPAID": "E17E", // Kano Electricity Distribution Company
        "KEDCO-POSTPAID": "E18E"
    };

    const serviceId = electricityObj[`${name}-${type}`];
    if (!serviceId) {
        throw new HttpException(`Bill Provider CS Error: Service ID not found for ${name} ${type}`, HttpStatus.BAD_REQUEST);
    }

    return electricityObj[`${name}-${type}`];
}