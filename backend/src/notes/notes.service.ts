import { Injectable } from '@nestjs/common';
import { Note, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

type Category = {
  id: number;
  name: string;
};

type CategoryRow = Category & {
  noteId: number;
};

type NoteWithCategories = Note & {
  categories: Category[];
};

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  private getCategoryNames(categoryNames?: string[]) {
    return [
      ...new Set(
        (categoryNames ?? [])
          .map((name) => name.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];
  }

  private async setCategories(noteId: number, categoryNames?: string[]) {
    const names = this.getCategoryNames(categoryNames);

    await this.prisma.$executeRaw`
      DELETE FROM "_CategoryToNote"
      WHERE "B" = ${noteId}
    `;

    for (const name of names) {
      await this.prisma.$executeRaw`
        INSERT INTO "Category" ("name")
        VALUES (${name})
        ON CONFLICT ("name") DO NOTHING
      `;

      await this.prisma.$executeRaw`
        INSERT INTO "_CategoryToNote" ("A", "B")
        SELECT "id", ${noteId}
        FROM "Category"
        WHERE "name" = ${name}
        ON CONFLICT ("A", "B") DO NOTHING
      `;
    }
  }

  private async withCategories(notes: Note[]): Promise<NoteWithCategories[]> {
    if (notes.length === 0) {
      return [];
    }

    const noteIds = notes.map((note) => note.id);
    const rows = await this.prisma.$queryRaw<CategoryRow[]>`
      SELECT c."id", c."name", cn."B" as "noteId"
      FROM "_CategoryToNote" cn
      INNER JOIN "Category" c ON c."id" = cn."A"
      WHERE cn."B" IN (${Prisma.join(noteIds)})
      ORDER BY c."name" ASC
    `;

    return notes.map((note) => ({
      ...note,
      categories: rows
        .filter((row) => row.noteId === note.id)
        .map(({ id, name }) => ({ id, name })),
    }));
  }

  private async withCategory(note: Note): Promise<NoteWithCategories> {
    const [noteWithCategories] = await this.withCategories([note]);
    return noteWithCategories;
  }

  async findAll() {
    const notes = await this.prisma.note.findMany({
      where: {
        archived: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.withCategories(notes);
  }

  async create(data: CreateNoteDto) {
    const { categoryNames, ...noteData } = data;

    const note = await this.prisma.note.create({
      data: noteData,
    });

    await this.setCategories(note.id, categoryNames);
    return this.withCategory(note);
  }

  async remove(id: number) {
    return this.prisma.note.delete({
      where: {
        id,
      },
    });
  }

  async archive(id: number) {
    const note = await this.prisma.note.update({
      where: {
        id,
      },
      data: {
        archived: true,
      },
    });

    return this.withCategory(note);
  }

  async unarchive(id: number) {
    const note = await this.prisma.note.update({
      where: {
        id,
      },
      data: {
        archived: false,
      },
    });

    return this.withCategory(note);
  }

  async findArchived() {
    const notes = await this.prisma.note.findMany({
      where: {
        archived: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return this.withCategories(notes);
  }

  async update(id: number, data: UpdateNoteDto) {
    const { categoryNames, ...noteData } = data;

    const note = await this.prisma.note.update({
      where: {
        id,
      },
      data: noteData,
    });

    if (categoryNames) {
      await this.setCategories(id, categoryNames);
    }

    return this.withCategory(note);
  }

  async findCategories() {
    return this.prisma.$queryRaw<Category[]>`
      SELECT "id", "name"
      FROM "Category"
      ORDER BY "name" ASC
    `;
  }
}
