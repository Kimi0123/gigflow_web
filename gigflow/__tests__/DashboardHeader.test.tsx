import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardHeader from "../app/components/dashboard/DashboardHeader";
import { useAuth } from "../app/providers/AuthContext";
import { useSocket } from "../app/providers/SocketContext";
import { notificationApi } from "../app/lib/api/notificationApi";
import { messageApi } from "../app/lib/api/messageApi";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} />
  ),
}));

jest.mock("../app/providers/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../app/providers/SocketContext", () => ({
  useSocket: jest.fn(),
}));

jest.mock("../app/lib/api/notificationApi", () => ({
  notificationApi: {
    getUnreadCount: jest.fn().mockResolvedValue({ unreadCount: 0 }),
    getNotifications: jest.fn().mockResolvedValue([]),
    markAsRead: jest.fn().mockResolvedValue({ ok: true }),
    markAllAsRead: jest.fn().mockResolvedValue({ ok: true }),
  },
}));

jest.mock("../app/lib/api/messageApi", () => ({
  messageApi: {
    getUnreadCount: jest.fn().mockResolvedValue({ unreadCount: 0 }),
  },
}));

describe("DashboardHeader Component Tests", () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: "u1",
        firstName: "Alice",
        lastName: "Smith",
        role: "client",
        profilePicture: null,
      },
      token: "mock-jwt-token",
      logout: mockLogout,
    });
    (useSocket as jest.Mock).mockReturnValue({
      socket: null,
    });
  });

  it("renders initials avatar when user has no profilePicture", () => {
    render(<DashboardHeader />);
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("renders real image avatar tag when user.profilePicture is provided", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: "u1",
        firstName: "Alice",
        lastName: "Smith",
        role: "client",
        profilePicture: "/uploads/avatar.png",
      },
      token: "mock-jwt-token",
      logout: mockLogout,
    });

    render(<DashboardHeader />);
    const avatarImg = screen.getByAltText("Alice Smith");
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute("src", expect.stringContaining("avatar.png"));
  });

  it("hides notification unread badge when unreadCount is 0", async () => {
    (notificationApi.getUnreadCount as jest.Mock).mockResolvedValueOnce({ unreadCount: 0 });

    render(<DashboardHeader />);

    await waitFor(() => {
      expect(notificationApi.getUnreadCount).toHaveBeenCalled();
    });

    const bellBtn = screen.getByRole("button", { name: /notifications/i });
    expect(bellBtn.querySelector("span")).toBeNull();
  });

  it("renders notification unread badge when unreadCount > 0", async () => {
    (notificationApi.getUnreadCount as jest.Mock).mockResolvedValueOnce({ unreadCount: 5 });

    render(<DashboardHeader />);

    await waitFor(() => {
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  it("opens notification dropdown menu when clicking notification bell button", async () => {
    (notificationApi.getNotifications as jest.Mock).mockResolvedValueOnce([
      {
        id: "n1",
        type: "proposal_received",
        message: "New proposal submitted for your job",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    render(<DashboardHeader />);
    const bellBtn = screen.getByRole("button", { name: /notifications/i });
    fireEvent.click(bellBtn);

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getByText("New proposal submitted for your job")).toBeInTheDocument();
    });
  });

  it("calls onPostJob callback when Post a Job button is clicked", () => {
    const handlePostJob = jest.fn();
    render(<DashboardHeader onPostJob={handlePostJob} />);

    const postJobBtn = screen.getByRole("button", { name: /post a job/i });
    fireEvent.click(postJobBtn);

    expect(handlePostJob).toHaveBeenCalledTimes(1);
  });

  it("renders Post a Job as a Link pointing to /dashboard/client when onPostJob is omitted", () => {
    render(<DashboardHeader />);

    const postJobLink = screen.getByRole("link", { name: /post a job/i });
    expect(postJobLink).toBeInTheDocument();
    expect(postJobLink).toHaveAttribute("href", "/dashboard/client");
  });

  it("links logo to role-aware dashboard (/dashboard/client for client)", () => {
    render(<DashboardHeader />);

    const logoLink = screen.getByRole("link", { name: /gigflow/i });
    expect(logoLink).toHaveAttribute("href", "/dashboard/client");
  });

  it("links logo to /dashboard/freelancer for freelancer role", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: "u2",
        firstName: "Bob",
        lastName: "Builder",
        role: "freelancer",
      },
      token: "mock-jwt-token",
      logout: mockLogout,
    });

    render(<DashboardHeader />);

    const logoLink = screen.getByRole("link", { name: /gigflow/i });
    expect(logoLink).toHaveAttribute("href", "/dashboard/freelancer");
  });
});
