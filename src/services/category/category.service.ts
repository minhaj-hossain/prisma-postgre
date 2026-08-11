import { prisma } from '../../lib/prisma';
import AppError from '../../utils/AppError';

const createCategory = async (payload: any) => {
  const existingCategory = await prisma.category.findUnique({
    where: { slug: payload.slug },
  });

  if (existingCategory) {
    if (existingCategory.isDeleted) {
      // Re-activate previously soft-deleted category
      return await prisma.category.update({
        where: { id: existingCategory.id },
        data: {
          name: payload.name,
          description: payload.description,
          isDeleted: false,
        },
      });
    }
    throw new AppError(400, 'Category with this slug already exists');
  }

  return await prisma.category.create({
    data: payload,
  });
};

const getAllCategories = async () => {
  return await prisma.category.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: 'desc' },
  });
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category || category.isDeleted) {
    throw new AppError(404, 'Category not found');
  }

  return category;
};

const updateCategory = async (id: string, payload: any) => {
  // Check if category exists
  await getCategoryById(id);

  if (payload.slug) {
    const duplicateSlug = await prisma.category.findFirst({
      where: {
        slug: payload.slug,
        id: { not: id },
      },
    });
    if (duplicateSlug) {
      throw new AppError(400, 'Another category with this slug already exists');
    }
  }

  return await prisma.category.update({
    where: { id },
    data: payload,
  });
};

const deleteCategory = async (id: string) => {
  await getCategoryById(id);

  // Soft Delete category by setting isDeleted to true
  return await prisma.category.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const CategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
