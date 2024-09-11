const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const fetchUser = require("../middleware/fetchUser");
const Note = require('../models/Note');


// ROUTE 1 : Get all the notes using GET "/api/notes/fetchallnotes". Login required
router.get('/fetchallnotes', fetchUser, async (req, res) => {
    try{
        const notes = await Note.find({user : req.user.id})
        res.json(notes);
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error occured");
    }
})

// ROUTE 2 : Add a new note using POST "/api/notes/addnote". Login required
router.post('/addnote', fetchUser, [
    body('title', 'Enter a valid title: ').isLength({min: 5}), /* NAME VALIDATOR */
    body('description', 'Enter a description that is atleast 5 characters: ').isLength({min: 5}), /* PASSWORD VALIDATOR */
], async (req, res) => {
    try{
        const {title, description, tag} = req.body;

        // If errors exist, return Bad request
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            title, description, tag, user : req.user.id
        })

        const savedNote = await note.save();
        res.json(savedNote);
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error occured");
    }
})

// ROUTE 3 : Update an existing note using PUT "/api/notes/updatenote". Login required
router.put('/updatenote/:id', fetchUser, async (req, res) => {
    try{
        const {title, description, tag} = req.body;

        const newNote = {};

        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};

        // Find the note to be updated and update
        let note = await Note.findById(req.params.id);

        if(!note){return res.status(404).send("Not Found")}

        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed")
        }

        note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true})
        res.json({note});
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error occurred");
    }
})

// ROUTE 4 : Delete an existing note using DELETE "/api/notes/deletenote/:id". Login required
router.delete('/deletenote/:id', fetchUser, async (req, res) => {
    try {
        // Find the note to be deleted
        let note = await Note.findById(req.params.id);

        // If the note does not exist, return a 404 error
        if (!note) {
            return res.status(404).send("Note not found");
        }

        const noteUserId = note.user ? note.user.toString() : '';

        // Allow deletion only if the user owns this note
        if (noteUserId !== req.user.id) {
            return res.status(401).send("Not allowed to delete this note");
        }

        note = await Note.findByIdAndDelete(req.params.id);
        res.json({ message: "Note deleted successfully", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error occurred");
    }
});



module.exports = router