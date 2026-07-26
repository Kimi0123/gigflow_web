import mongoose from "mongoose";
import { ErrorCodes } from "../errors/error-codes";
import { HttpError } from "../errors/http-error";
import { ContractModel } from "../models/contract.model";
import { JobModel } from "../models/job.model";
import { ProposalModel } from "../models/proposal.model";

export const adminDeleteJob = async (jobId: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw new HttpError(400, "Invalid job ID");
  }

  const job = await JobModel.findById(jobId);
  if (!job) {
    throw new HttpError(404, "Job not found", { code: ErrorCodes.NOT_FOUND });
  }

  // Block deletion if there's an active contract referencing this job.
  // An active contract means work is currently in progress and both parties
  // have live obligations — deleting the job would break the contract's job
  // reference and cause errors on contract detail pages. Admin should
  // cancel/complete the contract first, then delete the job.
  const activeContract = await ContractModel.findOne({
    job: job._id,
    status: "active",
  });

  if (activeContract) {
    throw new HttpError(
      409,
      "Cannot delete a job with an active contract. Please cancel or complete the contract first.",
      { code: ErrorCodes.CONFLICT }
    );
  }

  // Cascade-delete proposals for this job (safe — proposals reference job by
  // ObjectId and have no further dependents; leaving them orphaned would
  // clutter the DB and potentially surface in freelancer proposal lists).
  await ProposalModel.deleteMany({ job: job._id });

  await job.deleteOne();
};
