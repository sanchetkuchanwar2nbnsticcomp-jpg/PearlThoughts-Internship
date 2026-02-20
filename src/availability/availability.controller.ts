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
  Query,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './availability.dto';
import { Day } from './availability.entity';

@Controller('availability')
export class AvailabilityController {

  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  // ✅ Doctor Adds Availability
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async addAvailability(
    @Req() req: any,
    @Body() body: CreateAvailabilityDto,
  ) {
    return this.availabilityService.addAvailability(
      req.user.id,
      body,
    );
  }

  // ✅ Doctor gets ALL availability (Weekly + Custom)
  @UseGuards(AuthGuard('jwt'))
  @Get('all')
  async getMyAllAvailability(
    @Req() req: any,
  ) {
    return this.availabilityService.getAllAvailabilityCombined(
      req.user.id,   // userId internally converts to doctorId
    );
  }

  // ✅ Doctor gets Weekly Slots
  @UseGuards(AuthGuard('jwt'))
  @Get('slots/day/:day')
  async getMySlotsByDay(
    @Req() req: any,
    @Param('day') day: string,
  ) {

    if (!Object.values(Day).includes(day as Day)) {
      throw new BadRequestException(
        `Invalid day. Valid values: ${Object.values(Day).join(', ')}`,
      );
    }

    return this.availabilityService.getDoctorSlotsByUserId(
      req.user.id,
      day,
    );
  }

  // ✅ Doctor gets Custom Slots by Date
  @UseGuards(AuthGuard('jwt'))
  @Get('slots/date')
  async getMySlotsByDate(
    @Req() req: any,
    @Query('date') date: string,
  ) {
    if (!date) {
      throw new BadRequestException('Date is required');
    }

    return this.availabilityService.getDoctorSlotsByDateForUser(
      req.user.id,
      date,
    );
  }

  // 🔓 PUBLIC → Patient gets Doctor Weekly Slots
  @Get('doctor/:doctorId/day/:day')
  async getDoctorSlotsByDay(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Param('day') day: string,
  ) {

    if (!Object.values(Day).includes(day as Day)) {
      throw new BadRequestException(
        `Invalid day. Valid values: ${Object.values(Day).join(', ')}`,
      );
    }

    return this.availabilityService.getDoctorSlotsByDoctorId(
      doctorId,
      day,
    );
  }

  // 🔓 PUBLIC → Patient gets Doctor Custom Slots
  @Get('doctor/:doctorId/date')
  async getDoctorSlotsByDate(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Query('date') date: string,
  ) {

    if (!date) {
      throw new BadRequestException('Date is required');
    }

    return this.availabilityService.getDoctorSlotsByDate(
      doctorId,
      date,
    );
  }

  // ✅ Delete availability
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
  ) {
    return this.availabilityService.deleteAvailability(
      id,
      req.user.id,
    );
  }
}
