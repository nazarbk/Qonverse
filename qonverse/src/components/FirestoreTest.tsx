/*import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { initializeConversation, sendMessage, loadConversation } from "../services/fireStoreService";

const FirestoreTest = () => {
    const {user} = useUser()
    const [conversationId, setConversationId] = useState<string | null>(null)

    // Inicializar una nueva conversación
    const startNewConversation = async (userId: string) => {
        const id = await initializeConversation(userId, "candidato", "formal")
        setConversationId(id)
        console.log("Conversacuón iniciada con ID: ", id)
    }

    return (
        <div>
            <h2>Prueba de Conexión a Firestore</h2>
            <button onClick={() => user && startNewConversation(user.primaryEmailAddress?.emailAddress as string)}>
                Comenzar Conversación
            </button>
            <button onClick={() => user && sendMessage(user.primaryEmailAddress?.emailAddress as string, conversationId, "usuario", "Hola, ¿Cómo estás panoli?")}>
                Enviar Mensaje
            </button>
            <button onClick={() => user && loadConversation(user.primaryEmailAddress?.emailAddress as string, conversationId)}>
                Ver conversación
            </button>
        </div>
    );
};

export default FirestoreTest;*/