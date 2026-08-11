import { prisma } from '../../lib/prisma';
import AppError from '../../utils/AppError';

const createOrder = async (userId: string, payload: { items: { productId: string; quantity: number }[] }) => {
  const { items } = payload;

  // Run database operations in a transaction to guarantee data integrity
  return await prisma.$transaction(async (tx) => {
    let totalAmount = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.isDeleted) {
        throw new AppError(404, `Product with ID ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new AppError(400, `Insufficient stock for product "${product.name}". Available: ${product.stock}`);
      }

      // Calculate total amount
      const itemTotalPrice = product.price * item.quantity;
      totalAmount += itemTotalPrice;

      // Decrement product stock in database
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: {
            decrement: item.quantity,
          },
          // Automatically set status to OUT_OF_STOCK if stock hits 0
          status: product.stock - item.quantity === 0 ? 'OUT_OF_STOCK' : product.status,
        },
      });

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price, // Lock in purchase-time price
      });
    }

    // Create the Order record
    const order = await tx.order.create({
      data: {
        userId,
        totalAmount,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return order;
  });
};

const getMyOrders = async (userId: string) => {
  return await prisma.order.findMany({
    where: {
      userId,
      isDeleted: false,
    },
    include: {
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getAllOrders = async () => {
  return await prisma.order.findMany({
    where: { isDeleted: false },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

const getOrderById = async (id: string, userId: string, userRole: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!order || order.isDeleted) {
    throw new AppError(404, 'Order not found');
  }

  // Customers can only view their own orders
  if (userRole !== 'ADMIN' && order.userId !== userId) {
    throw new AppError(403, 'Forbidden! You can only access your own orders');
  }

  return order;
};

const updateOrderStatus = async (id: string, status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { orderItems: true },
  });

  if (!order || order.isDeleted) {
    throw new AppError(404, 'Order not found');
  }

  // Handle stock restoration on cancellation
  if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
    await prisma.$transaction(async (tx) => {
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
            status: 'ACTIVE',
          },
        });
      }
    });
  }

  return await prisma.order.update({
    where: { id },
    data: { status },
    include: {
      orderItems: true,
    },
  });
};

const deleteOrder = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
  });

  if (!order || order.isDeleted) {
    throw new AppError(404, 'Order not found');
  }

  // Soft delete order
  return await prisma.order.update({
    where: { id },
    data: { isDeleted: true },
  });
};

export const OrderService = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
