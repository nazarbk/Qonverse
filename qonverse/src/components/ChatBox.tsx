// src/components/ChatBox.tsx
import React, { useState } from 'react';
import { LuCircleFadingPlus } from "react-icons/lu";
import { IoSend } from "react-icons/io5";
//import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';


const ChatBox = () => {
    const [selectedRole, setSelectedRole] = useState("")
    const [context, setContext] = useState("")
    const [selectedBehavior, setSelectedBehavior] = useState("")
    const [messages, setMessages] = useState([])
    const [roleLocked, setRoleLocked] = useState(false)
    const [behaviorLocked, setBehaviorLocked] = useState(false)
    const [placeHolderResponse, setPlaceHolderResponse] = useState(false)
    let airesponse = ""


    const handleRoleChange = (event) => {
        if(!roleLocked){
            setSelectedRole(event.target.value)
        }
    }

    const handleContextChange = (event) => {
        setContext(event.target.value)
    }

    const handleBehaviorClick = (behavior) => {
        if(!behaviorLocked){
            setSelectedBehavior(behavior)
        }
    }

    const handleSendMessage = async () => {
        const apiKeyGem = import.meta.env.VITE_HUGGINGFACE_API_TOKEN

        const ai = new GoogleGenAI({apiKey: apiKeyGem})

        async function main(context) {
            let prompt = ""
            try {
                if (roleLocked == false){
                    prompt =`Eres un ${selectedRole}, y tu tarea es actuar de manera ${selectedBehavior}.
                    La situación es la siguiente: ${context}.
                    
                    Quiero que te comportes a lo largo de toda esta conversación acorde a tu rol y mantengas el rono de acuerdo al comportamiento definido.
                    Responde de manera coherente y sigue el flujo de la conversación teniendo en cuenta el contexto proporcionado.
                    
                    Si hay algún dato que no sepas sobre ti o sobre tu contexto inventatelo.
                    No te salgas del rol en nigún momento, es decir si te hago una pregunta que no esté relacionada con el contexto de la conversación adviérteme.
                    
                    Comienza saludando y preguntando lo necesario para cumplir con tu rol de manera efectiva.
                    
                    Que quede claro que quiero que actues como tu rol. Yo seré el que tenga la conversación contigo intentando solucionar o lidiar con la situación del contexto.`
                }
                else{
                    prompt = context
                }
                console.log("PROMPT: ", prompt)
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: prompt,
                });

                airesponse = response?.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo obtener respuesta de Gemini"
                console.log("AIRESPONSE", airesponse)
            } catch (error) {
                console.error("Error al llamar a Gemini:", error);
            }

            return airesponse
        }

        if(selectedBehavior != "" && selectedRole != ""){
            if (context.trim()) {
                const userMessage = {sender: "Tú", text: context}
                const airesponse = await main(context)
                const simulatedResponse = {sender: selectedRole + " (" + selectedBehavior + ")", text: airesponse}

                setMessages([...messages, userMessage, simulatedResponse])
                setContext("")
                setRoleLocked(true)
                setBehaviorLocked(true)
                setPlaceHolderResponse(true)
            }
        }else{
               alert("Debes seleccionar un rol y un comportamiento")
        }
        
    }

    return (

        <div className='chat-box'>
            <div className='message-display'>
                {messages.map((message, index) => (
                    <div key={index}>
                        <strong>{message.sender}:</strong> {message.text}
                    </div>
                ))}
            </div>
            <div className='chat-area' style={{marginTop: "10px", border: "1px solid white", borderRadius: "20px", padding:"15px"}}>
                <div className='select-role'>
                    <select id='role-select' value={selectedRole} onChange={handleRoleChange} disabled={roleLocked} style={{padding: "5px", border: "0px solid", backgroundColor: "#242424"}}>
                        <option value="">Selecciona un Rol</option>
                        <option value="Jefe">Jefe</option>
                        <option value="Entrevistador">Entrevistador</option>
                        <option value="Cliente Enfadado">Cliete Enfadado</option>
                        <option value="Interés Amoroso">Interés Amoroso</option>
                        <option value="Vecino Molesto">Vecino Molesto</option>
                    </select>
                </div>

                <div className='text-area' style={{marginTop: "10px", boxSizing: "border-box", overflow: "hidden"}}>
                    <textarea placeholder={placeHolderResponse ? 'Escribe aquí' : 'Indica el contexto de la conversación...'} value={context} onChange={handleContextChange} rows="3" style={{width: "100%", resize: "none", fontSize: "15px", backgroundColor: "transparent", border: "none"}}></textarea>
                </div>

                <div className='option-area' style={{marginTop: "10px", display: "flex", alignItems: "center"}}>
                    <div className='behavior-buttons'>
                        <button onClick={() => handleBehaviorClick("Directo")} disabled={behaviorLocked} 
                        style={{
                            backgroundColor: selectedBehavior === "Directo" ? "#007bff2e" : "#1a1a1a5c", 
                            color: selectedBehavior === "Directo" ? "#007BFF" : "white",
                            borderRadius: "40px",
                            marginRight: "15px"
                        }}>Directo</button>

                        <button onClick={() => handleBehaviorClick("Amigable")} disabled={behaviorLocked} 
                        style={{
                            backgroundColor: selectedBehavior === "Amigable" ? "#007bff2e" : "#1a1a1a5c", 
                            color: selectedBehavior === "Amigable" ? "#007BFF" : "white",
                            borderRadius: "40px",
                            marginRight: "15px"
                        }}>Amigable</button>

                        <button onClick={() => handleBehaviorClick("Diplomático")} disabled={behaviorLocked} 
                        style={{
                            backgroundColor: selectedBehavior === "Diplomático" ? "#007bff2e" : "#1a1a1a5c",  
                            color: selectedBehavior === "Diplomático" ? "#007BFF" : "white",
                            borderRadius: "40px",
                            marginRight: "30px"
                        }}>Diplomático</button>
                    </div>

                    <div className='action-buttons'>
                        <button className='new-chat-button' style={{marginRight: "15px"}}><LuCircleFadingPlus /></button>
                        <button className='send-button' disabled={context ? false : true} onClick={handleSendMessage}><IoSend /></button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatBox;
