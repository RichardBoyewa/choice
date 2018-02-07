let {
  GraphQLString,
  GraphQLNonNull,
  GraphQLInt,
  GraphQLInputObjectType,
  GraphQLObjectType,
} = require('graphql');


const OptionType = new GraphQLObjectType({
  name: "Option",
  description: "This type represents an Option for a test",
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLString)},
    label: {type: new GraphQLNonNull(GraphQLString)},
    weight: {type: new GraphQLNonNull(GraphQLInt)}
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