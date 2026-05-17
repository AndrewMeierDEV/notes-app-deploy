import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

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

  async remove(id: number) {
    return this.prisma.note.delete({
      where: {
        id,
      },
    });
  }

  async archive(id: number) {
    return this.prisma.note.update({
      where: {
        id,
      },
      data: {
        archived: true,
      },
    });
  }

  async unarchive(id: number) {
    return this.prisma.note.update({
      where: {
        id,
      },
      data: {
        archived: false,
      },
    });
  }

  async findArchived() {
    return this.prisma.note.findMany({
      where: {
        archived: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async update(id: number, data: UpdateNoteDto) {
    return this.prisma.note.update({
      where: {
        id,
      },
      data,
    });
  }
}
