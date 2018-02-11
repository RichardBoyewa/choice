const {
  GraphQLNonNull,
  GraphQLString,
  GraphQLObjectType,
  GraphQLInt,
} = require('graphql');
const { OptionType, OptionInputType } = require ('./Option')
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StatisticSchema = new Schema({
  optionId: Schema.Types.ObjectId,
  decisionCount: Number,
  displayCount: Number,
  conversionCount: Number
});

const StatisticModel = mongoose.model('Statistic', StatisticSchema)

const StatisticType = new GraphQLObjectType({
  name: "Statistic",
  description: "This type represents a Statistic",
  fields: () => ({
    optionId: {type: new GraphQLNonNull(GraphQLString)},
    decisionCount: {type: new GraphQLNonNull(GraphQLInt)},
    displayCount: {type: new GraphQLNonNull(GraphQLInt)},
    conversionCount: {type: new GraphQLNonNull(GraphQLInt)}
  })
});


module.exports = {
  StatisticModel: StatisticModel,
  StatisticType: StatisticType
}