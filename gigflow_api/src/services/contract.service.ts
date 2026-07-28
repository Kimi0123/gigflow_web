import { ContractModel, IContractDocument } from "../models/contract.model";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import { JobModel } from "../models/job.model";
import { createNotification } from "./notification.service";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const timeAgo = (date: Date): string => {
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins > 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
  return new Date(date).toLocaleDateString();
};

const serializeContract = (contract: IContractDocument) => {
  const jobDoc = contract.populated("job")
    ? (contract.job as unknown as { _id: string; title: string })
    : null;

  const clientDoc = contract.populated("client")
    ? (contract.client as unknown as {
        _id: string;
        firstName: string;
        lastName: string;
      })
    : null;

  const freelancerDoc = contract.populated("freelancer")
    ? (contract.freelancer as unknown as {
        _id: string;
        firstName: string;
        lastName: string;
        profilePicture?: string;
      })
    : null;

  return {
    _id: contract._id.toString(),
    id: contract._id.toString(),
    jobId: jobDoc?._id?.toString() ?? contract.job.toString(),
    jobTitle: jobDoc?.title ?? "Unknown Job",
    clientId: clientDoc?._id?.toString() ?? contract.client.toString(),
    clientName: clientDoc
      ? `${clientDoc.firstName} ${clientDoc.lastName}`
      : "Client",
    clientInitials: clientDoc
      ? `${clientDoc.firstName[0]}${clientDoc.lastName[0]}`.toUpperCase()
      : "CL",
    freelancerId: freelancerDoc?._id?.toString() ?? contract.freelancer.toString(),
    freelancerName: freelancerDoc
      ? `${freelancerDoc.firstName} ${freelancerDoc.lastName}`
      : "Freelancer",
    freelancerInitials: freelancerDoc
      ? `${freelancerDoc.firstName[0]}${freelancerDoc.lastName[0]}`.toUpperCase()
      : "FL",
    freelancerProfilePicture: freelancerDoc?.profilePicture,
    agreedAmount: contract.agreedAmount,
    status: contract.status,
    startedAt: timeAgo(contract.startedAt),
    completedAt: contract.completedAt ? timeAgo(contract.completedAt) : undefined,
    createdAt: contract.createdAt.toISOString(),
  };
};

// ─── Contract Service ─────────────────────────────────────────────────────────

export const getClientContracts = async (clientId: string) => {
  const contracts = await ContractModel.find({ client: clientId })
    .populate("job", "title")
    .populate("freelancer", "firstName lastName profilePicture")
    .sort({ createdAt: -1 });

  return contracts.map(serializeContract);
};

export const getFreelancerContracts = async (freelancerId: string) => {
  const contracts = await ContractModel.find({ freelancer: freelancerId })
    .populate("job", "title")
    .populate("client", "firstName lastName")
    .sort({ createdAt: -1 });

  return contracts.map(serializeContract);
};

export const getContractById = async (userId: string, contractId: string) => {
  const contract = await ContractModel.findById(contractId)
    .populate("job", "title")
    .populate("client", "firstName lastName")
    .populate("freelancer", "firstName lastName profilePicture");

  if (!contract) {
    throw new HttpError(404, "Contract not found", { code: ErrorCodes.NOT_FOUND });
  }

  const isParty =
    contract.client.toString() === userId ||
    contract.freelancer.toString() === userId;

  if (!isParty) {
    throw new HttpError(403, "You are not a party to this contract", {
      code: ErrorCodes.AUTH_FORBIDDEN,
    });
  }

  return serializeContract(contract);
};

export const completeContract = async (clientId: string, contractId: string) => {
  const contract = await ContractModel.findById(contractId);

  if (!contract) {
    throw new HttpError(404, "Contract not found", { code: ErrorCodes.NOT_FOUND });
  }

  if (contract.client.toString() !== clientId) {
    throw new HttpError(403, "Only the client on this contract can mark it complete", {
      code: ErrorCodes.AUTH_FORBIDDEN,
    });
  }

  if (contract.status !== "active") {
    throw new HttpError(400, "Only active contracts can be completed", {
      code: ErrorCodes.BAD_REQUEST,
    });
  }

  contract.status = "completed";
  contract.completedAt = new Date();
  await contract.save();

  // Close the associated job now that the contract is fulfilled
  await JobModel.findByIdAndUpdate(contract.job, { status: "closed" });

  await createNotification(
    contract.client.toString(),
    "contract_completed",
    "Contract marked as complete",
    contract._id.toString()
  );

  await createNotification(
    contract.freelancer.toString(),
    "contract_completed",
    "Contract marked as complete",
    contract._id.toString()
  );

  // Populate for serialization before returning
  const populated = await ContractModel.findById(contractId)
    .populate("job", "title")
    .populate("client", "firstName lastName")
    .populate("freelancer", "firstName lastName profilePicture");

  return serializeContract(populated!);
};
