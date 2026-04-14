import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Main.css'


function App() {

  const noteList = [
    {
      id: 1,
      title: 'Моя первая заметка',
      date: '2026-03-06',
      content: 'тестовая заметка для примера',
      background: ''
    },
    {
      id: 2,
      title: 'Моя вторая заметка',
      date: '2026-03-06',
      content: 'в этом массиве у нас объекты с несколькими полями, кторые мы будем потом менять, чтобы они не были захардкожены',
      background: ''
    },
    {
      id: 3,
      title: 'Моя третья заметка',
      date: '2026-03-06',
      content: 'также надо будет сделать выбор даты и генерацию id',
      background: '' 
    },
  ]

  //тут мы изначально смотрим, есть ли у нас вообще что то в localStorage
  const savedNotes = localStorage.getItem('notes');

  //тут мы проверяем, если в localStorage что то есть (savedNotes), то мы парсим это в JSON, а если нет, 
  // то используем стартовый noteList
  const initialNotes = savedNotes ? JSON.parse(savedNotes) : noteList;  

   //тут мы изначально смотрим, есть ли у нас вообще что то в localStorage
  const savedSorting = localStorage.getItem('sortNotes');

  //тут мы проверяем, если в localStorage что то есть (savedNotes), то мы парсим это в JSON, а если нет, 
  // то используем стартовый noteList
  const initialSorting = savedSorting ? JSON.parse(savedSorting) : true;  

  //это хук для состояния списка заметок. он принимает начальное значение 
  // (в данном случае у нас useState(noteList) это начальный список с заметками), 
  // а возвращает notes - текущее значение и setNotes - функцию для его обновления
  const [notes, setNotes] = useState(initialNotes);

  const [startDate, setStartDate] = useState(new Date());

  const [title, setTitle] = useState('');

  const [content, setContent] = useState('');

  const [background, setBackground] = useState('');

  const [editingId, setEditingId] = useState(null);

  const [sortNotes, setSortNotes] = useState(initialSorting);


   //здесь мы скопировали список notes ([...notes]), чтобы не изменять исходный массив напрямую 
  //(метод sort мутирует массив, а мы не должны мутировать состояние React).
  //переобразовали время в объект Date и сравнили их
  const sortedNotes = [...notes].sort((a, b) => {
    if (sortNotes) {
      return new Date(b.date) - new Date(a.date);
    } else {
      return new Date(a.date) - new Date(b.date);
    }
  });

  
  const addNote = (e) => {
    
    e.preventDefault();

    if (!isFormValid) return;

    if(editingId === null) {
      const newNote = {
        id: crypto.randomUUID(),
        title: title,
        date: startDate.toISOString(),
        content: content,
        background: background,
      }

      setNotes([...notes, newNote])
    } else {
      const updatedNotes = notes.map(note => 
        note.id === editingId ? { ...note, title, content, date: startDate.toISOString(), background} : note
      )

      setNotes(updatedNotes)
      setEditingId(null);
    }

    
    setTitle('')
    setContent('')
    setStartDate(new Date())
    setBackground('')

  }

  const removeNote = (id) => {

    if (window.confirm("Вы уверены?")) {
      setNotes(notes.filter(note => note.id !== id))
    }
  }

  useEffect(() => {
      localStorage.setItem('notes', JSON.stringify(notes));
    }, [notes]);


  useEffect(() => {
      localStorage.setItem('sortNotes', JSON.stringify(sortNotes));
    }, [sortNotes]);

  const editNote = (note) => {
    setEditingId(note.id)
    setTitle(note.title)
    setContent(note.content)
    setStartDate(new Date(note.date))
    setBackground(note.background)
  }
  

  //map - используется для трансформации массивов данных в списки JSX-элементов. 
  // он принимает аргумент note (это как в питоне for i in ...). 
  // в качестве id - обращаемся к note.is (в данном случае у нас есть это поле в массиве, 
  // если нет, то в аргумент лучше передавать index)
  const fullNotesList = sortedNotes.map((note) => (
    <div key={note.id} className="note-item" style={note.background ? { backgroundImage: `url(${note.background})`, backgroundSize: 'cover' } : {}}>
        <div className='btn-container'>
          <button onClick={() => removeNote(note.id)}>Удалить запись</button>
          <button onClick={() => editNote(note)}>Изменить запись</button>
        </div>
        
        <h3>{note.title}</h3>
        <p>{new Date(note.date).toLocaleDateString()}</p>
        <p>{note.content}</p>
    </div>
  ));

  const isFormValid = title.trim() !== '' && content.trim() !== '';

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      //FileReader - это встроенный в браузер (Web API) объект JavaScript, используемый для асинхронного чтения содержимого файлов 
      const reader = new FileReader()
      //onload - это функция, которая вызовется автоматически, когда файл будет прочитан.
      reader.onload = () => {
        setBackground(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setBackground('')
    }
  }

  return (
    <div className="notes-container">
      <h1>Заметки</h1>
      <form onSubmit={addNote} className='form-container'>
        <input required type="text" value={title} placeholder='Заголовок' onChange={(e) => setTitle(e.target.value)} />
        <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
        <textarea required type="text" value={content} placeholder='Текст заметки' onChange={(e) => setContent(e.target.value)} />
        <input type="file" accept="image/*" onChange={handleFileChange}></input>
        <button className={`add-note-btn ${!isFormValid ? 'not-allowed' : ''}`} type="submit" >{editingId ? 'Сохранить' : 'Добавить'} запись</button>
        {editingId && (
            <button type="button"  className='cancel-btn' onClick={() => {
              setEditingId(null);
              setTitle('');
              setContent('');
              setStartDate(new Date());
              setBackground('')
            }}>Отмена</button>
          )}
      </form>
      <div className='info-container'>
        <p>Создано заметок: {notes.length}</p>
        <button onClick={() => setSortNotes(prev => !prev)} >Сначала {sortNotes ? 'новые' : 'старые'}</button>
      </div>
      <div className='notes-list'>
        {fullNotesList}
      </div>
    </div>
  )
}

export default App
