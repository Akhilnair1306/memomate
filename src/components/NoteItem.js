import React, { useContext } from 'react';
import noteContext from '../context/notes/noteContext';

const NoteItem = (props) => {
    const context = useContext(noteContext);
    const { deletenote } = context;
    const { note, updateNote } = props;

    return (
        <div className='col-md-3'>
            {note && (
                <div className="card my-3">
                    <div className="card-body">
                        <h5 className="card-title">{note.title}</h5>
                        <p className="card-text">{note.description}</p>
                        <i className="fa-solid fa-trash mx-2" onClick={() => { deletenote(note._id); props.showAlert("DELETED SUCCESSFULLY","success")}}></i>
                        <i className="fa-solid fa-pen-to-square mx-4" onClick={() => { updateNote(note);  }}></i>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NoteItem;

