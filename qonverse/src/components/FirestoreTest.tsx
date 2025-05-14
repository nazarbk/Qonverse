import React, {useEffect} from "react";
import {firestore} from "./firebase";
import {collection, doc, setDoc, getDoc} from "firebase/firestore";
import {useUser} from "@clerk/clerk-react";

const FirestoreTest = () => {
    const {user} = useUser()
    
    useEffect(() => {
    if (user){
        console.log("Correo del usuario: ", user.primaryEmailAddress?.emailAddress);
        testFirestore(user.primaryEmailAddress?.emailAddress);
    }
    }, [user]);

    const testFirestore = async (userId) => {
        try {
            const userDocRef = doc(firestore, "conversations", userId);
            await setDoc(userDocRef, {test: "Conexión Exitosa"}, {merge: true});

            const docSnap = await getDoc(userDocRef);
            console.log("Contenido del Documento:", docSnap.data());
        }catch(error){
            console.error("Error conectando a Firestore: ", error);
        }
    };

    return (
        <div>
            <h2>Prueba de Conexión a Firestore</h2>
        </div>
    );
};

export default FirestoreTest;