import { IsNumber, Min } from 'class-validator';

export class ContributeEventDto {
  @IsNumber()
  @Min(0)
  amount!: number;
}
