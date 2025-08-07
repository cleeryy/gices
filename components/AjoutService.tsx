import { ServiceDestination } from "@/utils/types/api";
import React from "react";

type AjoutServiceProps = {
  children?: React.ReactNode;
  services?: ServiceDestination[];
};

function AjoutService({ children, services }: AjoutServiceProps) {
  return <div>AjoutService</div>;
}

export default AjoutService;
