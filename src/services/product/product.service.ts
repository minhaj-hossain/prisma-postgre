import { prisma } from '../../lib/prisma';
import AppError from '../../utils/AppError';

const createProduct = async (payload: any) => {
  // Check if category exists
  const categoryExists = await prisma.category.findUnique({
    where: { id: payload.categoryId },
  });

  if (!categoryExists || categoryExists.isDeleted) {
    throw new AppError(400, 'Category not found or has been deleted');
  }

  return await prisma.product.create({
    data: payload,
    include: {
      category: true,
    },
  });
};

const getAllProducts = async (query: any) => {
  const {
    searchTerm,
    categoryId,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 10,
  } = query;

  // Build dynamic prisma query conditions
  const whereConditions: any = {
    isDeleted: false,
  };

  if (searchTerm) {
    whereConditions.OR = [
      { name: { contains: searchTerm, mode: 'insensitive' } },
      { description: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  if (categoryId) {
    whereConditions.categoryId = categoryId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    whereConditions.price = {};
    if (minPrice !== undefined) {
      whereConditions.price.gte = parseFloat(minPrice);
    }
    if (maxPrice !== undefined) {
      whereConditions.price.lte = parseFloat(maxPrice);
    }
  }

  // Calculate pagination params
  const parsedPage = Math.max(1, parseInt(page));
  const parsedLimit = Math.max(1, parseInt(limit));
  const skip = (parsedPage - 1) * parsedLimit;

  // Fetch count and records in parallel for performance
  const [totalCount, products] = await Promise.all([
    prisma.product.count({ where: whereConditions }),
    prisma.product.findMany({
      where: whereConditions,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: parsedLimit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / parsedLimit);

  return {
    meta: {
      page: parsedPage,
      limit: parsedLimit,
      totalCount,
      totalPages,
    },
    result: products,
  };
};

const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      reviews: {
        where: { isDeleted: false },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!product || product.isDeleted) {
    throw new AppError(404, 'Product not found');
  }

  return product;
};

const updateProduct = async (id: string, payload: any) => {
  // Check if product exists
  await getProductById(id);

  if (payload.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: payload.categoryId },
    });
    if (!categoryExists || categoryExists.isDeleted) {
      throw new AppError(400, 'Target category was not found or is deleted');
    }
  }

  return await prisma.product.update({
    where: { id },
    data: payload,
    include: {
      category: true,
    },
  });
};

const deleteProduct = async (id: string) => {
  await getProductById(id);

  // Soft delete product
  return await prisma.product.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const ProductService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
