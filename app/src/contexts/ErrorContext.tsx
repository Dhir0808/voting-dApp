import React, { createContext, useContext, useState, ReactNode } from "react";

interface ErrorContextType {
  errors: string[];
  addError: (error: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
}

interface Props {
  children: ReactNode;
}

export const ErrorProvider: React.FC<Props> = ({ children }) => {
  const [errors, setErrors] = useState<string[]>([]);

  const addError = (error: string) => {
    setErrors((prev) => [...prev, error]);
    // Automatically clear error after 5 seconds
    setTimeout(() => {
      setErrors((prev) => prev.filter((e) => e !== error));
    }, 5000);
  };

  const clearErrors = () => {
    setErrors([]);
  };

  return (
    <ErrorContext.Provider value={{ errors, addError, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const { errors } = useError();

  if (errors.length === 0) return <>{children}</>;

  return (
    <div>
      {children}
      <div className="fixed bottom-4 right-4 z-50">
        {errors.map((error, index) => (
          <div
            key={index}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg mb-2 animate-fade-in"
          >
            {error}
          </div>
        ))}
      </div>
    </div>
  );
};
