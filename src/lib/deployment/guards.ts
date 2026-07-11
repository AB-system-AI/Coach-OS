import {
  checkDatabaseConnection,
  isDatabaseConfigured,
} from "@/lib/db";
import type { ServiceKind } from "./errors";
import {
  getAuthenticationServiceStatus,
  getDatabaseServiceStatus,
  isMaintenanceModeEnabled,
} from "./service-status";

export type ServiceUnavailableProps = {
  service: ServiceKind;
  title: string;
  description: string;
  showHomeLink?: boolean;
};

export function getMaintenanceScreenProps(): ServiceUnavailableProps {
  return {
    service: "maintenance",
    title: "Scheduled maintenance",
    description:
      "CoachOS is undergoing maintenance. Public pages remain available; account features will return shortly.",
    showHomeLink: true,
  };
}

export async function getDatabaseUnavailableProps(): Promise<ServiceUnavailableProps | null> {
  const status = getDatabaseServiceStatus();
  if (!status.configured) {
    return {
      service: "database",
      title: "Database temporarily unavailable",
      description:
        "We cannot reach our database right now. Please try again in a few minutes. Our team has been notified.",
      showHomeLink: true,
    };
  }

  if (!isDatabaseConfigured()) {
    return {
      service: "database",
      title: "Database temporarily unavailable",
      description:
        "Account data services are not available. Please try again later.",
      showHomeLink: true,
    };
  }

  const connected = await checkDatabaseConnection();
  if (!connected) {
    return {
      service: "database",
      title: "Database temporarily unavailable",
      description:
        "We are having trouble connecting to our database. Please try again shortly.",
      showHomeLink: true,
    };
  }

  return null;
}

export function getAuthenticationUnavailableProps(): ServiceUnavailableProps | null {
  const status = getAuthenticationServiceStatus();
  if (status.configured) return null;

  return {
    service: "authentication",
    title: "Sign-in temporarily unavailable",
    description:
      "Authentication services are being configured. Please try again later or contact support if this persists.",
    showHomeLink: true,
  };
}

export async function getProtectedRouteUnavailableProps(): Promise<ServiceUnavailableProps | null> {
  if (isMaintenanceModeEnabled()) {
    return getMaintenanceScreenProps();
  }

  const authUnavailable = getAuthenticationUnavailableProps();
  if (authUnavailable) return authUnavailable;

  return getDatabaseUnavailableProps();
}

export function getPaymentUnavailableProps(): ServiceUnavailableProps {
  return {
    service: "payments",
    title: "Payments temporarily unavailable",
    description:
      "Our payment provider is not configured or is experiencing issues. Subscriptions and checkout are paused until this is resolved.",
    showHomeLink: true,
  };
}
