import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "../app/(auth)/register/page";
import { registerAction } from "../app/actions/authActions";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("../app/actions/authActions", () => ({
  registerAction: jest.fn(),
}));

describe("RegisterPage Component Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all registration input fields and action buttons", () => {
    render(<RegisterPage />);

    expect(screen.getByPlaceholderText("Your Full Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@domain.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("+977")).toBeInTheDocument();
    expect(screen.getByText("FIND WORK")).toBeInTheDocument();
    expect(screen.getByText("HIRE TALENT")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Min. 8 characters")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Repeat password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
  });

  it("displays validation errors per required field when registration action returns errors", async () => {
    (registerAction as jest.Mock).mockResolvedValueOnce({
      ok: false,
      message: "Registration failed",
      fieldErrors: {
        fullName: "Full name is required",
        email: "Email is required",
        phoneNumber: "Phone number is required",
        password: "Password must be at least 8 characters",
        acceptedTerms: "You must accept the terms",
      },
    });

    render(<RegisterPage />);
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Full name is required")).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Phone number is required")).toBeInTheDocument();
      expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
      expect(screen.getByText("You must accept the terms")).toBeInTheDocument();
    });
  });

  it("toggles role selection between freelancer and client", () => {
    render(<RegisterPage />);
    const freelancerBtn = screen.getByText("FIND WORK");
    const clientBtn = screen.getByText("HIRE TALENT");

    expect(freelancerBtn).toHaveClass("bg-sky-400");
    expect(clientBtn).not.toHaveClass("bg-sky-400");

    fireEvent.click(clientBtn);

    expect(clientBtn).toHaveClass("bg-sky-400");
    expect(freelancerBtn).not.toHaveClass("bg-sky-400");
  });

  it("calls registerAction with correct form payload on submit", async () => {
    (registerAction as jest.Mock).mockResolvedValueOnce({
      ok: false,
      message: "Failed",
      fieldErrors: {},
    });

    render(<RegisterPage />);

    fireEvent.change(screen.getByPlaceholderText("Your Full Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("you@domain.com"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("+977"), {
      target: { value: "9801234567" },
    });
    fireEvent.click(screen.getByText("HIRE TALENT"));
    fireEvent.change(screen.getByPlaceholderText("Min. 8 characters"), {
      target: { value: "Password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Repeat password"), {
      target: { value: "Password123" },
    });
    const termsCheckbox = screen.getByRole("checkbox");
    fireEvent.click(termsCheckbox);

    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(registerAction).toHaveBeenCalledWith({
        fullName: "John Doe",
        email: "john@example.com",
        phoneNumber: "9801234567",
        role: "client",
        password: "Password123",
        confirmPassword: "Password123",
        acceptedTerms: true,
      });
    });
  });

  it("displays error message in red styling when registration fails", async () => {
    (registerAction as jest.Mock).mockResolvedValueOnce({
      ok: false,
      message: "An account with this email already exists.",
      fieldErrors: { email: "Email in use" },
    });

    render(<RegisterPage />);
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      const errEl = screen.getByText("An account with this email already exists.");
      expect(errEl).toBeInTheDocument();
      expect(errEl).toHaveClass("text-red-600");
    });
  });

  it("displays success message and triggers redirect on successful registration", async () => {
    jest.useFakeTimers();
    (registerAction as jest.Mock).mockResolvedValueOnce({
      ok: true,
      message: "Account created",
    });

    render(<RegisterPage />);
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Account created. Taking you to login...")).toBeInTheDocument();
    });

    jest.advanceTimersByTime(800);
    expect(mockPush).toHaveBeenCalledWith("/login");
    jest.useRealTimers();
  });

  it("disables create account button while form is submitting", async () => {
    let resolveRegister: any;
    const registerPromise = new Promise((res) => {
      resolveRegister = res;
    });
    (registerAction as jest.Mock).mockReturnValueOnce(registerPromise);

    render(<RegisterPage />);
    const submitBtn = screen.getByRole("button", { name: /create account/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText("CREATING...")).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    resolveRegister({ ok: false, message: "Error", fieldErrors: {} });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /create account/i })).not.toBeDisabled();
    });
  });

  it("toggles password and confirm password fields visibility", () => {
    render(<RegisterPage />);
    const passInput = screen.getByPlaceholderText("Min. 8 characters");
    const confirmInput = screen.getByPlaceholderText("Repeat password");

    expect(passInput).toHaveAttribute("type", "password");
    expect(confirmInput).toHaveAttribute("type", "password");

    const showPassBtn = screen.getByRole("button", { name: /^show password$/i });
    fireEvent.click(showPassBtn);
    expect(passInput).toHaveAttribute("type", "text");

    const showConfirmBtn = screen.getByRole("button", { name: /^show confirmed password$/i });
    fireEvent.click(showConfirmBtn);
    expect(confirmInput).toHaveAttribute("type", "text");
  });

  it("shows validation error if terms of service checkbox is left unchecked", async () => {
    (registerAction as jest.Mock).mockResolvedValueOnce({
      ok: false,
      message: "Validation failed",
      fieldErrors: { acceptedTerms: "Terms must be accepted." },
    });

    render(<RegisterPage />);
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText("Terms must be accepted.")).toBeInTheDocument();
    });
  });
});
