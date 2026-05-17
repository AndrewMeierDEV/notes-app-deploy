import { NotesService } from './notes.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateNoteDto } from './dto/create-note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll() {
    return this.notesService.findAll();
  }

  @Post()
  create(@Body() body: CreateNoteDto) {
    return this.notesService.create(body);
  }
}
