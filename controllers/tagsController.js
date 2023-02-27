const tagsSchema = require('../models/tags');
const todoSchema = require('../models/todo')

exports.addTags = async(req,res) => {
  const userId = req.body._id;
 delete req.body._id;
 const add = req.body;

 try {
      const addr = await tagsSchema(add).save();
      console.log(addr,'--->>')
      const data = await todoSchema.findOne({ _id: userId });
      console.log(data,'===<<')
      data.selectedTags.push(addr);
      await data.save();
      console.log(data,'=====<<<')
    return res.status(200).json({
        message: 'item added successfully. ',
        savedData: ({tag_Id:data._id})
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

exports.showTag = async(req,res) =>{
    try{
        const showTag = await tagsSchema.find().select('-updatedAt -__v')
        return res.status(200).json({
            message: 'Tag' ,
            allTags: showTag
          });
        } catch (error) {
          res.status(400).json({ message: error.message });
        }
}

exports.updateTag = async(req,res)=>{
    try {
        const Id = req.query._id;
        const updateTag = await tagsSchema.findById(Id).select('-updatedAt -__v')
        return res.status(200).json({
            message: "tag updated successfully. ",
            updatedTag: updateTag
          });
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.deleteTag = async(req,res)=>{
    try {
        const Id = req.query._id;
        const deleteTag = await tagsSchema.findByIdAndDelete(Id)
        return res.status(200).json({
            message: "tag deleted successfully. ",
            deletedTag: deleteTag._id
          });
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}