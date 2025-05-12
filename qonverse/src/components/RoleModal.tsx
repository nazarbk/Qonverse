import React from "react";

interface RoleModalProps {
    onSelectRole: (role: string) => void;
    onClose: () => void;
}

const RoleSelectionModal: React.FC<RoleModalProps> = ({ onSelectRole, onClose }) => {
    const roles = [
        { name: "Jefe", description: "Simulación de una reunión de trabajo"},
        { name: "Entrevistador", description: "Simulación de una entrevista de trabajo"},
        { name: "Interés Amoroso", description: "Simulación tipo cita romántica"},
        { name: "Cliente Enfadado", description: "Simulación de atención a un cliente complicado"},
        { name: "Vecino Molesto", description: "Simulación de una conversación con un vecino problemático"}
    ]

    return (
        <div className="modal">
            <div className="modal-content">
                <p>Elige un rol para comenzar la conversación.</p>
                <ul>
                    {roles.map((role) => (
                        <li key={role.name}>
                            <button onClick={() => onSelectRole(role.name)}>{role.name}</button>
                            <p>{role.description}</p>
                        </li>
                    ))}
                </ul>
                <button className="close-button" onClick={onClose}>Cerrar</button>
            </div>
        </div>
    )
};

export default RoleSelectionModal;

