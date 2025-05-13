// src/components/ChatBox.tsx
import React, { useState } from 'react';
import { LuCircleFadingPlus } from "react-icons/lu";
import { IoSend } from "react-icons/io5";


const ChatBox = () => {
    const [selectedRole, setSelectedRole] = useState("")
    const [context, setContext] = useState("")
    const [selectedBehavior, setSelectedBehavior] = useState("")

    const handleRoleChange = (event) => {
        setSelectedRole(event.target.value)
    }

    const handleContextChange = (event) => {
        setContext(event.target.value)
    }

    const handleBehaviorClick = (behavior) => {
        setSelectedBehavior(behavior)
    }

    return (
        <div className='chat-box'>
            <div className='select-role'>
                <select id='role-select' value={selectedRole} onChange={handleRoleChange} style={{padding: "5px", border: "0px solid", backgroundColor: "#242424"}}>
                    <option value="">Selecciona un Rol</option>
                    <option value="Jefe">Jefe</option>
                    <option value="Entrevistador">Entrevistador</option>
                    <option value="Cliente Enfadado">Cliete Enfadado</option>
                    <option value="Interés Amoroso">Interés Amoroso</option>
                    <option value="Vecino Molesto">Vecino Molesto</option>
                </select>
            </div>

            <div className='text-area' style={{marginTop: "10px"}}>
                <textarea placeholder='Indica el contexto de la conversación...' value={context} onChange={handleContextChange} rows="3" style={{width: "100%", resize: "none", fontSize: "15px"}}></textarea>
            </div>

            <div className='option-area' style={{marginTop: "10px", display: "flex", alignItems: "center"}}>
                <div className='behavior-buttons'>
                    <button onClick={() => handleBehaviorClick("Directo")} 
                    style={{
                        backgroundColor: selectedBehavior === "Directo" ? "#007bff2e" : "#1a1a1a5c", 
                        color: selectedBehavior === "Directo" ? "#007BFF" : "white",
                        borderRadius: "40px",
                        marginRight: "15px"
                    }}>Directo</button>

                    <button onClick={() => handleBehaviorClick("Amigable")} 
                    style={{
                        backgroundColor: selectedBehavior === "Amigable" ? "#007bff2e" : "#1a1a1a5c", 
                        color: selectedBehavior === "Amigable" ? "#007BFF" : "white",
                        borderRadius: "40px",
                        marginRight: "15px"
                    }}>Amigable</button>

                    <button onClick={() => handleBehaviorClick("Diplomático")} 
                    style={{
                        backgroundColor: selectedBehavior === "Diplomático" ? "#007bff2e" : "#1a1a1a5c",  
                        color: selectedBehavior === "Diplomático" ? "#007BFF" : "white",
                        borderRadius: "40px",
                        marginRight: "30px"
                    }}>Diplomático</button>
                </div>

                <div className='action-buttons'>
                    <button className='new-chat-button' style={{marginRight: "15px"}}><LuCircleFadingPlus /></button>
                    <button className='send-button'><IoSend /></button>
                </div>
            </div>
        </div>
    )
}

export default ChatBox;
