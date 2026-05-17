import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.note.findMany({
      where: {
        archived: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: CreateNoteDto) {
    return this.prisma.note.create({
      data,
    });
  }
}
