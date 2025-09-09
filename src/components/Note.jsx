const Note = ({ note, toggleImportance }) => {
  const label = note.important ? 'make not important' : 'make important'

  return (
    <li className='note'>
      {note.content}
      <button onClick={toggleImportance}>{label}</button>
      <button onClick={toggleImportance}>cancel</button>
    </li>
  )
}

export default Note
