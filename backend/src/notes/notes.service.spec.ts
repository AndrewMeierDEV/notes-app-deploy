import { Test, TestingModule } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotesService', () => {
  let service: NotesService;
  const prismaMock = {
    note: {
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should unarchive a note', async () => {
    prismaMock.note.update.mockResolvedValue({ id: 1, archived: false });

    await expect(service.unarchive(1)).resolves.toEqual({
      id: 1,
      archived: false,
    });
    expect(prismaMock.note.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { archived: false },
    });
  });
});
