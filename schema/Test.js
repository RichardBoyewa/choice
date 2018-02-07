const {
  GraphQLList,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInputObjectType,
  GraphQLObjectType,
} = require('graphql');
const { OptionType, OptionInputType } = require ('./Option')
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TestSchema = new Schema({
  name: String,
  options: [
    {
      label: String,
      weight: Number
    }
  ]
});

const TestType = new GraphQLObjectType({
  name: "Test",
  description: "This type represents a Test",
  fields: () => ({
    id: {type: new GraphQLNonNull(GraphQLString)},
    name: {type: new GraphQLNonNull(GraphQLString)},
    options: {type: new GraphQLList(OptionType)}
  })
});

const TestInputType = new GraphQLInputObjectType({
  name: 'TestInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    options: {type: new GraphQLList(OptionInputType)}
  })
});

const TestMutationType = new GraphQLObjectType({
  name: "TestMutations",
  description: "Tests Mutations",
  fields: () => ({
    addTest: {
      type: TestType,
      description: 'Create a new test',
      args: {
        test: { type: TestInputType }
      },
      resolve: (value, { test }) => {
        const model = mongoose.model('Test', TestSchema)
        return new model(test).save();
      }
    }
  })
})

module.exports = {
  TestModel: mongoose.model('Test', TestSchema),
  TestType: TestType,
  TestInputType: TestInputType,
  TestMutationType: TestMutationType
}