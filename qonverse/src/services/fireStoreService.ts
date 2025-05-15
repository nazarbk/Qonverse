import { firestore } from "../firebase"
import { collection, doc, setDoc, updateDoc, arrayUnion, getDocs, Timestamp } from "firebase/firestore"

// Inicializar una nueva conversación
export async function initializeConversation(userId: string, role: string, behavior: string) {
    const conversationRef = doc(collection(firestore, "conversations", userId, "chats"))
    await setDoc(conversationRef, {
        role: role,
        behavior: behavior,
        messages: []
    })

    return conversationRef.id
}

// Enviar un mensaje a la conversación
export async function sendMessage(userId: string, conversationId: string, user: string, ai: string) {
    const conversationRef = doc(firestore, "conversations", userId, "chats", conversationId)
    const timestamp = Timestamp.now()
    await updateDoc(conversationRef, {
        messages: arrayUnion({
            user, 
            ai, 
            timestamp
        })
    })
    console.log("Mensaje enviado: ", user)
}

// Cargar la conversación completa
export async function loadConversation(userId: string) {
    const conversationRef = collection(firestore, "conversations", userId, "chats")
    const docSnap = await getDocs(conversationRef)
    
    const conversations = docSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
    }))

    console.log("Todas las conversaciones: ", conversations)
    return conversations
}