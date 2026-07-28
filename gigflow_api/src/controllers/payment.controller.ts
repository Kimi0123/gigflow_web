import { NextFunction, Request, Response } from "express";
import { fundContract, getWalletSummary } from "../services/payment.service";
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
