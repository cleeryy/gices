import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      service?: {
        id: number;
        name: string;
        code: string;
      };
      serviceId: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    firstName: string;
    lastName: string;
    service?: {
      id: number;
      name: string;
      code: string;
    };
    serviceId: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    service?: {
      id: number;
      name: string;
      code: string;
    };
    serviceId: number;
  }
}
