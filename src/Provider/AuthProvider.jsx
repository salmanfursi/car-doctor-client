import { createContext, useEffect, useState } from "react";
import {  GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut} from "firebase/auth";
import app from "../Firebase/Firebase.config";



export const AuthContext = createContext()
const auth = getAuth(app)

const AuthProvider = ({ children }) => {
   const [user, setUser] = useState(null);
   const [loading, setLoading] = useState(true);
   const googleProvider =new GoogleAuthProvider();

   // console.log('user:',user);
   const createUser = (email, password) => {
      setLoading(true)
      return createUserWithEmailAndPassword(auth, email, password);
   }
   const signin = (email, password) => {
      setLoading(true)
      return signInWithEmailAndPassword(auth, email, password);
   }
   const googleSignin = () => {
      setLoading(true)
      return signInWithPopup(auth, googleProvider)

      
   }

   const logOut = ()=>{
      return signOut(auth)
   }


   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, currentUser => {
         setUser(currentUser);
         console.log("currentUser in auth provider",currentUser);
         setLoading(false)
         if(currentUser && currentUser.email){
            const loggedUser = {
               email: currentUser.email
            }
            fetch('https://car-doctor-server-fi13n92wu-salmanfursi.vercel.app/jwt', {
               method: 'POST',
               headers: { 'content-type': 'application/json' },
               body: JSON.stringify(loggedUser)
            })
               .then((res) => res.json())
               .then(data => {
                  console.log("jwt response", data);
                  //warning: local storage is not the best (second best place to store access token)
                  localStorage.setItem('car-access-token', data.token)
               })
         }
         else{ localStorage.removeItem('car-access-token')}

      });

      return () => {
         return unsubscribe()
      };

   }, [])

   const authInfo = {
      createUser, signin, loading, user,logOut,auth,googleSignin
   }
   return (
      <AuthContext.Provider value={authInfo}>
         {children}
      </AuthContext.Provider>
   );
};

export default AuthProvider;