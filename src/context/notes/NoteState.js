import { useState } from "react";
import NoteContext from "./NoteContext";


const NoteState = (props) => {
    const host = "http://localhost:4500/"

    const notesInitial = []

    const [notes, setNotes] = useState(notesInitial);



    // Get All Notes
    const getNotes = async () => {
        const response = await fetch(`${host}api/notes/fetchallnotes`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "auth-token": localStorage.getItem('token')
            }
        });
        const json = await response.json(); // Fixed the placement of this line
        setNotes(json)
    };


        // Add a Note
        const addNote = async (title, description, tag) => {
            const response = await fetch(`${host}api/notes/addnote`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
                body: JSON.stringify({ title, description, tag })
                
            });
            const note = await response.json()
            setNotes(notes.concat(note))
        }

        // Delete a Note
        const deleteNote = async (id) => {
            const response = await fetch(`${host}api/notes/deleteNote/${id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
            });
            const json = response.json()

            const newNotes = notes.filter((note) => { return note._id !== id })
            setNotes(newNotes)
        }

        let newNotes = JSON.parse(JSON.stringify(notes))
        // Edit a Note
        const editNote = async (id, title, description, tag) => {
            // API Call
            const response = await fetch(`${host}api/notes/updatenote/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": localStorage.getItem('token')
                },
                body: JSON.stringify({ title, description, tag })
            });
            const json = await response.json();



            for (let i = 0; i < newNotes.length; i++) {
                const element = newNotes[i];
                // Logic to edit in client
                if (element._id === id) {
                    newNotes[i].title = title;
                    newNotes[i].description = description;
                    newNotes[i].tag = tag;
                    break;
                }
            }
            setNotes(newNotes)
        }

        return (
            <NoteContext.Provider value={{ notes, setNotes, editNote, deleteNote, addNote, getNotes }}>
                {props.children}
            </NoteContext.Provider>
        );
    };


export default NoteState;