import { signInWithPopup } from 'firebase/auth';
import { doc, updateDoc, getDoc, onSnapshot, setDoc, deleteField, Timestamp,arrayUnion, arrayRemove } from 'firebase/firestore';
import './App.css';
import { auth,provider,db } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth'
import { useEffect, useState } from 'react';
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
function App() {
  const [user] = useAuthState(auth);//コレクション
  const [todos,setTodos] = useState([]);
  const [newTodo,setNewTodo] =useState('');
  
  





  useEffect(()=> {
    if(user){
      const userRef = doc(db,'user',user.uid);
      getDoc(userRef).then((docSnap) => {
        if(!docSnap.exists()){//新規の人なら以下を作る
          setDoc(userRef, { displayName: user.displayName, email: user.email, todos: [] })
        }
        console.log(docSnap.data())
      }).catch(() => {
        console.log('error');
      })
      //データがある人なら
      const unsubscribe = onSnapshot(userRef,(docSnap) => {
        const todoData = Array.isArray(docSnap.data().todos) ? docSnap.data().todos : [docSnap.data().todos];
        const sortedTodos = todoData.sort((a, b) => a.createdAt - b.createdAt);
        setTodos(sortedTodos);
        console.log(sortedTodos)
      })
      return () => unsubscribe();
    }else{
      setTodos([]);
      return
    }

  },[user])



  const handleAdd = async() => {
    try{
      if(newTodo.trim() && user){
        const userRef = doc(db,'user',user.uid);
        const priority = document.getElementById('prioritySelect').value; // 追加
        const newTodoObj = {  id: Date.now(), text: newTodo,completed: false, timestamp:Timestamp.now(),priority:priority }
        console.log(newTodoObj.timestamp)
         await updateDoc(userRef,{
          todos:arrayUnion(newTodoObj)
        })
        // console.log(newTodoObj)
        setNewTodo('')
       
    }
  }catch(error){
    console.log('送信失敗', error);
    
    }
  }
  //handleAddでやらなきゃいけないのは保存と表示保存したのを移せばいいから保存を考えよ
  //保存の場合今回はtodos:{todos}なのでtodosをdbで保存してあげられればいいのかな？setDocを行う必要があるのかなここまでしか想像できない
  //コレクション=> ドキュメント => フィールドがある

  const handleText = (e) => {
    setNewTodo(e.target.value)
  }



  const handleToggle = async(todoId) => {
    const userRef = doc(db,'user',user.uid)
    const updatedTodos =  todos.map((todo) => 
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo 
    )
  
    await updateDoc(userRef,{todos:updatedTodos});
    
    
  }
  
  
  
    
  

  const handleDelete = async(todoId) => {
    if(user){
      const userRef = doc(db,'user',user.uid);
      try{
      const docSnap = await getDoc(userRef);
      const currentTodos = docSnap.data().todos || [];

    
        const updatedTodos = currentTodos.filter((todo) => todo.id!== todoId);
        await updateDoc(userRef,{ todos:updatedTodos })
       
      }catch(error){
        console.log(`送信失敗${error}`);
        console,log('変更した');
      }
      

    }
    

  }
  const handleDeleteAll = async() => {
    const userRef =doc(db,"user",user.uid)
    const deleteAll  = todos.filter(todo => !todo.completed);
    await updateDoc(userRef, { todos: deleteAll });
  }







  const highPriority = todos.filter(todo => todo.priority === "最優先");
  const mediumPriority = todos.filter(todo => todo.priority === "優先");
  const lowPriority = todos.filter(todo => todo.priority === "後回し");
 
  return (
   <>
   {user ? (
    <div>
    
     <footer id='footer'>
     <h1>{user.displayName}さんのTodolist</h1>
     </footer>


  <main id='main-background'>
  <h2>Todolist</h2>

  <fieldset id='highPriority' >
    {/* 最優先 */}
    <legend>最優先</legend>
    <DndContext onDragEnd={(event) => console.log(event)}>

      <DraggableTodo/>
    
      <ul>{highPriority.map((todo) => (
        <li key={todo.id}>
          <input 
          type="checkbox" 
          checked={todo.completed}
          onChange={() => handleToggle(todo.id)} />
          <span>{todo.text}[{todo.priority}]</span>
          <button onClick={() => handleDelete(todo.id)} id='delete'>削除</button>
        </li>
      ))}</ul>
     <DraggableTodo/>
    </DndContext>
   
  </fieldset>










  <fieldset>
  <legend>優先</legend>
  <div>
  <ul>{mediumPriority.map((todo) => (
      <li key={todo.id}>
        <input 
        type="checkbox" 
        checked={todo.completed}
        onChange={() => handleToggle(todo.id)} />
        <label>{todo.text}[{todo.priority}]</label>

        <button onClick={() => handleDelete(todo.id)} id='delete'>削除</button>
      </li>
    ))}</ul>
  </div>
  </fieldset>
 



<fieldset>
<legend>後回し</legend>
  <div>
  <ul>{lowPriority.map((todo) => (
      <li key={todo.id}>
        <input 
        type="checkbox" 
        checked={todo.completed}
        onChange={() => handleToggle(todo.id)} />
        <label>{todo.text}[{todo.priority}]</label>
        <button onClick={() => handleDelete(todo.id)} id='delete'>削除</button>
      </li>
    ))}</ul>
  </div>
</fieldset>
<div id='addText'>
      <input type="text" onChange={handleText}  value={newTodo} id='textAdd'/>
      <button onClick={handleAdd} id='buttonAdd'>追加</button>
      <select name="" id="prioritySelect">
        <option value="最優先">最優先</option>
        <option value="優先" >優先</option>
        <option value="後回し" >後回し</option>
      </select>
      <button onClick={handleDeleteAll}>完了タスク削除</button>
    </div>
  </main>
  
       <SignOutButton />
    </div>
    
   ):(
    <SignInButton />
   )}
   </>
  );
}


export default App;
function DraggableTodo({todo}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: "todo-${todo.id}" });
  if (!todo || !todo.text) {
    return null; // todoが無効な場合はnullを返すか、代わりのコンポーネントを表示
  }
  
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        width: 100, height: 100, background: "lightblue", margin: 10,
        transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      }}
    >
           {todo.text} [{todo.priority}]
    </div>
  );
}

function Droppable() {
  const { setNodeRef } = useDroppable({ id: "droppable" });
  return (
    <div ref={setNodeRef} style={{ width: 200, height: 200, background: "lightgray", margin: 10 }}>
      Drop here
    </div>
  );
}

function  SignInButton() {
  const GooleSignInButton = async() =>{
    try{
      await signInWithPopup(auth,provider)
      console.log(`成功`)
    } catch(error){
      console.log(`失敗${error}`);
    }
  }
  return(

    <>
    <button onClick={GooleSignInButton}>Googleサインいんボタン</button>
   

    </>
  )
}
function SignOutButton(){
  
  return(
    <>
    <button onClick={() => auth.signOut()}>Googleサインアウトボタン</button>
    
    </>
  )
}
