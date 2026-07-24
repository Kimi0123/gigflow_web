import mongoose from "mongoose";
import { sendMessageDto } from "../dtos/message.dto";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import { ContractModel } from "../models/contract.model";
import { IMessageDocument, MessageModel } from "../models/message.model";

export const verifyContractParty = async (userId: string, contractId: string) => {
  if (!contractId) {
    throw new HttpError(400, "Contract ID is required", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  const contract = await ContractModel.findById(contractId);
  if (!contract) {
    throw new HttpError(404, "Contract not found", {
      code: ErrorCodes.NOT_FOUND,
    });
  }

  const isClient = contract.client.toString() === userId;
  const isFreelancer = contract.freelancer.toString() === userId;

  if (!isClient && !isFreelancer) {
    throw new HttpError(403, "You are not a party to this contract", {
      code: ErrorCodes.AUTH_FORBIDDEN,
    });
  }

  return contract;
};

const serializeMessage = (msg: IMessageDocument) => {
  const senderDoc = msg.populated("sender")
    ? (msg.sender as unknown as {
        _id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
      })
    : null;

  return {
    _id: msg._id.toString(),
    id: msg._id.toString(),
    contractId: msg.contract.toString(),
    senderId: senderDoc?._id?.toString() ?? msg.sender.toString(),
    senderName: senderDoc
      ? `${senderDoc.firstName} ${senderDoc.lastName}`
      : "User",
    senderInitials: senderDoc
      ? `${senderDoc.firstName[0]}${senderDoc.lastName[0]}`.toUpperCase()
      : "U",
    senderProfilePicture: senderDoc?.profilePicture,
    content: msg.content,
    readAt: msg.readAt ? msg.readAt.toISOString() : null,
    createdAt: msg.createdAt.toISOString(),
  };
};

export const sendMessage = async (
  userId: string,
  contractId: string,
  input: unknown
) => {
  const data = sendMessageDto.parse(input);

  const contract = await verifyContractParty(userId, contractId);

  const message = await MessageModel.create({
    contract: contract._id,
    sender: new mongoose.Types.ObjectId(userId),
    content: data.content,
  });

  const populated = await MessageModel.findById(message._id).populate(
    "sender",
    "firstName lastName profilePicture"
  );

  return serializeMessage(populated!);
};

export const getContractMessages = async (
  userId: string,
  contractId: string,
  page: number = 1,
  limit: number = 20
) => {
  await verifyContractParty(userId, contractId);

  const skip = (page - 1) * limit;

  const messages = await MessageModel.find({ contract: contractId })
    .populate("sender", "firstName lastName profilePicture")
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit);

  const total = await MessageModel.countDocuments({ contract: contractId });

  return {
    messages: messages.map(serializeMessage),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const markMessagesRead = async (userId: string, contractId: string) => {
  await verifyContractParty(userId, contractId);

  await MessageModel.updateMany(
    {
      contract: contractId,
      sender: { $ne: new mongoose.Types.ObjectId(userId) },
      readAt: null,
    },
    {
      $set: { readAt: new Date() },
    }
  );

  return { message: "Messages marked as read" };
};

export const getUnreadCount = async (userId: string) => {
  const userObjId = new mongoose.Types.ObjectId(userId);

  const result = await MessageModel.aggregate([
    {
      $match: {
        sender: { $ne: userObjId },
        readAt: null,
      },
    },
    {
      $lookup: {
        from: "contracts",
        localField: "contract",
        foreignField: "_id",
        as: "contractDoc",
      },
    },
    {
      $unwind: "$contractDoc",
    },
    {
      $match: {
        $or: [
          { "contractDoc.client": userObjId },
          { "contractDoc.freelancer": userObjId },
        ],
      },
    },
    {
      $count: "unreadCount",
    },
  ]);

  return {
    unreadCount: result.length > 0 ? result[0].unreadCount : 0,
  };
};
