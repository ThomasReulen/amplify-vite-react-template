import React, { useEffect, useState } from "react";
import Recorder from "./Recorder.tsx";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'

const client = generateClient<Schema>();

function App() {

  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }
  
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  return (    
    <Authenticator>
      {({ signOut, user }) => (
    <main>          
        <div>
      <h1>{user?.signInDetails?.loginId}'s message</h1>      
      </div>          
      <Recorder transcribedText=""/>    
      
    </main>    
      )} 
    </Authenticator>
  );
}

export default App;
