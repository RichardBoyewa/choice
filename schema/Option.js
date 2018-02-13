let {
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLObjectType,
} = require('graphql');

const { StatisticModel } = require('./Statistic');

const OptionType = new GraphQLObjectType({
  name: "Option",
  description: "This type represents an Option for a test",
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLString)},
    label: {type: new GraphQLNonNull(GraphQLString)},
    weight: {type: new GraphQLNonNull(GraphQLInt)},
    elected: {type: new GraphQLNonNull(GraphQLBoolean)},
    decisionCount: {
      type: GraphQLInt,
      resolve: async (option) => {
        const stat = await StatisticModel.findOne({optionId: option._id})
        return stat.decisionCount
      }
    },
    displayCount: {
      type: GraphQLInt,
      resolve: async (option) => {
        const stat = await StatisticModel.findOne({optionId: option._id})
        return stat.displayCount
      }
    },
   conversionCount: {
      type: GraphQLInt,
      resolve: async (option) => {
        const stat = await StatisticModel.findOne({optionId: option._id})
        return stat.conversionCount
      }
    }
  })
});

const OptionInputType = new GraphQLInputObjectType({
  name: "OptionInput",
  description: "This type represents an input type for option",
  fields: () => ({
    label: {type: new GraphQLNonNull(GraphQLString)},
    weight: {type: new GraphQLNonNull(GraphQLInt)}
  })
});

module.exports = {
  OptionType: OptionType,
  OptionInputType: OptionInputType,
}