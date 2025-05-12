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
    ]
};