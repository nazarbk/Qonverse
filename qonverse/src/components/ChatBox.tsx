import { useEffect, useState, useRef, useReducer } from 'react';
import { RiChatAiLine } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
//import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import './styles/ChatBox.css';
import { PricingTable, useUser } from "@clerk/clerk-react";
import { initializeConversation, sendMessage, loadConversation, deleteConversation, checkAndUpdateLimits, updateLimits } from "../services/fireStoreService";
import logo from '../assets/qonverse-v2.svg';
import {  UserButton } from '@clerk/clerk-react';
import SubscriptionModal from './SubscriptionModal';

const ChatBox = () => {
    type Message = {
        sender: string;
        text: string;
    };
    type Conversation = {
        id: string;
        behavior?: string;
        role?: string;
    };
    const [selectedRole, setSelectedRole] = useState("")
    const [context, setContext] = useState("")
    const [selectedBehavior, setSelectedBehavior] = useState("")
    const [messages, setMessages] = useState<Message[]>([]);
    const [roleLocked, setRoleLocked] = useState(false)
    const [behaviorLocked, setBehaviorLocked] = useState(false)
    const [placeHolderResponse, setPlaceHolderResponse] = useState(false)
    let airesponse = ""
    const [conversationId, setConversationId] = useState<string | "">("")
    const {user} = useUser()
    const [hasPremiumAccess, setHasPremiumAccess] = useState(false)
    const [chats, setChats] = useState<any[]>([])
    const [initialContext, setInitialContext] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if(user){
            handleLoadConversations()

            const hasAccess = user.publicMetadata?.plan === "premium_plan"
            setHasPremiumAccess(hasAccess)
        }
    }, [user])

    useEffect(() => {
        scrollRef.current?.scrollIntoView({behavior: "smooth"})
    }, [messages])


    const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        if(!roleLocked){
            setSelectedRole(event.target.value)
        }
    }

    const handleContextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContext(event.target.value)
    }

    const handleBehaviorClick = (behavior: string) => {
        if(!behaviorLocked){
            setSelectedBehavior(behavior)
        }
    }

    const startNewConversation = async (userId: string, role: string, behavior: string, airesponse: string) => {
        const id = await initializeConversation(userId, role, behavior)
        await sendMessage(user?.primaryEmailAddress?.emailAddress as string, id, context, airesponse)
        await setConversationId(id)
        console.log("Conversación iniciada con ID: ", id)
        await handleLoadConversations()
    }

    const handleSendMessage = async () => {
        const userId = user?.primaryEmailAddress?.emailAddress;

        if (!userId) {
            console.log("No se encontró el email del usuario, no se puede enviar el mensaje.");
            return;
        }

        const { canStartConversation, canSendMessage } = await checkAndUpdateLimits(userId, conversationId)

        if(!canStartConversation){
            alert("Has alcanzado el límite de 3 conversaciones por día. Adquiere el plan premium para continuar.")
            return
        }

        if(!canSendMessage){
            alert("Has alcanzado el límite de mensajes en esta conversación. Adquiere el plan premium para continuar")
            return
        }

        const userMessage = {sender: "Tú", text: context}
        setMessages((prevMessages) => [...prevMessages, userMessage]) // Mostrar el mensaje del usuario de inmediato
        setContext("") // Limpiar el campo de texto inmediatamente

        const apiKeyGem = import.meta.env.VITE_HUGGINGFACE_API_TOKEN
        const ai = new GoogleGenAI({apiKey: apiKeyGem})

        async function main(context: any) {
            try {
                let prompt = ""
                const recentMessages = messages.slice(-3).map((msg) => `${msg.sender}: ${msg.text}`).join("\n\n"); 
                console.log("CONVER_IDDDD:", conversationId)
                
                if (roleLocked == false){
                    prompt = `
                        Eres un ${selectedRole}, y tu tarea es actuar de manera ${selectedBehavior}.
                        La situación es la siguiente: ${context}.
                        
                        Quiero que te comportes a lo largo de toda esta conversación acorde a tu rol y mantengas el tono de acuerdo al comportamiento definido.
                        Responde de manera coherente y sigue el flujo de la conversación teniendo en cuenta el contexto proporcionado.
                        
                        Si hay algún dato que no sepas sobre ti o sobre tu contexto inventatelo (como nombre, empresa, lugar, edad, etc..).
                        No te salgas del rol en nigún momento, es decir si te hago una pregunta que no esté relacionada con el contexto de la conversación adviérteme.
                        
                        Comienza saludando y preguntando lo necesario para cumplir con tu rol de manera efectiva.
                        
                        Que quede claro que quiero que actues como tu rol. Yo seré el que tenga la conversación contigo intentando solucionar o lidiar con la situación del contexto.
                    `

                    setInitialContext(prompt)
                }else{
                    prompt = `
                        Contexto Inicial:
                        Eres un ${selectedRole}, y tu tarea es actuar de manera ${selectedBehavior}.
                        La situación es la siguiente: ${initialContext}.
                        
                        Quiero que te comportes a lo largo de toda esta conversación acorde a tu rol y mantengas el tono de acuerdo al comportamiento definido.
                        Responde de manera coherente y sigue el flujo de la conversación teniendo en cuenta el contexto proporcionado.
                        
                        Si hay algún dato que no sepas sobre ti o sobre tu contexto inventatelo (como nombre, empresa, lugar, edad, etc..).
                        No te salgas del rol en nigún momento, es decir si te hago una pregunta que no esté relacionada con el contexto de la conversación adviérteme.
                        
                        Comienza saludando y preguntando lo necesario para cumplir con tu rol de manera efectiva.
                        
                        Que quede claro que quiero que actues como tu rol. Yo seré el que tenga la conversación contigo intentando solucionar o lidiar con la situación del contexto.

                        Hilo de la conversación:
                        ${recentMessages}

                        Respuesta: ${context}
                    `
                }

                //console.log("PROMPT: ", prompt)
                const response = await ai.models.generateContent({
                    model: "gemini-2.0-flash",
                    contents: prompt,
                });

                airesponse = response?.candidates?.[0]?.content?.parts?.[0]?.text || "No se pudo obtener respuesta de Gemini"
                //console.log("AIRESPONSE", airesponse)
            } catch (error) {
                console.error("Error al llamar a Gemini:", error);
            }

            return airesponse
        }

        if(selectedBehavior != "" && selectedRole != ""){
            if (context.trim()) {
                const airesponse = await main(context)
                const simulatedResponse = {sender: selectedRole + " (" + selectedBehavior + ")", text: airesponse}
                if (roleLocked == false){
                    await startNewConversation(user?.primaryEmailAddress?.emailAddress as string, selectedRole, selectedBehavior, airesponse)
                    await updateLimits(userId, conversationId, true)
                }
                else{
                    await sendMessage(user?.primaryEmailAddress?.emailAddress as string, conversationId, context, airesponse)
                    await handleLoadConversations()
                    await updateLimits(userId, conversationId, false)
                }
                setMessages((prevMessages) => [...prevMessages, simulatedResponse])
                setRoleLocked(true)
                setBehaviorLocked(true)
                setPlaceHolderResponse(true)
                
            }
        }else{
            alert("Debes seleccionar un rol y un comportamiento")
        }
        
    }

    const handleLoadConversations = async () => {
        if (user){
            setChats(await loadConversation(user?.primaryEmailAddress?.emailAddress as string));
        }
    }

    const handleLoadChat = async (chatId: string) => {
        const convers: Conversation[]  =  await loadConversation(user?.primaryEmailAddress?.emailAddress as string);
        const selectedConver = convers.find(chat => chat.id === chatId)
        const selectedConverId = selectedConver?.id
        
        setConversationId(selectedConverId);
        setInitialContext(selectedConver.messages[0].user)
        
        if (selectedConver){
            const behavior = selectedConver.behavior;
            const rol = selectedConver.role
            setSelectedRole(rol)
            setSelectedBehavior(behavior)
            setBehaviorLocked(true)
            setRoleLocked(true)

            const loadedMessages: Message[] = [];

            selectedConver?.messages.forEach((msg) => {
                const userMessage = {sender: "Tú", text: msg.user}
                const simulatedResponse = {sender: rol + " (" + behavior + ")", text: msg.ai}

                loadedMessages.push(userMessage)
                loadedMessages.push(simulatedResponse)

                //console.log("Mensaje de la IA: ", msg.ai)
                //console.log("Mensaje del Usuario: ", msg.user)
            })

            setMessages(loadedMessages)
            //console.log("Mensajes cargados: ", loadedMessages)
            console.log("Conversación Encontrada: ", selectedConver)
        }
    }

    const handleDeleteChat = async (chatId: string) => {
        const confirmation = confirm("Estas seguro de que deseas eliminar esta conversación")
        if (! confirmation) {
            return;
        }

        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) {
            console.log("No se encontró el email del usuario, no se puede eliminar la conversación.");
            return;
        }

        const success = await deleteConversation(email, chatId);

        if (success) {
            await handleLoadConversations();
            setMessages([]);
        }else{
            console.log("No se pudo eliminar el chat");
        }
    }

    const startNewChat = () => {
        setMessages([])
        setBehaviorLocked(false)
        setRoleLocked(false)
        setSelectedRole("")
        setSelectedBehavior("")
        setPlaceHolderResponse(false)
        setContext("")
        setConversationId("")
    }

    const [menuVisible, setMenuVisible] = useState(true);
    const toggleMenu = () => {
        setMenuVisible(prev => !prev);
    };
    const behaviors = ["Directo","Amigable","Diplomático"];
    const behaviorsPremium = ["Directo","Críptico","Amigable","Seco","Diplomático","Maleducado"];
    const buttonStyle = (behavior:string) => ({
        backgroundColor: selectedBehavior === behavior ? "#007bff1a" : "#1a1a1a5c",
        color: selectedBehavior === behavior ? "#007BFF" : "white",
        borderRadius: "40px",
        marginRight: "10px"
    });

    return (
        <div className={`chat-box ${menuVisible ? '' : 'chat-box-collapsed'}`}>
            <div className={`vertical-menu ${menuVisible ? '' : 'menu-collapsed'}`}>
                <div className={`expander ${menuVisible ? '' : 'menu-collapsed'}`}>
                    <button id="toggle-menu-btn" onClick={toggleMenu}>☰</button>
                </div>
                <div className='left-bar-menu'>
                    <div className='left-bar-menu-up'>
                        <div className='new-chat'>
                            <button onClick={startNewChat}>
                                <div><RiChatAiLine /> Nueva Conversación</div>
                            </button>
                        </div>
                        <div className='chats-history'>
                            <p>Historial de conversaciones</p>
                            <div className='chats-section'>
                                {chats.length > 0 ? (
                                    chats.map((chat) => (
                                        <div key={chat.id} className={`history_chats ${conversationId === chat.id ? 'selected_chat' : ''}`}>
                                            <button className='button_history_chats' onClick={() => handleLoadChat(chat.id)} title={chat.messages.length > 0 ? chat.messages[0].user : "Sin mensajes"}>
                                                {chat.messages.length > 0 ? chat.messages[0].user : "Sin mensajes"}
                                            </button>
                                            <button className='button_settings_chat' onClick={() => handleDeleteChat(chat.id)}>
                                                <RiDeleteBinLine />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <p>No hay conversaciones cargadas</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className='left-bar-menu-down'>
                        {/*<button className="planes-suscripcion">Planes de suscripción</button>
                        <PricingTable />*/}
                        <SubscriptionModal />
                    </div>
                </div>
            </div>
            <div className='main-content'>
                <div className='header-chat'>
                    <img
                        className="main-logo"
                        src={logo}
                        alt="Qonverse Logo"
                    />
                    <UserButton />
                </div>
                <div className='qonversastion-section'>
                    {roleLocked ? "" : <h2>¿De qué quieres conversar hoy?</h2>}
                    <div className='message-display'>
                        {messages.map((message, index) => (
                            <div className='message-line'>
                                <div key={index} className={index % 2 === 0 ? 'user-message' : 'ai-message'}>
                                    <div className='message-pack-1'>
                                        <div className='message-pack-2'>
                                            <p>{message.text}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={scrollRef}></div>
                    </div>
                    <div className='chat-area'>
                        <div className='select-role'>
                            
                        </div>

                        <div className='text-area'>
                            <textarea className='place-holder' placeholder={placeHolderResponse ? 'Escribe aquí' : 'Indica el contexto de la conversación...'} value={context} onChange={handleContextChange} rows={3}></textarea>
                        </div>

                        <div className='option-area' style={{marginTop: "10px", display: "flex", alignItems: "center"}}>
                            <div className='behavior-buttons'>
                                <select id='role-select' className="rol-selector" value={selectedRole} onChange={handleRoleChange} disabled={roleLocked} 
                                style={{ marginRight: "10px"}}>
                                    <option value="">Selecciona un Rol</option>
                                    <option value="Jefe">Jefe</option>
                                    <option value="Entrevistador">Entrevistador</option>
                                    <option value="Cliente Enfadado">Cliente Enfadado</option>
                                    <option value="Interés Amoroso">Interés Amoroso</option>
                                    <option value="Vecino Molesto">Vecino Molesto</option>
                                </select>
                                {hasPremiumAccess ? behaviorsPremium : behaviors .map((behavior) => (
                                    <button
                                        key={behavior}
                                        onClick={() => handleBehaviorClick(behavior)}
                                        disabled={behaviorLocked}
                                        style={buttonStyle(behavior)}
                                    >
                                        {behavior}
                                    </button>
                                ))}
                            </div>

                            <div className='action-buttons'>
                                <button className={context ? "send_button_active" : "send_button"} disabled={context ? false : true} onClick={handleSendMessage}><IoSend /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatBox;
