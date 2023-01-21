import React, { createContext, useState } from "react";

import { Product } from "../model/Product";

export interface IModalContext {
  show: (show?: boolean) => void;
  setupModal: (
    title: string | null,
    porduct: Product,
    canClose: boolean,
  ) => void;
}

const defaultModalContext: IModalContext = {
  show: () => {},
  setupModal: () => {},
};

interface ModalState {
  porduct: Product | null;
  title: string | null;
  canClose?: boolean;
}

const DEFAULT_MODAL_STATE: ModalState = {
  title: null,
  porduct: null,
  canClose: true,
};

export const ModalContext = createContext<IModalContext>(defaultModalContext);

export const ModalContextProvider = ({ children }: React.PropsWithChildren) => {
  const [showModal, setShowModal] = useState(false);
  const [modalProperties, setModalProperites] = useState(DEFAULT_MODAL_STATE);

  const handleShowModal = (show: boolean = true) => {
    setShowModal(show);
  };

  const handleSetupModal = (
    title: string | null,
    porduct: Product,
    canClose: boolean,
  ) => {
    setModalProperites({
      ...DEFAULT_MODAL_STATE,
      title: title,
      canClose: canClose,
      porduct: porduct,
    });
  };

  const handleReset = () => {
    setModalProperites(DEFAULT_MODAL_STATE);
    setShowModal(false);
  };

  return (
    <ModalContext.Provider
      value={{
        show: handleShowModal,
        setupModal: handleSetupModal,
      }}
    >
      <input
        type="checkbox"
        className="modal-toggle hidden"
        checked={showModal}
        onChange={(e) => setShowModal(e.target.checked)}
      />
      <div className="modal">
        <div className="modal-box relative">
          {modalProperties.canClose && (
            <label
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => handleReset()}
            >
              ✕
            </label>
          )}
          {modalProperties.title && (
            <h3 className="text-lg font-bold">{modalProperties.title}</h3>
          )}
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <tbody>
                <tr>
                  <th>Id</th>
                  <td>{modalProperties.porduct?.id}</td>
                </tr>
                <tr>
                  <th>Name</th>
                  <td>{modalProperties.porduct?.name}</td>
                </tr>
                <tr>
                  <th>Pantone value</th>
                  <td>{modalProperties.porduct?.pantone_value}</td>
                </tr>
                <tr>
                  <th>Year</th>
                  <td>{modalProperties.porduct?.year}</td>
                </tr>
                <tr>
                  <th>Color</th>
                  <td>{modalProperties.porduct?.color}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {children}
    </ModalContext.Provider>
  );
};
