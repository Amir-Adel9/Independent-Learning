import { Exclude } from 'class-transformer';

export class CategoryEntity {
  id: string;
  name: string;
  description: string | null;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<CategoryEntity>) {
    Object.assign(this, partial);
  }
}
