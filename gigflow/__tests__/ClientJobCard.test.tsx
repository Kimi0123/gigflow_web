import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ClientJobCard } from "../app/components/dashboard/ClientDashboard";
import { jobApi, type Job } from "../app/lib/api/jobApi";

jest.mock("../app/lib/api/jobApi", () => ({
  jobApi: {
    proposals: jest.fn().mockResolvedValue([]),
    updateProposalStatus: jest.fn().mockResolvedValue({ id: "p1", status: "accepted" }),
  },
}));

describe("ClientJobCard Component Tests", () => {
  const baseJob: Job = {
    id: "job-1",
    _id: "650000000000000000000001",
    title: "React Web Application Developer",
    category: "Development",
    budgetType: "fixed",
    budgetMin: 50000,
    budget: "Rs. 50,000",
    duration: "1 Month",
    status: "draft",
    skills: ["React", "TypeScript"],
    description: "Build a high-performance web dashboard using Next.js and Tailwind.",
    proposalCount: 3,
    client: {
      id: "client-1",
      name: "Client Alice",
      initials: "CA",
    },
    postedAt: "2 days ago",
    createdAt: "2026-07-20T10:00:00.000Z",
  };

  const defaultProps = {
    job: baseJob,
    token: "mock-token",
    onDelete: jest.fn(),
    onStatusChange: jest.fn(),
    onToast: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    window.confirm = jest.fn().mockReturnValue(true);
  });

  it("renders Publish button only when job status is 'draft'", () => {
    render(<ClientJobCard {...defaultProps} job={{ ...baseJob, status: "draft" }} />);

    expect(screen.getByRole("button", { name: /publish/i })).toBeInTheDocument();
    expect(screen.queryByTitle("Reopen job")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Close job")).not.toBeInTheDocument();
  });

  it("renders Reopen button only when job status is 'closed'", () => {
    render(<ClientJobCard {...defaultProps} job={{ ...baseJob, status: "closed" }} />);

    expect(screen.getByTitle("Reopen job")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /publish/i })).not.toBeInTheDocument();
    expect(screen.queryByTitle("Close job")).not.toBeInTheDocument();
  });

  it("renders Close button only when job status is 'open'", () => {
    render(<ClientJobCard {...defaultProps} job={{ ...baseJob, status: "open" }} />);

    expect(screen.getByTitle("Close job")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /publish/i })).not.toBeInTheDocument();
    expect(screen.queryByTitle("Reopen job")).not.toBeInTheDocument();
  });

  it("renders duplicate skills without React key collision console errors", () => {
    const spyConsoleError = jest.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ClientJobCard
        {...defaultProps}
        job={{ ...baseJob, skills: ["React", "React", "TypeScript", "React"] }}
      />
    );

    expect(screen.getAllByText("React")).toHaveLength(3);
    expect(spyConsoleError).not.toHaveBeenCalledWith(
      expect.stringContaining("same key")
    );

    spyConsoleError.mockRestore();
  });

  it("calls onStatusChange('open') when clicking Publish button on a draft job", () => {
    const handleStatusChange = jest.fn();
    render(
      <ClientJobCard
        {...defaultProps}
        job={{ ...baseJob, status: "draft" }}
        onStatusChange={handleStatusChange}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /publish/i }));
    expect(handleStatusChange).toHaveBeenCalledWith("open");
  });

  it("calls onStatusChange('open') when clicking Reopen button on a closed job", () => {
    const handleStatusChange = jest.fn();
    render(
      <ClientJobCard
        {...defaultProps}
        job={{ ...baseJob, status: "closed" }}
        onStatusChange={handleStatusChange}
      />
    );

    fireEvent.click(screen.getByTitle("Reopen job"));
    expect(handleStatusChange).toHaveBeenCalledWith("open");
  });

  it("calls onStatusChange('closed') when clicking Close button on an open job", () => {
    const handleStatusChange = jest.fn();
    render(
      <ClientJobCard
        {...defaultProps}
        job={{ ...baseJob, status: "open" }}
        onStatusChange={handleStatusChange}
      />
    );

    fireEvent.click(screen.getByTitle("Close job"));
    expect(handleStatusChange).toHaveBeenCalledWith("closed");
  });

  it("calls onDelete when delete button is clicked and confirmed", () => {
    const handleDelete = jest.fn();
    render(<ClientJobCard {...defaultProps} onDelete={handleDelete} />);

    const deleteBtn = screen.getByTitle("Delete job");
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalledWith("Delete this job and all its proposals?");
    expect(handleDelete).toHaveBeenCalled();
  });

  it("toggles proposal view and fetches proposals via jobApi.proposals on View button click", async () => {
    (jobApi.proposals as jest.Mock).mockResolvedValueOnce([
      {
        id: "prop-1",
        freelancerName: "John Freelancer",
        bidAmount: 45000,
        status: "pending",
      },
    ]);

    render(<ClientJobCard {...defaultProps} />);
    const viewBtn = screen.getByRole("button", { name: /view/i });

    fireEvent.click(viewBtn);

    await waitFor(() => {
      expect(jobApi.proposals).toHaveBeenCalledWith("mock-token", "job-1");
      expect(screen.getByRole("button", { name: /hide/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /hide/i }));
    expect(screen.getByRole("button", { name: /view/i })).toBeInTheDocument();
  });
});
