import React, { useState } from "react";
import ProductsTable from "../components/ProductsTable";
import { ModalContextProvider } from "../context/ModalContext";

type Props = {};

export const MainPage = (props: Props) => {
  return (
    <div className="max-w-3xl mx-auto p-3 min-h-screen flex flex-col items-center justify-center">
      <ModalContextProvider>
        <ProductsTable className="w-full"/>
      </ModalContextProvider>
    </div>
  );
};
