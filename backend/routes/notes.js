const express = require ('express');
const router  = express.Router();
var fetchuser = require('../middleware/fetchuser');
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const User = require('../models/User');

//Route 1: Get all the notes
router.get('/fetchallnotes',fetchuser, async(req,res)=> {
    const notes = await Note.find({user: req.user.id});
    res.json(notes)
})

//Route 1: Add the notes
router.post('/addnotes',fetchuser,[
    body('title','Enter a valid name').isLength({min: 3}),
    body('description','Description must be atleast 5 characters').isLength({min: 5}),
], async(req,res)=> {
    try {
        
    const {title,description, tag} = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }

    const note = new Note({
            title,description, tag, user: req.user.id
    })
    const savedNote= await note.save()
    res.json(savedNote)
}
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error occured");
    }
})

//ROUTE 3: Update an Existing Note
router.put('/updatenote/:id',fetchuser, async(req,res)=> {
    try {
    const{title,description, tag} = req.body;
    const newNote = {};
    if(title)
        {newNote.title = title};
    if(description)
        {newNote.description = description};
    if(tag)
        {newNote.tag = tag};

    //Find the Note to be updated

    let note = await Note.findById(req.params.id);
    if(!note){res.status(404).send("Not found")}

    if(note.user.toString() !== req.user.id)
        {
            return res.status(401).send("Not Allowed");
        }

    note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
    res.json({note});
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error occured");
    }
})

//Route 4: Delete Note
router.delete('/delnote/:id',fetchuser, async(req,res)=> {
    try {
    const{title,description, tag} = req.body;
   

    //Find the Note to be deleted

    let note = await Note.findById(req.params.id);
    if(!note){res.status(404).send("Not found")}

    //allow deletion
    if(note.user.toString() !== req.user.id)
        {
            return res.status(401).send("Not Allowed");
        }

    note = await Note.findByIdAndDelete(req.params.id)
    res.json({"eureka":"yess"});
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some Error occured");
    }
})


module.exports = router