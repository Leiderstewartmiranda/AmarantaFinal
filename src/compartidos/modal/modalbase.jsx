import React from "react";
import { Icon } from "@iconify/react";
import "./ModalBase.css";

const ModalBase = ({ show, title, icon, onClose, children, footerButtons }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">
            {icon && <Icon icon={icon} className="text-[var(--naranjado)] w-6 h-6" />}
            {title}
          </h3>
          <button className="modal-close" onClick={onClose} title="Cerrar">
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">{children}</div>

        {/* Footer */}
        {footerButtons && <div className="modal-footer">{footerButtons}</div>}
      </div>
    </div>
  );
};

export default ModalBase;
