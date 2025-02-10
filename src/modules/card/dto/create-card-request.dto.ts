import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  CardDeliveryOption,
  CardRequestStatus,
  CardType,
  PickupBranch,
} from 'src/shared/enums/all.enum';

export class CreateCardRequestDto {
  @ApiProperty({
    description: 'Account ID for the card request',
    example: '0939458693',
  })
  @IsString()
  accountNumber: string;

  @ApiProperty({
    description: 'Delivery option for the card',
    example: 'PICKUP',
    enum: CardDeliveryOption,
    default: CardDeliveryOption.PICKUP,
  })
  @IsEnum(CardDeliveryOption)
  deliveryOption: CardDeliveryOption = CardDeliveryOption.PICKUP;

  @ApiProperty({
    description: 'Type of card requested',
    example: 'VERVE',
    enum: CardType,
    default: CardType.VERVE,
  })
  @IsEnum(CardType)
  cardType: CardType = CardType.VERVE;

  @ApiProperty({
    description: 'Branch where the card will be picked up',
    example: 'YABA',
    enum: PickupBranch,
    default: PickupBranch.YABA,
  })
  @IsEnum(PickupBranch)
  pickupBranch: PickupBranch = PickupBranch.YABA;

  @ApiProperty({
    description: 'Delivery address if applicable',
    example: '123 Street Name, City',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'City for the card delivery address',
    example: 'Lagos',
    required: false,
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'Zip code for the card delivery address',
    example: '100001',
    required: false,
  })
  @IsOptional()
  @IsString()
  zipCode?: string;

  @ApiProperty({
    description: 'Status of the card request',
    example: 'RECEIVED',
    enum: CardRequestStatus,
    default: CardRequestStatus.RECEIVED,
  })
  @IsEnum(CardRequestStatus)
  status: CardRequestStatus = CardRequestStatus.RECEIVED;
}
