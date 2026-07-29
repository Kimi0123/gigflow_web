import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WalletPanel from "../app/components/dashboard/WalletPanel";
import { paymentApi } from "../app/lib/api/paymentApi";

jest.mock("../app/lib/api/paymentApi", () => ({
  paymentApi: {
    getWallet: jest.fn(),
    mockTopup: jest.fn(),
    withdraw: jest.fn(),
  },
}));

describe("WalletPanel Component Tests", () => {
  const mockWallet = {
    balance: 45000,
    transactions: [
      {
        id: "tx-1",
        type: "fund" as const,
        amount: 5000,
        status: "completed" as const,
        createdAt: "2026-07-20T10:00:00Z",
      },
      {
        id: "tx-2",
        type: "release" as const,
        amount: 8000,
        status: "completed" as const,
        createdAt: "2026-07-21T11:00:00Z",
      },
      {
        id: "tx-3",
        type: "topup" as const,
        amount: 10000,
        status: "completed" as const,
        createdAt: "2026-07-22T12:00:00Z",
      },
      {
        id: "tx-4",
        type: "withdraw" as const,
        amount: 2000,
        status: "completed" as const,
        createdAt: "2026-07-23T13:00:00Z",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading skeleton while wallet data is being fetched", () => {
    (paymentApi.getWallet as jest.Mock).mockReturnValue(new Promise(() => {}));

    const { container } = render(<WalletPanel token="mock-token" />);

    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("shows wallet balance and stats after loading", async () => {
    (paymentApi.getWallet as jest.Mock).mockResolvedValueOnce(mockWallet);

    render(<WalletPanel token="mock-token" />);

    await waitFor(() => {
      expect(screen.getByText("45,000")).toBeInTheDocument();
      expect(screen.getByText(/4 transactions/i)).toBeInTheDocument();
    });
  });

  it("shows transaction list with correct type labels (fund/release/topup/withdraw)", async () => {
    (paymentApi.getWallet as jest.Mock).mockResolvedValueOnce(mockWallet);

    render(<WalletPanel token="mock-token" />);

    await waitFor(() => {
      expect(screen.getByText("Contract Funded")).toBeInTheDocument();
      expect(screen.getByText("Payment Received")).toBeInTheDocument();
      expect(screen.getByText("Wallet Top-up (Demo)")).toBeInTheDocument();
      expect(screen.getByText("Withdrawal (Demo)")).toBeInTheDocument();
    });
  });

  it("shows empty state when user has no transactions ('No transactions yet')", async () => {
    (paymentApi.getWallet as jest.Mock).mockResolvedValueOnce({
      balance: 50000,
      transactions: [],
    });

    render(<WalletPanel token="mock-token" />);

    await waitFor(() => {
      expect(screen.getByText("No transactions yet")).toBeInTheDocument();
    });
  });

  it("increases displayed balance on successful demo top-up", async () => {
    (paymentApi.getWallet as jest.Mock).mockResolvedValueOnce({
      balance: 10000,
      transactions: [],
    });
    (paymentApi.mockTopup as jest.Mock).mockResolvedValueOnce({
      balance: 15000,
      transaction: {
        id: "tx-topup",
        type: "topup",
        amount: 5000,
        status: "completed",
        createdAt: new Date().toISOString(),
      },
    });

    render(<WalletPanel token="mock-token" />);

    await waitFor(() => {
      expect(screen.getByText("10,000")).toBeInTheDocument();
    });

    const topupInputs = screen.getAllByPlaceholderText("Enter amount");
    fireEvent.change(topupInputs[0], { target: { value: "5000" } });

    const topupForm = topupInputs[0].closest("form")!;
    fireEvent.submit(topupForm);

    await waitFor(() => {
      expect(paymentApi.mockTopup).toHaveBeenCalledWith("mock-token", 5000);
      expect(screen.getByText("15,000")).toBeInTheDocument();
      expect(screen.getByText(/Successfully added/i)).toBeInTheDocument();
    });
  });

  it("decreases balance on successful withdrawal", async () => {
    (paymentApi.getWallet as jest.Mock).mockResolvedValueOnce({
      balance: 20000,
      transactions: [],
    });
    (paymentApi.withdraw as jest.Mock).mockResolvedValueOnce({
      balance: 15000,
      transaction: {
        id: "tx-withdraw",
        type: "withdraw",
        amount: 5000,
        status: "completed",
        createdAt: new Date().toISOString(),
      },
    });

    render(<WalletPanel token="mock-token" />);

    await waitFor(() => {
      expect(screen.getByText("20,000")).toBeInTheDocument();
    });

    const withdrawInputs = screen.getAllByPlaceholderText("Enter amount");
    fireEvent.change(withdrawInputs[1], { target: { value: "5000" } });

    const withdrawForm = withdrawInputs[1].closest("form")!;
    fireEvent.submit(withdrawForm);

    await waitFor(() => {
      expect(paymentApi.withdraw).toHaveBeenCalledWith("mock-token", 5000);
      expect(screen.getByText("15,000")).toBeInTheDocument();
      expect(screen.getByText(/Successfully withdrew/i)).toBeInTheDocument();
    });
  });

  it("rejects withdrawal amount over current balance with an error message shown", async () => {
    (paymentApi.getWallet as jest.Mock).mockResolvedValueOnce({
      balance: 10000,
      transactions: [],
    });
    (paymentApi.withdraw as jest.Mock).mockRejectedValueOnce({
      message: "Insufficient wallet balance",
    });

    render(<WalletPanel token="mock-token" />);

    await waitFor(() => {
      expect(screen.getByText("10,000")).toBeInTheDocument();
    });

    const withdrawInputs = screen.getAllByPlaceholderText("Enter amount");
    fireEvent.change(withdrawInputs[1], { target: { value: "20000" } });

    const withdrawForm = withdrawInputs[1].closest("form")!;
    fireEvent.submit(withdrawForm);

    await waitFor(() => {
      expect(paymentApi.withdraw).toHaveBeenCalledWith("mock-token", 20000);
      expect(screen.getByText("Insufficient wallet balance")).toBeInTheDocument();
    });
  });

  it("shows error when attempting demo top-up with zero or negative amount", async () => {
    (paymentApi.getWallet as jest.Mock).mockResolvedValueOnce({
      balance: 10000,
      transactions: [],
    });

    render(<WalletPanel token="mock-token" />);

    await waitFor(() => {
      expect(screen.getByText("10,000")).toBeInTheDocument();
    });

    const topupInputs = screen.getAllByPlaceholderText("Enter amount");
    fireEvent.change(topupInputs[0], { target: { value: "0" } });

    const topupForm = topupInputs[0].closest("form")!;
    fireEvent.submit(topupForm);

    await waitFor(() => {
      expect(screen.getByText(/valid positive amount/i)).toBeInTheDocument();
      expect(paymentApi.mockTopup).not.toHaveBeenCalled();
    });
  });

  it("renders demo disclaimer text ('Demo only — no real payment gateway.')", async () => {
    (paymentApi.getWallet as jest.Mock).mockResolvedValueOnce(mockWallet);

    render(<WalletPanel token="mock-token" />);

    await waitFor(() => {
      expect(screen.getAllByText(/Demo only/i).length).toBeGreaterThan(0);
    });
  });
});
