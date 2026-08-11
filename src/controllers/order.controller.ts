import { Request, Response } from 'express';
import { OrderService } from '../services/order/order.service';
import catchAsync from '../utils/catchAsync';
import sendResponse from '../utils/sendResponse';

const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const result = await OrderService.createOrder(userId, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: 'Order created successfully',
    data: result,
  });
});

const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const result = await OrderService.getMyOrders(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order history retrieved successfully',
    data: result,
  });
});

const getAllOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await OrderService.getAllOrders();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'All orders retrieved successfully',
    data: result,
  });
});

const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id as string;
  const userRole = req.user?.role as string;
  const result = await OrderService.getOrderById(id, userId, userRole);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order details retrieved successfully',
    data: result,
  });
});

const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await OrderService.updateOrderStatus(id, status);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order status updated successfully',
    data: result,
  });
});

const deleteOrder = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await OrderService.deleteOrder(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: 'Order deleted successfully',
    data: null,
  });
});

export const OrderController = {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
