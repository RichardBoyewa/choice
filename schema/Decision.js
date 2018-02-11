const {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLObjectType,
} = require('graphql');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { OptionType } = require ('./Option')
const uuid = require ('uuid/v4')

const DecisionSchema = new Schema({
  uuid: String,
  testId: Schema.Types.ObjectId,
  testName: String,
  selectedOption: {}
});

DecisionSchema.index({ uuid: 1, testId: 1 });

DecisionSchema.pre('save', function(next) {
  this.uuid = this.uuid || uuid()
  next()
});


const DecisionModel = mongoose.model('Decision', DecisionSchema)

const DecisionType = new GraphQLObjectType({
  name: "Decision",
  description: "This type represents a decision taken by Choice",
  fields: () => ({
    uuid: {type: new GraphQLNonNull(GraphQLString)},
    testId: {type: new GraphQLNonNull(GraphQLString)},
    testName: {type: new GraphQLNonNull(GraphQLString)},
    selectedOption: {type: OptionType},
  })
});


module.exports = {
  DecisionModel: DecisionModel,
  DecisionType: DecisionType
}