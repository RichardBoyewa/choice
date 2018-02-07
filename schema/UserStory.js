let {
  GraphQLString,
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
} = require('graphql');
let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let {UserModel, UserType} = require ('./Test')



let UserStorySchema = new Schema({
  name: String,
  description: String,
  points: Number,
  assignees: [Schema.Types.ObjectId]
});

const UserStoryType = new GraphQLObjectType({
  name: "UserStory",
  description: "This type represents a User Story",
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLString)},
    name: {type: new GraphQLNonNull(GraphQLString)},
    description: {type: GraphQLString},
    assignees: {
      type: new GraphQLList(UserType),
      resolve: function(UserStory) {
        return UserModel.find({_id: UserStory.assignees})
      }
    }
  })
});

module.exports = {
  UserStoryModel: mongoose.model('UserStory', UserStorySchema),
  UserStoryType: UserStoryType
}