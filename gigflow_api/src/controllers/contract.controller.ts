import { NextFunction, Request, Response } from "express";
import {
  completeContract,
  getClientContracts,
  getContractById,
  getFreelancerContracts,
} from "../services/contract.service";
import { sendSuccess } from "../utils/api-response";

export const getClientContractsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contracts = await getClientContracts(req.userId!);
    sendSuccess(res, 200, "Contracts fetched successfully", contracts);
  } catch (error) {
    next(error);
  }
};

export const getFreelancerContractsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contracts = await getFreelancerContracts(req.userId!);
    sendSuccess(res, 200, "Contracts fetched successfully", contracts);
  } catch (error) {
    next(error);
  }
};

export const getContractByIdHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contract = await getContractById(req.userId!, req.params.id as string);
    sendSuccess(res, 200, "Contract fetched successfully", contract);
  } catch (error) {
    next(error);
  }
};

export const completeContractHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const contract = await completeContract(req.userId!, req.params.id as string);
    sendSuccess(res, 200, "Contract marked as complete", contract);
  } catch (error) {
    next(error);
  }
};
