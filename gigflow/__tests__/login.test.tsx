import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "../app/(auth)/login/page";
import { loginAction } from "../app/actions/authActions";
import { useAuth } from "../app/providers/AuthContext";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("../app/actions/authActions", () => ({
  loginAction: jest.fn(),
}));

jest.mock("../app/providers/AuthContext", () => ({
  useAuth: jest.fn(),
}));

describe("LoginPage Component Tests", () => {
  const mockSetSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      setSession: mockSetSession,
    });
  });

  it("renders email, password inputs, remember me checkbox, and submit button", () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText("you@domain.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Your password")).toBeInTheDocument();
    expect(screen.getByLabelText("REMEMBER ME")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
  });

  it("shows validation error messages on empty form submission", async () => {
    (loginAction as jest.Mock).mockResolvedValueOnce({
      ok: false,
      message: "Please fix validation errors.",
      fieldErrors: {
        email: "Email is required.",
        password: "Password is required.",
      },
    });

    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText("Email is required.")).toBeInTheDocument();
      expect(screen.getByText("Password is required.")).toBeInTheDocument();
    });
  });

  it("shows validation error on malformed email address", async () => {
    (loginAction as jest.Mock).mockResolvedValueOnce({
      ok: false,
      message: "Invalid email format.",
      fieldErrors: {
        email: "Invalid email address.",
      },
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("you@domain.com"), {
      target: { value: "notanemail" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email address.")).toBeInTheDocument();
    });
  });

  it("calls loginAction with form values on submit", async () => {
    (loginAction as jest.Mock).mockResolvedValueOnce({
      ok: false,
      message: "Invalid credentials.",
      fieldErrors: {},
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("you@domain.com"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your password"), {
      target: { value: "Secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(loginAction).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "Secret123",
        remember: true,
      });
    });
  });

  it("renders error message in red text (text-red-600) when loginAction returns ok: false", async () => {
    (loginAction as jest.Mock).mockResolvedValueOnce({
      ok: false,
      message: "Invalid email or password",
      fieldErrors: {},
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("you@domain.com"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your password"), {
      target: { value: "WrongPass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      const msg = screen.getByText("Invalid email or password");
      expect(msg).toBeInTheDocument();
      expect(msg).toHaveClass("text-red-600");
    });
  });

  it("renders success message in green text (text-emerald-700) when loginAction returns ok: true", async () => {
    (loginAction as jest.Mock).mockResolvedValueOnce({
      ok: true,
      message: "Login successful",
      data: {
        token: "fake-jwt-token",
        user: { id: "123", email: "user@example.com", role: "client" },
      },
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("you@domain.com"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your password"), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      const msg = screen.getByText("Login successful. Opening your dashboard...");
      expect(msg).toBeInTheDocument();
      expect(msg).toHaveClass("text-emerald-700");
    });
  });

  it("disables submit button while isSubmitting is true", async () => {
    let resolveLogin: any;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    (loginAction as jest.Mock).mockReturnValueOnce(loginPromise);

    render(<LoginPage />);
    const submitBtn = screen.getByRole("button", { name: /log in/i });

    fireEvent.click(submitBtn);

    expect(screen.getByText("LOGGING IN...")).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();

    resolveLogin({
      ok: false,
      message: "Failed",
      fieldErrors: {},
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /log in/i })).not.toBeDisabled();
    });
  });

  it("calls setSession on successful login", async () => {
    const userObj = { id: "user123", email: "client@example.com", role: "client" };
    (loginAction as jest.Mock).mockResolvedValueOnce({
      ok: true,
      data: {
        token: "valid-jwt",
        user: userObj,
      },
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("you@domain.com"), {
      target: { value: "client@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Your password"), {
      target: { value: "Password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockSetSession).toHaveBeenCalledWith("valid-jwt", userObj, true);
    });
  });

  it("toggles password visibility when eye icon button is clicked", () => {
    render(<LoginPage />);
    const passInput = screen.getByPlaceholderText("Your password");
    expect(passInput).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: /show password/i });
    fireEvent.click(toggleBtn);
    expect(passInput).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: /hide password/i }));
    expect(passInput).toHaveAttribute("type", "password");
  });
});
