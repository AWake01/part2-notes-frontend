import { useState, useEffect, useRef } from 'react'
import Note from './components/Note'
import Footer from './components/Footer'
//import Notification from './components/Notification'
import LoginForm from './components/LoginForm'
import NoteForm from './components/NoteForm'
import Togglable from './components/Togglable'
import noteService from './services/noteService'
import loginService from './services/loginService'

const App = () => {
  const [notes, setNotes] = useState([])
  //const [newNote, setNewNote] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [username, setUsername] = useState('')
  const [password, setPasssword] = useState('')
  const [user, setUser] = useState(null)
  const [loginVisible, setLoginVisible] = useState(false)

  const noteFormRef = useRef()

  useEffect(() => {
    noteService.getAll().then((initialNotes) => {
      setNotes(initialNotes)
    })
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedNoteappUser')
    if(loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      noteService.setToken(user.token)
    }
  }, [])

  const addNote = (noteObject) => {
    console.log(noteFormRef)
    noteFormRef.current.toggleVisibility()
    noteService.create(noteObject).then((returnedNote) => {
      setNotes(notes.concat(returnedNote))
    })
  }

  const toggleImportanceOf = (id) => {
    const note = notes.find((n) => n.id === id)
    const changedNote = { ...note, important: !note.important }

    noteService
      .update(id, changedNote)
      .then((returnedNote) => {
        setNotes(notes.map((note) => (note.id !== id ? note : returnedNote)))
      })
      .catch((error) => {
        setErrorMessage(`the note '${note.content}' was already deleted from server`)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setNotes(notes.filter((n) => n.id !== id))
      })
  }

  // const handleNoteChange = (event) => {
  //   setNewNote(event.target.value)
  // }

  const notesToShow = showAll ? notes : notes.filter((note) => note.important)

  const handleLogin = async (event) => {
    event.preventDefault()
    console.log('Logging in with', username, password)

    try {
      const user =  await loginService.login({ username, password, })

      window.localStorage.setItem('loggedNoteappUser', JSON.stringify(user))
      noteService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPasssword('')
    } catch (exception) {
      setErrorMessage('Wrong credidentials')
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  const noteForm = () => (
    <Togglable buttonLabel="newNote" ref={noteFormRef}>
      <NoteForm createNote={addNote}/>
    </Togglable>
  )

  const loginForm = () => (
    <Togglable buttonLabel="login">
      <LoginForm
        username={username}
        password={password}
        handleUsernameChange={({ target }) => setUsername(target.value)}
        handlePasswordChange={({ target }) => setPasssword(target.value)}
        handleSubmit={handleLogin}
      />
    </Togglable>
  )

  return (
    <div>
      <h1>Notes</h1>
      <Notification message={errorMessage}></Notification>

      {/* Conditional rendering of forms
      {user === null ? loginForm() :
        <div>
          <p>{user.name} logged-in</p>
          {noteForm()}
        </div>
      } */}

      {!user && loginForm()}
      {user && <div>
        <p>{user.name} logged in</p>
        <Togglable buttonLabel="new note" ref={noteFormRef}>
          <NoteForm createNote={addNote}/>
        </Togglable>
      </div>
      }

      <div>
        <button onClick={() => setShowAll(!showAll)}>
          show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul className='note'>
        {notesToShow.map((note) => (
          <Note
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportanceOf(note.id)}
          />
        ))}
      </ul>
      <Footer/>
    </div>
  )
}

const Notification = ({ message }) => {
  if(message === null){
    return null
  }

  return (
    <div className='error'>
      {message}
    </div>
  )
}

export default App
