import React, { useState } from 'react';
import { PricingTable } from "@clerk/clerk-react";
import './styles/SubscriptionModal.css';
import { RiBillLine } from "react-icons/ri";

const SubscriptionModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      
        <div className='modal-sub'>
          <button
            onClick={() => setIsOpen(true)}
            className="open-modal-button"
          >
            <div className='plans-subs'>
              <RiBillLine />Planes de suscripción
            </div>
          </button>
        </div>
        

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
