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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './availability.dto';

@Controller('availability')
@UseGuards(AuthGuard('jwt')) // Protect all routes
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  // POST /availability
  @Post()
  addAvailability(
    @Req() req,
    @Body() body: CreateAvailabilityDto,
  ) {
    const doctorId = req.user.id; // Comes from JWT
    return this.availabilityService.addAvailability(doctorId, body);
  }

  // GET /availability/me
  @Get('me')
  getMyAvailability(@Req() req) {
    const doctorId = req.user.id;
    return this.availabilityService.getDoctorAvailability(doctorId);
  }

  // DELETE /availability/5
  @Delete(':id')
  deleteAvailability(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
  ) {
    const doctorId = req.user.id;
    return this.availabilityService.deleteAvailability(id, doctorId);
  }
}
