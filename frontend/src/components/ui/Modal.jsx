import { AnimatePresence, motion } from "framer-motion";
import { FiX } from "react-icons/fi";
import Button from "./Button";

export const Modal = ({ isOpen, onClose, title, children, className = "" }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`glass-panel relative w-full max-w-lg rounded-2xl bg-[var(--surface)] p-6 shadow-2xl ${className}`}
          >
            <div className="mb-4 flex items-center justify-between">
              {title && <h3 className="text-lg font-semibold font-display">{title}</h3>}
              <button
                onClick={onClose}
                className="ml-auto rounded-lg p-1.5 text-[var(--ink-muted)] transition hover:bg-[var(--border)]/60 hover:text-[var(--ink)]"
                aria-label="Close"
              >
                <FiX size={18} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      </>
    )}
  </AnimatePresence>
);

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  variant = "danger",
  isLoading = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title}>
    {description && <p className="mb-6 text-sm text-[var(--ink-muted)]">{description}</p>}
    <div className="flex justify-end gap-3">
      <Button variant="ghost" onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
);
