import React from "react";
import LoaderSVG from "./Loader.svg";
import Image from "next/image";

export default function LoadingSpinner() {
  return <Image src={LoaderSVG} className="spinner" alt="Loading..." />;
}
