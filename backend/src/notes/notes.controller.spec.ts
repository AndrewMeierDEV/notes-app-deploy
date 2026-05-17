import { Test, TestingModule } from '@nestjs/testing';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';

describe('NotesController', () => {
  let controller: NotesController;
  const notesServiceMock = {
    findArchived: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    archive: jest.fn(),
    unarchive: jest.fn(),
    update: jest.fn(),
    findCategories: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotesController],
      providers: [
        {
          provide: NotesService,
          useValue: notesServiceMock,
        },
      ],
    }).compile();

    controller = module.get<NotesController>(NotesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should unarchive a note', () => {
    notesServiceMock.unarchive.mockReturnValue({ id: 1, archived: false });

    expect(controller.unarchive(1)).toEqual({ id: 1, archived: false });
    expect(notesServiceMock.unarchive).toHaveBeenCalledWith(1);
  });

  it('should list categories', () => {
    notesServiceMock.findCategories.mockReturnValue([{ id: 1, name: 'work' }]);

    expect(controller.findCategories()).toEqual([{ id: 1, name: 'work' }]);
    expect(notesServiceMock.findCategories).toHaveBeenCalled();
  });
});
