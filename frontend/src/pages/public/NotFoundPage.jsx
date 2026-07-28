import { Link } from "react-router-dom";
import Button from "../../components/ui/Button";

const NotFoundPage = () => (
  <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
    <p className="font-display text-8xl font-bold text-gradient-forge">404</p>
    <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
    <p className="mt-2 max-w-sm text-[var(--ink-muted)]">
      The page you're looking for doesn't exist or may have been moved.
    </p>
    <Link to="/" className="mt-6">
      <Button>Back to home</Button>
    </Link>
  </div>
);

export default NotFoundPage;
