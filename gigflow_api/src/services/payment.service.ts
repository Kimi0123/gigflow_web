import crypto from "crypto";
import mongoose from "mongoose";
import { getClientUrl, getEsewaConfig } from "../config/env";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import { ContractModel } from "../models/contract.model";
import { TransactionModel } from "../models/transaction.model";
import { WalletModel } from "../models/wallet.model";
import {
  decodeEsewaCallback,
  generateEsewaSignature,
  verifyEsewaSignature,
} from "../utils/esewa.util";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const serializeTransaction = (tx: InstanceType<typeof TransactionModel>) => ({
  _id: tx._id.toString(),
  id: tx._id.toString(),
  contract: tx.contract ? tx.contract.toString() : null,
  from: tx.from ? tx.from.toString() : null,
  to: tx.to ? tx.to.toString() : null,
  amount: tx.amount,
  type: tx.type,
  status: tx.status || "completed",
  createdAt: (tx as any).createdAt instanceof Date
    ? (tx as any).createdAt.toISOString()
    : String((tx as any).createdAt),
});

// ─── Payment Service ──────────────────────────────────────────────────────────

export const fundContract = async (clientId: string, contractId: string) => {
  const contract = await ContractModel.findById(contractId);

  if (!contract) {
    throw new HttpError(404, "Contract not found", { code: ErrorCodes.NOT_FOUND });
  }

  if (contract.client.toString() !== clientId) {
    throw new HttpError(403, "Not authorized for this contract", {
      code: ErrorCodes.AUTH_FORBIDDEN,
    });
  }

  if (contract.isFunded) {
    throw new HttpError(409, "Contract is already funded", { code: ErrorCodes.CONFLICT });
  }

  let wallet = await WalletModel.findOne({ user: clientId });
  if (!wallet) {
    wallet = await WalletModel.create({ user: clientId });
  }

  if (wallet.balance < contract.agreedAmount) {
    throw new HttpError(400, "Insufficient wallet balance", { code: ErrorCodes.BAD_REQUEST });
  }

  // Atomic decrement — the $gte guard prevents over-spend even under concurrent requests.
  const updatedWallet = await WalletModel.findOneAndUpdate(
    { user: clientId, balance: { $gte: contract.agreedAmount } },
    { $inc: { balance: -contract.agreedAmount } },
    { returnDocument: "after" }
  );

  if (!updatedWallet) {
    throw new HttpError(400, "Insufficient wallet balance", { code: ErrorCodes.BAD_REQUEST });
  }

  // Mark contract as funded
  await ContractModel.findByIdAndUpdate(contractId, { isFunded: true });

  // Record "fund" transaction (money held in escrow — no "to")
  await TransactionModel.create({
    contract: new mongoose.Types.ObjectId(contractId),
    from: new mongoose.Types.ObjectId(clientId),
    to: null,
    amount: contract.agreedAmount,
    type: "fund",
    status: "completed",
  });

  // Re-fetch to return the updated contract state
  const updatedContract = await ContractModel.findById(contractId);

  return {
    contract: {
      id: updatedContract!._id.toString(),
      isFunded: updatedContract!.isFunded,
      agreedAmount: updatedContract!.agreedAmount,
      status: updatedContract!.status,
    },
    walletBalance: updatedWallet.balance,
  };
};

export const releasePayment = async (contractId: string) => {
  const contract = await ContractModel.findById(contractId);

  if (!contract) {
    throw new HttpError(404, "Contract not found", { code: ErrorCodes.NOT_FOUND });
  }

  if (!contract.isFunded) {
    throw new HttpError(400, "Contract is not funded yet", { code: ErrorCodes.BAD_REQUEST });
  }

  // Idempotency guard — prevent double-release
  const alreadyReleased = await TransactionModel.findOne({
    contract: contractId,
    type: "release",
  });
  if (alreadyReleased) {
    return;
  }

  const freelancerId = contract.freelancer.toString();

  // Credit freelancer wallet (upsert so even a missing wallet gets created)
  await WalletModel.findOneAndUpdate(
    { user: new mongoose.Types.ObjectId(freelancerId) },
    { $inc: { balance: contract.agreedAmount } },
    { returnDocument: "after", upsert: true }
  );

  // Record "release" transaction (from escrow — no "from")
  await TransactionModel.create({
    contract: new mongoose.Types.ObjectId(contractId),
    from: null,
    to: new mongoose.Types.ObjectId(freelancerId),
    amount: contract.agreedAmount,
    type: "release",
    status: "completed",
  });
};

export const getWalletSummary = async (userId: string) => {
  const wallet = await WalletModel.findOne({ user: userId });

  const balance = wallet ? wallet.balance : 0;

  const transactions = await TransactionModel.find({
    $or: [
      { to: new mongoose.Types.ObjectId(userId) },
      { from: new mongoose.Types.ObjectId(userId) },
    ],
  }).sort({ createdAt: -1 });

  return {
    balance,
    transactions: transactions
      .filter((tx) => tx.amount != null && tx.type && tx.status !== "pending")
      .map(serializeTransaction),
  };
};

