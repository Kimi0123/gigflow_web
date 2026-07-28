import mongoose from "mongoose";
import { ContractModel } from "../models/contract.model";
import { TransactionModel } from "../models/transaction.model";
import { WalletModel } from "../models/wallet.model";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const serializeTransaction = (tx: InstanceType<typeof TransactionModel>) => ({
  _id: tx._id.toString(),
  id: tx._id.toString(),
  contract: tx.contract ? tx.contract.toString() : null,
  from: tx.from ? tx.from.toString() : null,
  to: tx.to ? tx.to.toString() : null,
  amount: tx.amount,
  type: tx.type,
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
  // No session needed: if the findOneAndUpdate succeeds we proceed; if it fails (balance
  // was race-decremented below the threshold) we surface a 400.
  const updatedWallet = await WalletModel.findOneAndUpdate(
    { user: clientId, balance: { $gte: contract.agreedAmount } },
    { $inc: { balance: -contract.agreedAmount } },
    { new: true }
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
    { new: true, upsert: true }
  );

  // Record "release" transaction (from escrow — no "from")
  await TransactionModel.create({
    contract: new mongoose.Types.ObjectId(contractId),
    from: null,
    to: new mongoose.Types.ObjectId(freelancerId),
    amount: contract.agreedAmount,
    type: "release",
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
      .filter((tx) => tx.amount != null && tx.type)
      .map(serializeTransaction),
  };
};
