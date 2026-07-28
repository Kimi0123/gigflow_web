import { NextFunction, Request, Response } from "express";
import {
  fundContract,
  getWalletSummary,
  initiateTopup,
  mockTopup,
  verifyTopup,
  withdrawFunds,
} from "../services/payment.service";
import { sendSuccess } from "../utils/api-response";

// ─── Payment Controllers ───────────────────────────────────────────────────────

export const fundContractHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await fundContract(req.userId!, req.params.id as string);
    sendSuccess(res, 200, "Contract funded successfully", result);
  } catch (error) {
    next(error);
  }
};

export const getWalletHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const summary = await getWalletSummary(req.userId!);
    sendSuccess(res, 200, "Wallet fetched successfully", summary);
  } catch (error) {
    next(error);
  }
};

export const initiateTopupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount } = req.body;
    const result = await initiateTopup(req.userId!, Number(amount));
    sendSuccess(res, 200, "Top-up initiated successfully", result);
  } catch (error) {
    next(error);
  }
};

export const verifyTopupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.query.data as string;
    const result = await verifyTopup(data);
    sendSuccess(res, 200, "Top-up verified successfully", result);
  } catch (error) {
    next(error);
  }
};

export const withdrawHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount } = req.body;
    const result = await withdrawFunds(req.userId!, Number(amount));
    sendSuccess(res, 200, "Withdrawal successful", result);
  } catch (error) {
    next(error);
  }
};

export const mockTopupHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount } = req.body;
    const result = await mockTopup(req.userId!, Number(amount));
    sendSuccess(res, 200, "Top-up successful", result);
  } catch (error) {
    next(error);
  }
};
