import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import AuthLayout from "./AuthLayout";
import { PageSpinner } from "../../components/ui/Primitives";
import authService from "../../services/authService";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    authService
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.message || "This verification link is invalid or has expired.");
      });
  }, [token]);

  if (status === "loading") return <PageSpinner />;

  return (
    <AuthLayout title="Email verification">
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        {status === "success" ? (
          <>
            <FiCheckCircle size={40} className="text-success" />
            <p className="text-sm text-[var(--ink-muted)]">Your email has been verified. You're all set!</p>
          </>
        ) : (
          <>
            <FiXCircle size={40} className="text-danger" />
            <p className="text-sm text-[var(--ink-muted)]">{message}</p>
          </>
        )}
        <Link to="/dashboard" className="text-sm font-semibold text-volt-500 hover:underline">
          Go to dashboard
        </Link>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailPage;
