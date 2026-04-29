import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateHistoriaClinicaDto {
  @IsDateString()
  fecha!: string;

  @IsInt()
  pacienteId!: number;

  @IsInt()
  sucursalId!: number;

  @IsString()
  @MaxLength(500)
  motivo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  sintomas?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  diagnostico?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  tratamiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notas?: string;

  @IsOptional()
  @IsNumberString()
  costo?: string;

  @IsOptional()
  @IsBoolean()
  pagado?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  formaPago?: string;
}
