import { useEffect, useState, useRef } from 'react';
import { RiChatAiLine } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
//import OpenAI from 'openai';
import './styles/ChatBox.css';
import { useUser } from "@clerk/clerk-react";
import { initializeConversation, sendMessage, loadConversation, deleteConversation, checkAndUpdateLimits, updateLimits } from "../services/fireStoreService";
import logo from '../assets/qonverse-v2.svg';
import {  UserButton } from '@clerk/clerk-react';
import SubscriptionModal from './SubscriptionModal';
import icono from '../assets/icono_qonverse.svg';
import { Timestamp } from "firebase/firestore";

const ChatBox = () => {
    type Message = {
        sender: string;
        text: string;
        timestamp?: Date;
    };
    type Conversation = {
        id: string;
        behavior?: string;
        role?: string;
        messages: ChatMessage[];
    };
    type ChatMessage = {
        user: string;
        ai: string;
        timestamp: Timestamp;
    };
    type Chat = {
        id: string;
        behavior?: string;
        role?: string;
        messages: ChatMessage[];
        createdAt?: Timestamp;
    };

    const [selectedRole, setSelectedRole] = useState("")
    const [context, setContext] = useState("")
    const [selectedBehavior, setSelectedBehavior] = useState("")
    const [messages, setMessages] = useState<Message[]>([]);
    const [roleLocked, setRoleLocked] = useState(false)
    const [behaviorLocked, setBehaviorLocked] = useState(false)
    const [conversationId, setConversationId] = useState<string | "">("")
    const {user} = useUser()
    const [hasPremiumAccess, setHasPremiumAccess] = useState(false)
    const [chats, setChats] = useState<Chat[]>([])
    const [initialContext, setInitialContext] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)
    const [loadingResponde, setLoadingResponse] = useState(false)
    const [typingMessage, setTypingMessage] = useState<string | null>(null)

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
        if (!userId) return;

        const { canStartConversation, canSendMessage } = await checkAndUpdateLimits(userId, conversationId);
        if (!canStartConversation) {
            alert("Has alcanzado el límite de 3 conversaciones por día.");
            return;
        }
        if (!canSendMessage) {
            alert("Has alcanzado el límite de mensajes en esta conversación.");
            return;
        }

        if (selectedBehavior && selectedRole && context.trim()) {
            const userMessage = { sender: "Tú", text: context };
            setMessages((prev) => [...prev, userMessage]);
            setContext("");
            setLoadingResponse(true);

            // Llamada segura al backend con el prompt
            const response = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                context,
                selectedRole,
                selectedBehavior,
                initialContext,
                recentMessages: messages.slice(-3)
            })
            });

            const data = await response.json();
            const airesponse = data.response || "❌ No se pudo obtener respuesta.";

            if (!roleLocked) {
            await startNewConversation(userId, selectedRole, selectedBehavior, airesponse);
            await updateLimits(userId, conversationId, true);
            setInitialContext(context); // Guardamos el primer contexto
            } else {
            await sendMessage(userId, conversationId, context, airesponse);
            await updateLimits(userId, conversationId, false);
            await handleLoadConversations();
            }

            simulateTyping(airesponse, `${selectedRole} (${selectedBehavior})`);
            setLoadingResponse(false);
            setRoleLocked(true);
            setBehaviorLocked(true);
        } else {
            alert("Debes seleccionar un rol y un comportamiento");
        }
    };


    const handleLoadConversations = async () => {
        if (user){
            setChats(await loadConversation(user?.primaryEmailAddress?.emailAddress as string));
        }
    }

    const handleLoadChat = async (chatId: string) => {
        setContext("")
        const convers: Conversation[]  =  await loadConversation(user?.primaryEmailAddress?.emailAddress as string);
        const selectedConver = convers.find(chat => chat.id === chatId)
        const selectedConverId = selectedConver?.id
        
        if(selectedConverId){
            setConversationId(selectedConverId);
        }
        
        if(selectedConver){
            setInitialContext(selectedConver?.messages[0].user)
        } 
        
        if (selectedConver){
            const behavior = selectedConver.behavior;
            const rol = selectedConver.role
            if (rol){
                setSelectedRole(rol)
            }
            if (behavior){
                setSelectedBehavior(behavior)
            }
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

    const displayedMessages = loadingResponde
    ? [...messages, { sender: "IA", text: "Generando respuesta" }]
    : messages;

    const simulateTyping = (fullText: string, sender: string) => {
        let index = 0
        setTypingMessage("")

        const interval = setInterval(() => {
            setTypingMessage((prev) => (prev ?? "") + fullText.charAt(index))
            index++
            
            if (index >= fullText.length){
                clearInterval(interval)
                setTypingMessage(null)
                setMessages((prev) => [...prev, {sender, text: fullText}])
            }
        }, 40)
    }

    const groupChatsByDate = (chats: Chat[]) => {
        const groups: {[date: string]: Chat[]} = {}

        chats.forEach((chat) => {
            const date = chat.createdAt?.toDate?.()
                ? chat.createdAt.toDate().toLocaleDateString("es-ES")
                : "Sin fecha"

            if(!groups[date]){
                groups[date] = []
            }
            groups[date].push(chat)
        })

        return groups
    }

    const groupedChats = groupChatsByDate(chats)

    const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if(event.key === "Enter" && !event.shiftKey) {
            event.preventDefault() // Evita el salto de línea
            if(context.trim() !== ""){
                handleSendMessage()
            }
        }
    }

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
                                {Object.entries(groupedChats).length > 0 ? (
                                    Object.entries(groupedChats).map(([date, chats]) => (
                                        <div key={date}>
                                            <div className='date-separator'>{date}</div>
                                            {chats.map((chat) => (
                                                <div key={chat.id} className={`history_chats ${conversationId === chat.id ? 'selected_chat' : ''}`}>
                                                    <button className='button_history_chats' onClick={() => handleLoadChat(chat.id)} title={chat.messages.length > 0 ? chat.messages[0].user : "Sin mensajes"}>
                                                        {chat.messages.length > 0 ? chat.messages[0].user : "Sin mensajes"}
                                                    </button>
                                                    <button className='button_settings_chat' onClick={() => handleDeleteChat(chat.id)}>
                                                        <RiDeleteBinLine />
                                                    </button>
                                                </div>
                                            ))}
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
                        {displayedMessages.map((message, index) => (
                            <div className='message-line'>
                                <div key={index} className={message.sender === "Tú" ? 'user-message' : 'ai-message'}>
                                    <div className='message-pack-1' style={{display: "flex", alignItems: "flex-start"}}>
                                        {message.sender !== "Tú" && (
                                            <img
                                                className="icon_logo"
                                                src={icono}
                                                alt="Qonverse Icon"
                                            />
                                        )}
                                        <div className='message-pack-2'>
                                            <p>
                                                {message.text === "Generando respuesta" ? (
                                                    <>
                                                        <span className="spinner"></span> {message.text}
                                                    </>
                                                ) : ( message.text
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {typingMessage !== null && (
                            <div className='message-line'>
                                <div className='ai-message'>
                                <div className='message-pack-1' style={{ display: "flex", alignItems: "flex-start" }}>
                                    <img className="icon_logo" src={icono} alt="Qonverse Icon" />
                                    <div className='message-pack-2'>
                                        <p>{typingMessage}</p>
                                    </div>
                                </div>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef}></div>
                    </div>
                    <div className='chat-area'>
                        <div className='select-role'>
                            
                        </div>

                        <div className='text-area'>
                            <textarea 
                            className='place-holder' 
                            placeholder={roleLocked ? 'Escribe aquí' : 'Indica el contexto de la conversación...'} 
                            value={context} 
                            onChange={handleContextChange} 
                            onKeyDown={handleKeyPress}
                            rows={3}
                            ></textarea>
                        </div>

                        <div className='option-area' style={{marginTop: "10px", display: "flex", alignItems: "center"}}>
                            <div className='behavior-buttons'>
                                <select id='role-select' className={roleLocked ? "rol-selector_locked" : "rol-selector"} value={selectedRole} onChange={handleRoleChange} disabled={roleLocked} 
                                style={{ marginRight: "10px"}}>
                                    <option value="">Selecciona un Rol</option>
                                    <option value="Jefe">Jefe</option>
                                    <option value="Entrevistador">Entrevistador</option>
                                    <option value="Cliente Enfadado">Cliente Enfadado</option>
                                    <option value="Interés Amoroso">Interés Amoroso</option>
                                    <option value="Vecino Molesto">Vecino Molesto</option>
                                    {
                                        hasPremiumAccess && (
                                            <>
                                            <option value="Amigo">Amigo</option>
                                            <option value="Familiar">Familiar</option>
                                            <option value="Profesor">Profesor</option>
                                            <option value="Mentor">Mentor</option>
                                            </>
                                        )
                                    }
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
