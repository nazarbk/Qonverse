import React from "react";

interface RoleModalProps {
    onSelectRole: (role: string, description: string) => void;
    onClose: () => void;
}

const RoleSelectionModal: React.FC<RoleModalProps> = ({ onSelectRole }) => {
    const roles = [
        { name: "Jefe", description: "Simulación de una reunión de trabajo"},
        { name: "Entrevistador", description: "Simulación de una entrevista de trabajo"},
        { name: "Interés Amoroso", description: "Simulación tipo cita romántica"},
        { name: "Cliente Enfadado", description: "Simulación de atención a un cliente complicado"},
        { name: "Vecino Molesto", description: "Simulación de una conversación con un vecino problemático"}
    ]

    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedRole = roles.find(role => role.name === event.target.value)
        if (selectedRole) {
            onSelectRole(selectedRole.name, selectedRole.description)
        }
    }

    return (
        <div className="modal">
            <div className="modal-content">
                <p>Elige un rol para comenzar la conversación.</p>
                <select onChange={handleRoleChange} defaultValue="">
                    <option value="">Selecciona un rol</option>
                    {roles.map((role) => (
                        <option key={role.name} value={role.name}>
                            {role.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
};

export default RoleSelectionModal;

