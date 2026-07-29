import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MessagesTab from "../app/components/dashboard/MessagesTab";
import { useAuth } from "../app/providers/AuthContext";
import { useSocket } from "../app/providers/SocketContext";
import { messageApi } from "../app/lib/api/messageApi";
import type { Contract } from "../app/lib/api/contractApi";

jest.mock("../app/providers/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../app/providers/SocketContext", () => ({
  useSocket: jest.fn(),
}));

jest.mock("../app/lib/api/messageApi", () => ({
  messageApi: {
    getContractMessages: jest.fn().mockResolvedValue({ messages: [] }),
    markMessagesRead: jest.fn().mockResolvedValue({ ok: true }),
    sendMessageRest: jest.fn().mockResolvedValue({
      id: "m-new",
      contractId: "c1",
      senderId: "u1",
      content: "Hello from test",
      createdAt: new Date().toISOString(),
    }),
  },
}));

describe("MessagesTab Component Tests", () => {
  const mockContracts: Contract[] = [
    {
      id: "c1",
      _id: "c1",
      jobId: "j1",
      jobTitle: "Fullstack Web App Development",
      clientId: "u1",
      clientName: "Client Alice",
      clientInitials: "CA",
      freelancerId: "u2",
      freelancerName: "Freelancer Bob",
      freelancerInitials: "FB",
      agreedAmount: 50000,
      status: "active",
      isFunded: true,
      startedAt: "2026-07-01T00:00:00Z",
      createdAt: "2026-07-01T00:00:00Z",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "u1", firstName: "Alice", role: "client" },
      token: "mock-jwt-token",
    });
    (useSocket as jest.Mock).mockReturnValue({
      socket: null,
      isConnected: false,
    });
  });

  it("renders empty state when contracts array is empty ('No conversations yet')", () => {
    render(<MessagesTab role="client" contracts={[]} onToast={jest.fn()} />);

    expect(screen.getByText("No conversations yet")).toBeInTheDocument();
    expect(
      screen.getByText("Messages appear here once you have an active contract.")
    ).toBeInTheDocument();
  });

  it("renders list of contracts showing other party name and initials when photo is absent", () => {
    render(<MessagesTab role="client" contracts={mockContracts} onToast={jest.fn()} />);

    expect(screen.getByText("Freelancer Bob")).toBeInTheDocument();
    expect(screen.getByText("FB")).toBeInTheDocument();
  });

  it("renders real photo for other party when profilePicture is set", () => {
    const contractsWithPhoto: Contract[] = [
      {
        ...mockContracts[0],
        freelancerProfilePicture: "/uploads/bob.png",
      },
    ];

    render(<MessagesTab role="client" contracts={contractsWithPhoto} onToast={jest.fn()} />);

    const img = screen.getByAltText("Freelancer Bob");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", expect.stringContaining("bob.png"));
  });

  it("renders empty message panel state when no conversation is selected ('Select a conversation')", () => {
    render(<MessagesTab role="client" contracts={mockContracts} onToast={jest.fn()} />);

    expect(screen.getByText("Select a conversation")).toBeInTheDocument();
    expect(
      screen.getByText("Choose a contract from the left to start messaging.")
    ).toBeInTheDocument();
  });

  it("selects a contract on click and fetches messages via messageApi.getContractMessages", async () => {
    (messageApi.getContractMessages as jest.Mock).mockResolvedValueOnce({
      messages: [
        {
          id: "m1",
          contractId: "c1",
          senderId: "u2",
          senderInitials: "FB",
          content: "Hi Client Alice!",
          createdAt: new Date().toISOString(),
        },
      ],
    });

    render(<MessagesTab role="client" contracts={mockContracts} onToast={jest.fn()} />);

    const contractBtn = screen.getByText("Freelancer Bob").closest("button")!;
    fireEvent.click(contractBtn);

    await waitFor(() => {
      expect(messageApi.getContractMessages).toHaveBeenCalledWith("mock-jwt-token", "c1");
      expect(screen.getByText("Hi Client Alice!")).toBeInTheDocument();
    });
  });

  it("displays message history for selected conversation with sender initials and message content", async () => {
    (messageApi.getContractMessages as jest.Mock).mockResolvedValueOnce({
      messages: [
        {
          id: "m10",
          contractId: "c1",
          senderId: "u1",
          senderInitials: "CA",
          content: "Let's begin the project milestone.",
          createdAt: new Date().toISOString(),
        },
      ],
    });

    render(<MessagesTab role="client" contracts={mockContracts} onToast={jest.fn()} />);
    fireEvent.click(screen.getByText("Freelancer Bob").closest("button")!);

    await waitFor(() => {
      expect(screen.getByText("Let's begin the project milestone.")).toBeInTheDocument();
    });
  });

  it("calls messageApi.sendMessageRest when sending a message via REST fallback (offline socket)", async () => {
    render(<MessagesTab role="client" contracts={mockContracts} onToast={jest.fn()} />);

    // Select contract first
    fireEvent.click(screen.getByText("Freelancer Bob").closest("button")!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Type a message…")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Type a message…");
    fireEvent.change(input, { target: { value: "Hello Bob!" } });

    const sendBtn = screen.getByTitle("Send message");
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(messageApi.sendMessageRest).toHaveBeenCalledWith("mock-jwt-token", "c1", "Hello Bob!");
    });
  });

  it("clears input field after sending a message", async () => {
    render(<MessagesTab role="client" contracts={mockContracts} onToast={jest.fn()} />);
    fireEvent.click(screen.getByText("Freelancer Bob").closest("button")!);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Type a message…")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText("Type a message…") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Testing input clear" } });
    fireEvent.click(screen.getByTitle("Send message"));

    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  it("marks messages as read when selecting a conversation via messageApi.markMessagesRead", async () => {
    render(<MessagesTab role="client" contracts={mockContracts} onToast={jest.fn()} />);
    fireEvent.click(screen.getByText("Freelancer Bob").closest("button")!);

    await waitFor(() => {
      expect(messageApi.markMessagesRead).toHaveBeenCalledWith("mock-jwt-token", "c1");
    });
  });
});
