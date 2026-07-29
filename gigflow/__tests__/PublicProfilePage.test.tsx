import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PublicProfilePage from "../app/freelancers/[id]/page";
import { useAuth } from "../app/providers/AuthContext";
import { freelancerApi } from "../app/lib/api/freelancerApi";
import { reviewApi } from "../app/lib/api/reviewApi";

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useParams: () => ({ id: "free-123" }),
  useRouter: () => ({
    back: mockBack,
    push: mockPush,
  }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

jest.mock("../app/providers/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../app/lib/api/freelancerApi", () => ({
  freelancerApi: {
    getPublicProfile: jest.fn(),
  },
  resolveAssetUrl: (path: string) => `http://localhost:5000${path}`,
}));

jest.mock("../app/lib/api/reviewApi", () => ({
  reviewApi: {
    getUserReviews: jest.fn().mockResolvedValue({
      reviews: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
    }),
  },
}));

describe("PublicProfilePage Component Tests", () => {
  const mockProfile = {
    id: "free-123",
    firstName: "Sarah",
    lastName: "Connor",
    initials: "SC",
    role: "freelancer",
    title: "Senior Fullstack Engineer",
    bio: "Passionate software architect with 8 years experience building web applications.",
    skills: ["React", "TypeScript", "Node.js"],
    totalReviews: 5,
    averageRating: 4.8,
    completedContractsCount: 12,
    cvUrl: "/uploads/sarah_cv.pdf",
    createdAt: "2024-01-15T00:00:00Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      token: "mock-jwt-token",
    });
  });

  it("renders freelancer name, bio, skills, and rating when profile loads successfully", async () => {
    (freelancerApi.getPublicProfile as jest.Mock).mockResolvedValueOnce(mockProfile);

    render(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
      expect(screen.getByText("Senior Fullstack Engineer")).toBeInTheDocument();
      expect(
        screen.getByText(/Passionate software architect with 8 years experience/i)
      ).toBeInTheDocument();
      expect(screen.getByText("React")).toBeInTheDocument();
      expect(screen.getByText("TypeScript")).toBeInTheDocument();
      expect(screen.getByText("4.8")).toBeInTheDocument();
    });
  });

  it("renders Download CV link when cvUrl is present on profile", async () => {
    (freelancerApi.getPublicProfile as jest.Mock).mockResolvedValueOnce(mockProfile);

    render(<PublicProfilePage />);

    await waitFor(() => {
      const cvLink = screen.getByRole("link", { name: /download cv/i });
      expect(cvLink).toBeInTheDocument();
      expect(cvLink).toHaveAttribute(
        "href",
        "http://localhost:5000/uploads/sarah_cv.pdf"
      );
    });
  });

  it("does not render Download CV link when cvUrl is missing/null", async () => {
    (freelancerApi.getPublicProfile as jest.Mock).mockResolvedValueOnce({
      ...mockProfile,
      cvUrl: null,
    });

    render(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.queryByRole("link", { name: /download cv/i })).not.toBeInTheDocument();
    });
  });

  it("calls router.back() when Back button is clicked", async () => {
    (freelancerApi.getPublicProfile as jest.Mock).mockResolvedValueOnce(mockProfile);

    render(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("Sarah Connor")).toBeInTheDocument();
    });

    const backBtn = screen.getByRole("button", { name: /← back/i });
    fireEvent.click(backBtn);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("renders Dashboard link pointing to /dashboard", async () => {
    (freelancerApi.getPublicProfile as jest.Mock).mockResolvedValueOnce(mockProfile);

    render(<PublicProfilePage />);

    await waitFor(() => {
      const dashLink = screen.getByRole("link", { name: /dashboard/i });
      expect(dashLink).toBeInTheDocument();
      expect(dashLink).toHaveAttribute("href", "/dashboard");
    });
  });

  it("renders 'User Not Found' state when profile API fails or returns null", async () => {
    (freelancerApi.getPublicProfile as jest.Mock).mockRejectedValueOnce(
      new Error("User profile not found")
    );

    render(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("User Not Found")).toBeInTheDocument();
      expect(screen.getByText("User profile not found")).toBeInTheDocument();
    });
  });

  it("calls router.back() from 'User Not Found' page Back button", async () => {
    (freelancerApi.getPublicProfile as jest.Mock).mockRejectedValueOnce(
      new Error("User profile not found")
    );

    render(<PublicProfilePage />);

    await waitFor(() => {
      expect(screen.getByText("User Not Found")).toBeInTheDocument();
    });

    const backDirBtn = screen.getByRole("button", { name: /back to directory/i });
    fireEvent.click(backDirBtn);

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
