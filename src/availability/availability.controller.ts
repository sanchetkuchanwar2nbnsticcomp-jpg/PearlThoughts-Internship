import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './availability.dto';
import { Day } from './availability.entity';

@Controller('availability')
@UseGuards(AuthGuard('jwt'))
export class AvailabilityController {

  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  // ✅ Add availability
  @Post()
  async addAvailability(
    @Req() req: any,
    @Body() body: CreateAvailabilityDto,
  ) {

    const userId = req.user.id;

    return await this.availabilityService.addAvailability(
      userId,
      body,
    );
  }


  // ✅ Get logged-in doctor's availability
  @Get('me')
  async getMyAvailability(
    @Req() req: any,
  ) {

    const userId = req.user.id;

    return await this.availabilityService.getDoctorAvailability(
      userId,
    );
  }


  // ✅ Get generated slots for logged-in doctor
  @Get('slots/:day')
  async getMySlots(
    @Req() req: any,
    @Param('day') day: string,
  ) {

    const userId = req.user.id;

    // Validate day
    if (!Object.values(Day).includes(day as Day)) {

      throw new BadRequestException(
        `Invalid day. Valid values: ${Object.values(Day).join(', ')}`,
      );
    }

    return await this.availabilityService.getDoctorSlots(
      userId,
      day,
    );
  }


  // ✅ NEW: Get slots by doctorId (for patients booking)
  @Get('doctor/:doctorId/slots/:day')
  async getDoctorSlots(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('day') day: string,
  ) {

    if (!Object.values(Day).includes(day as Day)) {

      throw new BadRequestException(
        `Invalid day. Valid values: ${Object.values(Day).join(', ')}`,
      );
    }

    return await this.availabilityService.getDoctorSlots(
      doctorId,
      day,
    );
  }


  // ✅ Delete availability
  @Delete(':id')
  async deleteAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {

    const userId = req.user.id;

    return await this.availabilityService.deleteAvailability(
      id,
      userId,
    );
  }

}