export const initiateTopup = async (userId: string, amount: number) => {
  if (!amount || amount <= 0) {
    throw new HttpError(400, "Amount must be positive", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  const transactionUuid = crypto.randomUUID();

  await TransactionModel.create({
    contract: null,
    from: null,
    to: new mongoose.Types.ObjectId(userId),
    type: "topup",
    amount,
    status: "pending",
    esewaTransactionUuid: transactionUuid,
  });

  const esewaConfig = getEsewaConfig();
  const signature = generateEsewaSignature(
    amount,
    transactionUuid,
    esewaConfig.productCode,
    esewaConfig.secretKey
  );

  return {
    amount,
    tax_amount: 0,
    total_amount: amount,
    transaction_uuid: transactionUuid,
    product_code: esewaConfig.productCode,
    product_service_charge: 0,
    product_delivery_charge: 0,
    success_url: `${getClientUrl()}/wallet/topup/success`,
    failure_url: `${getClientUrl()}/wallet/topup/failure`,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
    gatewayUrl: `${esewaConfig.gatewayUrl.replace(/\/$/, "")}/api/epay/main/v2/form`,
  };
};

export const verifyTopup = async (base64Data: string) => {
  if (!base64Data) {
    throw new HttpError(400, "Invalid payment payload", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  let decoded: Record<string, any>;
  try {
    decoded = decodeEsewaCallback(base64Data);
  } catch (err) {
    throw new HttpError(400, "Invalid payment payload format", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  const esewaConfig = getEsewaConfig();
  const isValidSignature = verifyEsewaSignature(decoded, esewaConfig.secretKey);
  if (!isValidSignature) {
    throw new HttpError(400, "Invalid payment signature", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  // Optional status-check call as defense-in-depth
  try {
    const statusUrl = `${esewaConfig.statusUrl}/api/epay/transaction/status/?product_code=${esewaConfig.productCode}&total_amount=${decoded.total_amount}&transaction_uuid=${decoded.transaction_uuid}`;
    const response = await fetch(statusUrl);
    if (response.ok) {
      const statusData = await response.json();
      if (statusData && statusData.status && statusData.status !== "COMPLETE") {
        console.warn("eSewa status check indicated transaction not complete:", statusData);
      }
    }
  } catch (err) {
    console.warn("eSewa status check endpoint unreachable/failed, relying on verified signature alone.");
  }

  const transactionUuid = decoded.transaction_uuid;
  const transaction = await TransactionModel.findOne({
    esewaTransactionUuid: transactionUuid,
  });

  if (!transaction) {
    throw new HttpError(404, "Transaction not found", {
      code: ErrorCodes.NOT_FOUND,
    });
  }

  if (transaction.status !== "pending") {
    throw new HttpError(409, "Transaction already processed", {
      code: ErrorCodes.CONFLICT,
    });
  }

  const updatedWallet = await WalletModel.findOneAndUpdate(
    { user: transaction.to },
    { $inc: { balance: transaction.amount } },
    { returnDocument: "after", upsert: true }
  );

  transaction.status = "completed";
  await transaction.save();

  return {
    balance: updatedWallet.balance,
    transaction: serializeTransaction(transaction),
  };
};

export const withdrawFunds = async (userId: string, amount: number) => {
  if (!amount || amount <= 0) {
    throw new HttpError(400, "Amount must be positive", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  const updatedWallet = await WalletModel.findOneAndUpdate(
    { user: new mongoose.Types.ObjectId(userId), balance: { $gte: amount } },
    { $inc: { balance: -amount } },
    { returnDocument: "after" }
  );

  if (!updatedWallet) {
    throw new HttpError(400, "Insufficient wallet balance", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  const transaction = await TransactionModel.create({
    contract: null,
    from: new mongoose.Types.ObjectId(userId),
    to: null,
    amount,
    type: "withdraw",
    status: "completed",
  });

  return {
    balance: updatedWallet.balance,
    transaction: serializeTransaction(transaction),
  };
};

export const mockTopup = async (userId: string, amount: number) => {
  if (!amount || amount <= 0) {
    throw new HttpError(400, "Amount must be positive", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  if (amount > 100000) {
    throw new HttpError(400, "Amount too large for demo top-up", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  const updatedWallet = await WalletModel.findOneAndUpdate(
    { user: new mongoose.Types.ObjectId(userId) },
    { $inc: { balance: amount } },
    { returnDocument: "after", upsert: true }
  );

  const transaction = await TransactionModel.create({
    contract: null,
    from: null,
    to: new mongoose.Types.ObjectId(userId),
    type: "topup",
    amount,
    status: "completed",
  });

  return {
    balance: updatedWallet.balance,
    transaction: serializeTransaction(transaction),
  };
};
