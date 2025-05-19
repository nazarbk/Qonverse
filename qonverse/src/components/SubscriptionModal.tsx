import React, { useState } from 'react';
import { PricingTable } from "@clerk/clerk-react";
import './styles/SubscriptionModal.css';

const SubscriptionModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="open-modal-button"
      >
        Planes de suscripción
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setIsOpen(false)}
              className="close-button"
              aria-label="Cerrar modal"
            >
              &times;
            </button>
            <PricingTable />
          </div>
        </div>
      )}
    </>
  );
};

export default SubscriptionModal;
