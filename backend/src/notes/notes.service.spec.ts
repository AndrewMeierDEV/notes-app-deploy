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
    $executeRaw: jest.fn(),
    $queryRaw: jest.fn(),
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
    prismaMock.$queryRaw.mockResolvedValue([]);

    await expect(service.unarchive(1)).resolves.toEqual({
      id: 1,
      archived: false,
      categories: [],
    });
    expect(prismaMock.note.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { archived: false },
    });
  });

  it('should list categories by name', async () => {
    prismaMock.$queryRaw.mockResolvedValue([
      {
        id: 1,
        name: 'work',
      },
    ]);

    await expect(service.findCategories()).resolves.toEqual([
      { id: 1, name: 'work' },
    ]);
    expect(prismaMock.$queryRaw).toHaveBeenCalled();
  });
});
