import { useState } from "react";
import ProductsTable from "./components/ProductsTable";
import { ModalContext, ModalContextProvider } from "./context/ModalContext";

function App() {
  return (
    <div>
      <ModalContextProvider>
        <ProductsTable />
      </ModalContextProvider>
    </div>
  );
}

export default App;
