import { firestore } from "../firebase"
import { collection, doc, setDoc, updateDoc, arrayUnion, getDocs, getDoc, Timestamp, deleteDoc } from "firebase/firestore"

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

// Eliminar una conversación
export async function deleteConversation(userId: string, conversationId: string){
    try{
        const conversationRef = doc(firestore, "conversations", userId, "chats", conversationId)
        await deleteDoc(conversationRef)
        console.log("Conversación eliminada:", conversationId) 
        return true
    }catch(error){
        console.log("Error al eliminar la conversación", error)
        return false
    }
}

export async function checkAndUpdateLimits(userId: string, conversationId?: string){
    const limitsRef = doc(firestore, "conversation_limits", userId)
    const docSnap = await getDoc(limitsRef)
    const today = new Date().toISOString().split("T")[0]

    if (!docSnap.exists()) {
        await setDoc(limitsRef, {
            date: today,
            conversationCount: 0,
            messageCounts: {}
        })
    }

    const limits = docSnap.exists() ? docSnap.data() : {date: today, conversationCount: 0, messageCounts: {}}

    if (limits.date !== today){
        await setDoc(limitsRef, {
            date: today,
            conversationCount: 0,
            messageCounts: {}
        })
        return {canStartConversation: true, canSendMessage: true}
    }
        

    if (limits.conversationCount >= 3 && !conversationId) {
        return {canStartConversation: false, canSendMessage: false}
    }

    if (conversationId) {
        const messageCount = limits.messageCounts[conversationId] || 0
        if (messageCount >= 10){
            return {canStartConversation: true, canSendMessage: false}
        }
    }

    return {canStartConversation: true, canSendMessage: true}
}

// Actualizar contadores de límites
export async function updateLimits(userId: string, conversationId: string, isNewConversation = false){
    const limitsRef = doc(firestore, "conversation_limits", userId)
    const docSnap = await getDoc(limitsRef)

    if(!docSnap.exists()) return

    const limits = docSnap.data()
    if(isNewConversation){
        limits.conversationCount += 1
    }

    if(conversationId) {
        limits.messageCounts[conversationId] = (limits.messageCounts[conversationId] || 0) + 1
    }

    await updateDoc(limitsRef, limits)
}